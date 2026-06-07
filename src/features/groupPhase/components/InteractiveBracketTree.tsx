import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, Link2, Loader2, Minus, Plus, RotateCcw } from 'lucide-react'
import { TeamFlag } from '../../../components/ui/TeamFlag'
import { BRACKET_SHARE_MESSAGE, bracketShareMessage } from '../../../lib/appRoutes'
import {
  getBracketColumns,
  getChampion,
  pickBracketWinner,
  resolveBracketMatch,
  type BracketPickState,
} from '../bracketEngine'
import { downloadBracketImage } from '../exportBracket'
import type { ClassifiedTeam } from '../types'

interface InteractiveBracketTreeProps {
  state: BracketPickState
  onStateChange: (state: BracketPickState) => void
}

const CELL_W = 'w-[4.75rem]'
const CELL_H = 'h-[1.65rem]'

const BRACKET_FLAG_W = 34
const BRACKET_FLAG_H = 23

function BracketFlag({
  team,
  dimmed = false,
  className = '',
}: {
  team: ClassifiedTeam['team']
  dimmed?: boolean
  className?: string
}) {
  return (
    <TeamFlag
      teamCode={team.code}
      flagEmoji={team.flagEmoji}
      size="sm"
      width={BRACKET_FLAG_W}
      height={BRACKET_FLAG_H}
      loading="eager"
      className={`shrink-0 shadow-none transition ${dimmed ? 'grayscale opacity-45' : ''} ${className}`}
    />
  )
}

type TeamCellVariant = 'pickable' | 'winner' | 'loser' | 'waiting'

