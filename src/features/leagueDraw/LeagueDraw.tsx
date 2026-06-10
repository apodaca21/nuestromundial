import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  Download,
  LogIn,
  Plus,
  RotateCcw,
  Share2,
  Shuffle,
  Trash2,
  Users,
  Layers3,
  Dices,
} from 'lucide-react'
import { TeamFlag } from '../../components/ui/TeamFlag'
import { useAuth } from '../../context/AuthContext'
import { leagueShareUrl } from '../../lib/appRoutes'
import { preloadTeamFlags } from '../../lib/exportImage'
import { pageX } from '../../lib/layout'
import { LeagueResultsStory } from './components/LeagueResultsStory'
import {
  downloadLeagueResults,
  leagueResultsStats,
  shareLeagueLink,
} from './exportLeagueDraw'
import {
  createLeagueShareCode,
  fetchLeagueByShareCode,
  saveLeagueDraw,
} from '../../services/leagueDraw/leagueDrawService'
import { ALL_WORLD_CUP_TEAMS } from './worldCupTeams'
import {
  distributeTeams,
  DRAW_DISTRIBUTION_OPTIONS,
  type DrawDistributionMode,
  type ParticipantAssignment,
} from './distributeTeams'

type DrawStep = 'setup' | 'drawing' | 'results' | 'loading'

interface LeagueDrawProps {
  shareCode?: string | null
  onLeagueSaved?: (shareCode: string) => void
  onClearLeague?: () => void
}

const DRAW_DURATION_MS = 2000
const FLAG_TICK_MS = 80

function createParticipantId() {
  return crypto.randomUUID()
}

function requestLogin() {
  window.dispatchEvent(new Event('nm:open-auth'))
}