function BracketTeamCell({
  team,
  variant,
  onClick,
}: {
  team: ClassifiedTeam
  variant: TeamCellVariant
  onClick?: () => void
}) {
  const isLoser = variant === 'loser'
  const isWinner = variant === 'winner'
  const isWaiting = variant === 'waiting'
  const isInteractive = variant !== 'waiting' && onClick

  const shellClass = isLoser
    ? 'border-stone-200 bg-stone-100/90 opacity-75'
    : isWinner
      ? 'border-emerald-500/70 bg-white shadow-sm shadow-emerald-500/10'
      : isWaiting
        ? 'border-stone-200 bg-stone-50'
        : 'border-stone-200 bg-white hover:border-[#6b00ff]/50 hover:bg-[#6b00ff]/5'

  const flagBgClass = isLoser
    ? 'bg-stone-200/60'
    : isWinner
      ? 'bg-emerald-50/60'
      : isWaiting
        ? 'bg-stone-100/80'
        : 'bg-stone-50/80'

  const codeClass = isLoser
    ? 'text-stone-400'
    : isWinner
      ? 'text-emerald-900'
      : isWaiting
        ? 'text-stone-400'
        : 'text-stone-800'

  const content = (
    <>
      <div className={`flex min-w-0 flex-1 items-center justify-center ${flagBgClass}`}>
        <BracketFlag team={team.team} dimmed={isLoser} />
      </div>
      <span
        className={`flex w-[1.35rem] shrink-0 items-center justify-center text-[8px] font-black uppercase tracking-tight ${codeClass}`}
      >
        {team.team.code}
      </span>
    </>
  )

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${CELL_W} ${CELL_H} flex overflow-hidden rounded border text-left transition active:scale-[0.98] ${shellClass}`}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={`${CELL_W} ${CELL_H} flex overflow-hidden rounded border ${shellClass}`}>
      {content}
    </div>
  )
}

function GhostSlot() {
  return (
    <div
      className={`${CELL_W} ${CELL_H} rounded border border-dashed border-stone-200 bg-stone-50/90`}
    />
  )
}

function teamVariant(
  team: ClassifiedTeam,
  winner: ClassifiedTeam | null,
): TeamCellVariant {
  if (!winner) return 'pickable'
  return winner.team.code === team.team.code ? 'winner' : 'loser'
}

function BracketMatchCell({
  state,
  matchId,
  onPick,
}: {
  state: BracketPickState
  matchId: string
  onPick: (matchId: string, teamCode: string) => void
}) {
  const match = resolveBracketMatch(state, matchId)
  const { home, away, winner } = match

  if (home && away) {
    return (
      <div className={`${CELL_W} flex shrink-0 flex-col gap-0.5`}>
        <BracketTeamCell
          team={home}
          variant={teamVariant(home, winner)}
          onClick={() => onPick(matchId, home.team.code)}
        />
        <BracketTeamCell
          team={away}
          variant={teamVariant(away, winner)}
          onClick={() => onPick(matchId, away.team.code)}
        />
      </div>
    )
  }

  return (
    <div className={`${CELL_W} flex shrink-0 flex-col gap-0.5`}>
      {home ? (
        <BracketTeamCell team={home} variant="waiting" />
      ) : (
        <GhostSlot />
      )}
      {away ? (
        <BracketTeamCell team={away} variant="waiting" />
      ) : (
        <GhostSlot />
      )}
    </div>
  )
}

const BRACKET_GRID_ROWS = 8
/** 2 equipos (1.65rem c/u) + gap + bordes — altura mínima por fila del grid. */
const BRACKET_ROW_MIN_PX = 58
const BRACKET_SLOT_HEIGHT = BRACKET_ROW_MIN_PX * BRACKET_GRID_ROWS

function BracketGridColumn({
  title,
  matchIds,
  state,
  onPick,
  slotHeight,
}: {
  title: string
  matchIds: string[]
  state: BracketPickState
  onPick: (matchId: string, teamCode: string) => void
  slotHeight: number
}) {
  const rowSpan = BRACKET_GRID_ROWS / matchIds.length

  return (
    <div className="flex shrink-0 flex-col items-center self-stretch">
      <p className="mb-1 text-[6px] font-black uppercase tracking-widest text-stone-400">
        {title}
      </p>
      <div
        className="grid w-full"
        style={{
          height: slotHeight,
          gridTemplateRows: `repeat(${BRACKET_GRID_ROWS}, ${BRACKET_ROW_MIN_PX}px)`,
        }}
      >
        {matchIds.map((matchId, index) => {
          const startRow = index * rowSpan + 1
          const endRow = startRow + rowSpan
          return (
            <div
              key={matchId}
              className="flex items-center justify-center overflow-hidden"
              style={{ gridRow: `${startRow} / ${endRow}` }}
            >
              <BracketMatchCell state={state} matchId={matchId} onPick={onPick} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BracketFinalColumn({
  matchId,
  state,
  onPick,
  slotHeight,
}: {
  matchId: string
  state: BracketPickState
  onPick: (matchId: string, teamCode: string) => void
  slotHeight: number
}) {
  return (
    <div className="flex shrink-0 flex-col items-center self-stretch">
      <p className="mb-1 text-[6px] font-black uppercase tracking-widest text-amber-600">
        Final
      </p>
      <div
        className="grid w-full"
        style={{
          height: slotHeight,
          gridTemplateRows: `repeat(${BRACKET_GRID_ROWS}, ${BRACKET_ROW_MIN_PX}px)`,
        }}
      >
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{ gridRow: `1 / ${BRACKET_GRID_ROWS + 1}` }}
        >
          <div className="rounded-xl border-2 border-amber-400/60 bg-amber-50/90 p-1 shadow-sm">
            <BracketMatchCell state={state} matchId={matchId} onPick={onPick} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Connector() {
  return (
    <div className="flex w-2 shrink-0 self-stretch items-center">
      <div className="h-px w-full bg-stone-300/80" />
    </div>
  )
}

const ZOOM_MIN = 0.75
const ZOOM_MAX = 2.5
const ZOOM_STEP = 0.1

function defaultUserZoom(): number {
  if (typeof window === 'undefined') return 1
  return window.innerWidth < 640 ? 1.85 : 1
}

function defaultBracketHeight(): number {
  return BRACKET_SLOT_HEIGHT
}

function useBracketScale(
  contentKey: string,
  userZoom: number,
  isCapturing: boolean,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [fitScale, setFitScale] = useState(1)
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (isCapturing) return

    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    let raf = 0

    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const cw = container.clientWidth
        const iw = inner.scrollWidth
        const ih = inner.scrollHeight
        if (iw < 1 || ih < 1 || cw < 1) return

        const nextFit = Number(
          Math.min(Math.max(cw / iw, 0.25), 1).toFixed(3),
        )

        setNaturalSize((prev) =>
          prev.w === iw && prev.h === ih ? prev : { w: iw, h: ih },
        )
        setFitScale((prev) => (prev === nextFit ? prev : nextFit))
      })
    }

    measure()
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [contentKey, isCapturing])

  const effectiveScale = isCapturing ? 1 : Number((fitScale * userZoom).toFixed(3))
  const scaledW =
    naturalSize.w > 0 ? Math.ceil(naturalSize.w * effectiveScale) : 0
  const scaledH =
    naturalSize.h > 0 ? Math.ceil(naturalSize.h * effectiveScale) : 0

  return { containerRef, innerRef, effectiveScale, scaledW, scaledH }
}

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 640
}

function scrollBracketView(
  container: HTMLDivElement,
  anchor: HTMLElement | null,
  mode: 'start' | 'share',
  smooth = true,
) {
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto'

  if (mode === 'share' && anchor) {
    const containerRect = container.getBoundingClientRect()
    const anchorRect = anchor.getBoundingClientRect()
    const left =
      container.scrollLeft +
      (anchorRect.left + anchorRect.width / 2) -
      (containerRect.left + containerRect.width / 2)
    const top =
      container.scrollTop +
      (anchorRect.top + anchorRect.height / 2) -
      (containerRect.top + containerRect.height / 2)
    container.scrollTo({
      left: Math.max(0, left),
      top: Math.max(0, top),
      behavior,
    })
    return
  }

  container.scrollTo({ left: 0, top: 0, behavior })
}

export function InteractiveBracketTree({
  state,
  onStateChange,
}: InteractiveBracketTreeProps) {
  const columns = getBracketColumns(state)
  const champion = getChampion(state)
  const exportRef = useRef<HTMLDivElement>(null)
  const shareAnchorRef = useRef<HTMLDivElement>(null)
  const didAutoScroll = useRef(false)
  const [userZoom, setUserZoom] = useState(defaultUserZoom)
  const [bracketHeight, setBracketHeight] = useState(defaultBracketHeight)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const { containerRef, innerRef, effectiveScale, scaledW, scaledH } =
    useBracketScale(
      `${bracketHeight}:${Object.keys(state.winners).length}`,
      userZoom,
      isCapturing,
    )

  useEffect(() => {
    const update = () => setBracketHeight(defaultBracketHeight())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (Object.keys(state.winners).length === 0) {
      didAutoScroll.current = false
    }
  }, [state.winners])

  const handleScrollView = useCallback(
    (mode: 'start' | 'share' = 'share', smooth = true) => {
      const container = containerRef.current
      if (!container) return
      scrollBracketView(container, shareAnchorRef.current, mode, smooth)
    },
    [],
  )

  useEffect(() => {
    if (!isMobileViewport()) return
    if (scaledW < 1 || scaledH < 1) return
    if (didAutoScroll.current) return

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        handleScrollView('start', false)
        didAutoScroll.current = true
      })
    })

    return () => cancelAnimationFrame(raf)
  }, [scaledW, scaledH, handleScrollView])

  const handlePick = (matchId: string, teamCode: string) => {
    onStateChange(pickBracketWinner(state, matchId, teamCode))
  }

  const zoomPercent = Math.round(userZoom * 100)

  const adjustZoom = (delta: number) => {
    setUserZoom((current) => {
      const next = Number((current + delta).toFixed(2))
      return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
    })
  }

  const copyShareLink = async () => {
    const message = champion
      ? bracketShareMessage(champion.team.name)
      : BRACKET_SHARE_MESSAGE
    try {
      await navigator.clipboard.writeText(message)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 2500)
    } catch {
      setExportError('No se pudo copiar el enlace')
    }
  }

  const handleDownload = async () => {
    if (!champion) {
      setExportError('Elige un campeón en la final antes de compartir')
      return
    }

    setExportError(null)
    setIsExporting(true)
    setIsCapturing(true)

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
      const el = exportRef.current
      if (!el) throw new Error('No se encontró el bracket para exportar')
      await downloadBracketImage(el, champion.team.name)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No se pudo generar la imagen. Intenta de nuevo.'
      setExportError(msg)
      console.error('[InteractiveBracketTree] export', err)
    } finally {
      setIsCapturing(false)
      setIsExporting(false)
    }
  }

  const displayScale = effectiveScale
  const viewportHeight = bracketHeight + 48

  return (
    <div className="space-y-3">
      <p className="text-center text-xs text-stone-500">
        Toca un equipo para avanzarlo
      </p>

      <div className="flex items-center justify-center gap-2 px-1">
        <button
          type="button"
          onClick={() => adjustZoom(-ZOOM_STEP)}
          disabled={userZoom <= ZOOM_MIN}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm transition enabled:active:scale-95 disabled:opacity-40"
          aria-label="Alejar"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1 sm:max-w-xs">
          <input
            type="range"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={ZOOM_STEP}
            value={userZoom}
            onChange={(event) => setUserZoom(Number(event.target.value))}
            className="h-1.5 w-full accent-[#6b00ff]"
            aria-label="Zoom del bracket"
          />
          <span className="text-[10px] font-semibold text-stone-500">
            Zoom {zoomPercent}%
          </span>
        </div>

        <button
          type="button"
          onClick={() => adjustZoom(ZOOM_STEP)}
          disabled={userZoom >= ZOOM_MAX}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm transition enabled:active:scale-95 disabled:opacity-40"
          aria-label="Acercar"
        >
          <Plus className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setUserZoom(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm transition active:scale-95"
          aria-label="Restablecer zoom"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleScrollView('share')}
          className="flex h-9 shrink-0 items-center justify-center rounded-full border border-[#6b00ff]/30 bg-[#6b00ff]/8 px-3 text-[10px] font-black uppercase tracking-wide text-[#6b00ff] shadow-sm transition active:scale-95 sm:hidden"
          aria-label="Centrar vista del bracket"
        >
          Centrar
        </button>
      </div>

      <div
        ref={exportRef}
        data-bracket-export
        className="overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-100 via-white to-stone-100 px-1.5 py-2 shadow-inner sm:px-2 sm:py-3"
      >
        <div
          ref={containerRef}
          className={`mx-auto w-full max-w-full ${
            isCapturing
              ? 'overflow-visible'
              : 'touch-pan-x touch-pan-y overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch]'
          }`}
          style={
            isCapturing
              ? { height: 'auto' }
              : { height: viewportHeight }
          }
        >
          <div
            style={
              isCapturing
                ? { width: 'max-content', height: 'auto' }
                : scaledW > 0 && scaledH > 0
                  ? {
                      width: scaledW,
                      height: scaledH,
                      overflow: 'hidden',
                    }
                  : { width: 'max-content', height: 'auto' }
            }
          >
            <div
              ref={innerRef}
              className="pb-2"
              style={
                isCapturing
                  ? { width: 'max-content' }
                  : {
                      transform: `scale(${displayScale})`,
                      transformOrigin: 'top left',
                      width: 'max-content',
                    }
              }
            >
              <div className="flex items-stretch gap-0.5 px-1">
                <BracketGridColumn
                  title="16avos"
                  matchIds={columns.left[0]}
                  state={state}
                  onPick={handlePick}
                  slotHeight={bracketHeight}
                />
                <Connector />
                <BracketGridColumn
                  title="8avos"
                  matchIds={columns.left[1]}
                  state={state}
                  onPick={handlePick}
                  slotHeight={bracketHeight}
                />
                <Connector />
                <div
                  ref={shareAnchorRef}
                  className="flex shrink-0 items-stretch gap-0.5 self-stretch"
                >
                  <BracketGridColumn
                    title="4tos"
                    matchIds={columns.left[2]}
                    state={state}
                    onPick={handlePick}
                    slotHeight={bracketHeight}
                  />
                  <Connector />
                  <BracketGridColumn
                    title="Semis"
                    matchIds={columns.left[3]}
                    state={state}
                    onPick={handlePick}
                    slotHeight={bracketHeight}
                  />
                  <Connector />
                  <BracketFinalColumn
                    matchId={columns.finalId}
                    state={state}
                    onPick={handlePick}
                    slotHeight={bracketHeight}
                  />
                  <Connector />
                  <BracketGridColumn
                    title="Semis"
                    matchIds={columns.right[3]}
                    state={state}
                    onPick={handlePick}
                    slotHeight={bracketHeight}
                  />
                  <Connector />
                  <BracketGridColumn
                    title="4tos"
                    matchIds={columns.right[2]}
                    state={state}
                    onPick={handlePick}
                    slotHeight={bracketHeight}
                  />
                </div>
                <Connector />
                <BracketGridColumn
                  title="8avos"
                  matchIds={columns.right[1]}
                  state={state}
                  onPick={handlePick}
                  slotHeight={bracketHeight}
                />
                <Connector />
                <BracketGridColumn
                  title="16avos"
                  matchIds={columns.right[0]}
                  state={state}
                  onPick={handlePick}
                  slotHeight={bracketHeight}
                />
              </div>
            </div>
          </div>
        </div>

        {champion ? (
          <div
            data-bracket-champion
            className="mt-1.5 border-t border-stone-200/80 pt-2 text-center sm:mt-3 sm:pt-3"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
              Campeón Mundial 2026
            </p>
            <div className="mx-auto mt-2 flex max-w-[240px] items-stretch overflow-hidden rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100/80 shadow-md shadow-amber-500/15">
              <div className="flex flex-1 items-center justify-center bg-white/60 px-3 py-2.5">
                <TeamFlag
                  teamCode={champion.team.code}
                  flagEmoji={champion.team.flagEmoji}
                  size="lg"
                  width={72}
                  height={48}
                  loading="eager"
                />
              </div>
              <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center border-l border-amber-300/60 bg-amber-100/80 px-1 py-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">
                  {champion.team.code}
                </span>
                <span className="mt-0.5 text-center text-[8px] font-bold uppercase leading-tight text-amber-950">
                  {champion.team.name}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <p
          data-bracket-watermark
          className="mt-1.5 text-center text-[9px] font-black uppercase tracking-[0.28em] text-stone-400 sm:mt-3"
        >
          @apo.webs
        </p>
      </div>

      {champion ? (
        <div className="space-y-2">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownload}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 text-sm font-black uppercase tracking-wide text-amber-950 shadow-lg shadow-amber-500/35 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Generando PNG...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" aria-hidden />
                Compartir mi bracket
              </>
            )}
          </button>
          <button
            type="button"
            onClick={copyShareLink}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-xs font-black uppercase tracking-wide text-stone-600 transition active:scale-[0.98]"
          >
            <Link2 className="h-4 w-4" aria-hidden />
            {linkCopied ? '¡Enlace copiado!' : 'Copiar enlace para WhatsApp'}
          </button>
          <p className="text-center text-[10px] leading-snug text-stone-400">
            La imagen incluye tu cuadro, campeón y @apo.webs. Al compartir en
            WhatsApp va el enlace a nuestromundial.com/bracket
          </p>
          {exportError ? (
            <p className="text-center text-xs font-bold text-red-600">{exportError}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-center text-[10px] leading-snug text-stone-400">
          Elige campeón en la final para desbloquear compartir tu bracket.
        </p>
      )}

      <p className="text-center text-[10px] leading-snug text-stone-400 sm:hidden">
        Empieza desde la izquierda en 16avos y desliza a la derecha. Usa Centrar
        para ver semis y final antes de compartir.
      </p>
      <p className="hidden text-center text-[10px] leading-snug text-stone-400 sm:block">
        Vista completa al 100%. Acerca con + y desliza horizontal o vertical para
        revisar los 16avos antes de la captura.
      </p>
    </div>
  )
}