export function LeagueDraw({ shareCode, onLeagueSaved, onClearLeague }: LeagueDrawProps) {
  const { configured, loading: authLoading, user } = useAuth()

  const [step, setStep] = useState<DrawStep>(shareCode ? 'loading' : 'setup')
  const [leagueName, setLeagueName] = useState('')
  const [savedShareCode, setSavedShareCode] = useState<string | null>(
    shareCode ?? null,
  )
  const [participants, setParticipants] = useState([
    { id: createParticipantId(), name: '' },
    { id: createParticipantId(), name: '' },
  ])
  const [assignments, setAssignments] = useState<ParticipantAssignment[]>([])
  const [drawingFlag, setDrawingFlag] = useState(ALL_WORLD_CUP_TEAMS[0])
  const [shareLinkState, setShareLinkState] = useState<'idle' | 'shared' | 'copied'>('idle')
  const [exporting, setExporting] = useState(false)
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error' | 'skipped'
  >('idle')
  const [saveError, setSaveError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [distributionMode, setDistributionMode] =
    useState<DrawDistributionMode>('groups')

  const resultsRef = useRef<HTMLDivElement>(null)
  const flagIntervalRef = useRef<number | null>(null)

  const resultStats = useMemo(
    () => leagueResultsStats(assignments),
    [assignments],
  )

  const validParticipants = useMemo(
    () => participants.map((p) => p.name.trim()).filter(Boolean),
    [participants],
  )

  const canGenerate =
    leagueName.trim().length > 0 && validParticipants.length >= 2

  const leagueShareLink = savedShareCode
    ? leagueShareUrl(savedShareCode)
    : null

  const stopFlagAnimation = useCallback(() => {
    if (flagIntervalRef.current !== null) {
      window.clearInterval(flagIntervalRef.current)
      flagIntervalRef.current = null
    }
  }, [])

  const persistDraw = useCallback(
    async (
      name: string,
      result: ParticipantAssignment[],
      shareCode: string,
    ) => {
      if (!user || !configured) {
        setSaveState('skipped')
        return
      }

      setSaveState('saving')
      setSaveError('')

      try {
        const record = await saveLeagueDraw({
          ownerId: user.id,
          name,
          assignments: result,
          shareCode,
        })
        setSavedShareCode(record.share_code)
        setSaveState('saved')
        onLeagueSaved?.(record.share_code)
      } catch (err) {
        setSaveState('error')
        setSaveError(
          err instanceof Error ? err.message : 'No se pudo guardar la liga',
        )
      }
    },
    [configured, onLeagueSaved, user],
  )

  const loadSharedLeague = useCallback(async (code: string) => {
    if (!configured) {
      setLoadError('Configura Supabase para abrir ligas guardadas.')
      setStep('setup')
      return
    }

    setStep('loading')
    setLoadError('')

    try {
      const saved = await fetchLeagueByShareCode(code)
      if (!saved) {
        setLoadError('No encontramos esa liga. Revisa el enlace.')
        setStep('setup')
        return
      }

      setLeagueName(saved.record.name)
      setSavedShareCode(saved.record.share_code)
      setAssignments(saved.assignments)
      setSaveState('saved')
      setStep('results')
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'No se pudo cargar la liga',
      )
      setStep('setup')
    }
  }, [configured])

  useEffect(() => {
    if (shareCode) {
      void loadSharedLeague(shareCode)
    }
  }, [shareCode, loadSharedLeague])

  const startDraw = useCallback(() => {
    if (!canGenerate) return

    setSaveState('idle')
    setSaveError('')
    const shareCode = createLeagueShareCode()
    setSavedShareCode(shareCode)
    onLeagueSaved?.(shareCode)
    setStep('drawing')
    setDrawingFlag(
      ALL_WORLD_CUP_TEAMS[Math.floor(Math.random() * ALL_WORLD_CUP_TEAMS.length)],
    )

    flagIntervalRef.current = window.setInterval(() => {
      setDrawingFlag(
        ALL_WORLD_CUP_TEAMS[Math.floor(Math.random() * ALL_WORLD_CUP_TEAMS.length)],
      )
    }, FLAG_TICK_MS)

    window.setTimeout(() => {
      stopFlagAnimation()
      const result = distributeTeams(
        validParticipants,
        ALL_WORLD_CUP_TEAMS,
        distributionMode,
      )
      setAssignments(result)
      setStep('results')
      void persistDraw(leagueName.trim(), result, shareCode)
    }, DRAW_DURATION_MS)
  }, [
    canGenerate,
    distributionMode,
    leagueName,
    onLeagueSaved,
    persistDraw,
    stopFlagAnimation,
    validParticipants,
  ])

  useEffect(() => {
    if (step !== 'results' || assignments.length === 0) return
    preloadTeamFlags(
      assignments.flatMap((entry) => entry.teams.map((team) => team.code)),
    )
  }, [step, assignments])

  useEffect(() => () => stopFlagAnimation(), [stopFlagAnimation])

  const addParticipant = () => {
    setParticipants((prev) => [...prev, { id: createParticipantId(), name: '' }])
  }

  const updateParticipant = (id: string, name: string) => {
    setParticipants((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, name } : entry)),
    )
  }

  const removeParticipant = (id: string) => {
    setParticipants((prev) =>
      prev.length <= 2 ? prev : prev.filter((entry) => entry.id !== id),
    )
  }

  const resetDraw = () => {
    stopFlagAnimation()
    setStep('setup')
    setAssignments([])
    setSavedShareCode(null)
    setSaveState('idle')
    setSaveError('')
    setShareLinkState('idle')
    setLoadError('')
    onClearLeague?.()
  }

  const handleShareLink = async () => {
    if (!leagueShareLink) return
    try {
      const result = await shareLeagueLink(leagueShareLink, leagueName.trim())
      setShareLinkState(result)
      window.setTimeout(() => setShareLinkState('idle'), 2500)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setShareLinkState('idle')
    }
  }

  const handleDownload = async () => {
    const node = resultsRef.current
    if (!node || exporting) return

    setExporting(true)
    try {
      await downloadLeagueResults(
        node,
        assignments,
        leagueName.trim(),
        leagueShareLink,
      )
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'No se pudo exportar la quiniela',
      )
    } finally {
      setExporting(false)
    }
  }

  if (step === 'loading') {
    return (
      <div className={`${pageX} py-16 text-center`}>
        <p className="text-sm font-bold text-stone-500">Cargando liga…</p>
      </div>
    )
  }

  return (
    <div className={`${pageX} space-y-5 pb-8 pt-4`}>
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-[#6b00ff]">
          <Shuffle className="h-5 w-5" aria-hidden />
          <span className="text-xs font-black uppercase tracking-widest">
            Quiniela de Liga
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-stone-900">
          Reparte los 48 equipos
        </h1>
        <p className="text-sm text-stone-500">
          Crea tu liga, añade amigos y deja que la tómbola reparta las
          selecciones del Mundial 2026.
        </p>
      </header>

      {loadError && (
        <div className="flex items-start gap-2 rounded-2xl border border-[#ff004d]/20 bg-[#ff004d]/5 px-4 py-3 text-sm text-[#ff004d]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{loadError}</p>
        </div>
      )}

      {step === 'setup' && (
        <div className="space-y-5">
          {!authLoading && !user && (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-900">
                Debes iniciar sesión para guardar tu liga
              </p>
              <p className="mt-1 text-xs text-amber-800/80">
                Puedes generar la quiniela sin cuenta, pero no quedará guardada en
                tu perfil.
              </p>
              <button
                type="button"
                onClick={requestLogin}
                disabled={!configured}
                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#6b00ff] px-4 text-sm font-bold text-white shadow-md shadow-[#6b00ff]/25 active:scale-[0.98] disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                {configured ? 'Iniciar sesión' : 'Supabase no configurado'}
              </button>
            </div>
          )}

          {!authLoading && user && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              Sesión activa — tus ligas se guardan automáticamente al generar la quiniela.
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="league-name"
              className="text-xs font-bold uppercase tracking-wide text-stone-500"
            >
              Nombre de la Liga
            </label>
            <input
              id="league-name"
              type="text"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              placeholder="Ej. La Pulga FC"
              className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-base text-stone-900 outline-none ring-[#6b00ff]/30 focus:ring-2"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-wide text-stone-500">
              Tipo de reparto
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DRAW_DISTRIBUTION_OPTIONS.map((option) => {
                const selected = distributionMode === option.id
                const Icon = option.id === 'groups' ? Layers3 : Dices
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setDistributionMode(option.id)}
                    className={`rounded-xl border px-3 py-3 text-left transition-all active:scale-[0.99] ${
                      selected
                        ? 'border-[#6b00ff] bg-[#6b00ff]/5 ring-2 ring-[#6b00ff]/30'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          selected
                            ? 'bg-[#6b00ff] text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span>
                        <span
                          className={`block text-sm font-black ${
                            selected ? 'text-[#6b00ff]' : 'text-stone-900'
                          }`}
                        >
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-stone-500">
                          {option.description}
                        </span>
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500">
                <Users className="h-3.5 w-3.5" aria-hidden />
                Participantes
              </span>
              <span className="text-xs text-stone-400">
                Mínimo 2 · {validParticipants.length} listos
              </span>
            </div>

            <ul className="space-y-2">
              {participants.map((entry, index) => (
                <li key={entry.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={entry.name}
                    onChange={(e) => updateParticipant(entry.id, e.target.value)}
                    placeholder={`Apodo ${index + 1}`}
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-base text-stone-900 outline-none ring-[#6b00ff]/30 focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeParticipant(entry.id)}
                    disabled={participants.length <= 2}
                    aria-label={`Quitar participante ${index + 1}`}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-400 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={addParticipant}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-sm font-bold text-stone-600 active:bg-stone-100"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Añadir amigo
            </button>
          </div>

          <button
            type="button"
            onClick={startDraw}
            disabled={!canGenerate}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#6b00ff] text-base font-black text-white shadow-lg shadow-[#6b00ff]/30 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
          >
            <Shuffle className="h-5 w-5" aria-hidden />
            Generar Quiniela
          </button>
        </div>
      )}

      {step === 'drawing' && (
        <div
          className="flex min-h-[18rem] flex-col items-center justify-center rounded-3xl bg-[#1a1a1a] px-6 py-10 text-center text-white"
          aria-live="polite"
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">
            Sorteando 48 equipos…
          </p>
          <div className="mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 p-3">
            <TeamFlag
              teamCode={drawingFlag.code}
              flagEmoji={drawingFlag.flagEmoji}
              size="lg"
              loading="eager"
              className="!h-full !w-full !rounded-full !border-0 !shadow-none"
              width={72}
              height={72}
            />
          </div>
          <p className="mt-4 text-xl font-black">{drawingFlag.name}</p>
          <p className="mt-1 text-sm text-white/50">Grupo {drawingFlag.group}</p>
          <div className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
            <div className="h-full animate-[league-draw-progress_2s_ease-out_forwards] rounded-full bg-[#6b00ff]" />
          </div>
        </div>
      )}

      {step === 'results' && (
        <div className="space-y-4">
          {saveState === 'saving' && (
            <p className="text-center text-xs font-bold text-stone-500">
              Guardando liga en tu cuenta…
            </p>
          )}
          {saveState === 'saved' && (
            <p className="flex items-center justify-center gap-1.5 text-center text-xs font-bold text-emerald-700">
              <Check className="h-3.5 w-3.5" aria-hidden />
              Liga guardada — la encuentras en Mi cuenta → Mis ligas
            </p>
          )}
          {saveState === 'skipped' && (
            <p className="text-center text-xs font-bold text-amber-700">
              Quiniela local — inicia sesión para guardarla en tu perfil
            </p>
          )}
          {saveState === 'error' && (
            <p className="text-center text-xs font-bold text-[#ff004d]">
              {saveError}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#6b00ff] px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              <Download className="h-4 w-4" aria-hidden />
              {exporting ? 'Generando…' : 'Descargar Story'}
            </button>
            <button
              type="button"
              onClick={handleShareLink}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700"
            >
              {shareLinkState === 'shared' ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                  Compartido
                </>
              ) : shareLinkState === 'copied' ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                  Enlace copiado
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" aria-hidden />
                  Compartir enlace
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetDraw}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-bold text-stone-600 sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Nueva quiniela
            </button>
          </div>

          <p className="text-center text-[11px] text-stone-500">
            Vista previa Story (9:16) — reparto de grupos por jugador
          </p>

          <LeagueResultsStory
            innerRef={resultsRef}
            leagueName={leagueName}
            assignments={assignments}
            participantCount={resultStats.participantCount}
            teamsPerPlayer={resultStats.teamsPerPlayer}
          />
        </div>
      )}

      <style>{`
        @keyframes league-draw-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
