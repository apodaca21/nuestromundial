import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { pageX, fieldInput } from '../../lib/layout'
import {
  downloadWorldCupTicket,
  preloadTicketPlayerPhoto,
} from './exportTicket'
import { TicketCanvas } from './components/TicketCanvas'
import { TicketCountryPicker } from './components/TicketCountryPicker'
import { getTicketPlayerPhotoSrc } from './ticketPlayerPhotos'
import { getTicketPlayerNation } from './ticketPlayerNations'
import {
  getTicketCountry,
  TICKET_COUNTRIES,
  type TicketCountry,
} from './ticketCountries'
import {
  findTicketPlayer,
  TICKET_POSITIONS,
  ticketPlayerKey,
  type TicketPlayerOption,
} from './ticketPlayers'

export function WorldCupTicket() {
  const ticketRef = useRef<HTMLDivElement>(null)

  const [countryCode, setCountryCode] = useState(TICKET_COUNTRIES[0].code)
  const [playerKey, setPlayerKey] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const country: TicketCountry = getTicketCountry(countryCode)
  const selectedPlayer: TicketPlayerOption | undefined = playerKey
    ? findTicketPlayer(playerKey)
    : undefined

  const playerImageSrc = selectedPlayer
    ? getTicketPlayerPhotoSrc(selectedPlayer.name, selectedPlayer.positionName)
    : null

  const playerNation = selectedPlayer
    ? getTicketPlayerNation(selectedPlayer.name)
    : undefined

  const filteredPositions = useMemo(() => {
    if (!positionFilter) return TICKET_POSITIONS
    return TICKET_POSITIONS.filter((p) => p.id === positionFilter)
  }, [positionFilter])

  useEffect(() => {
    preloadTicketPlayerPhoto(playerImageSrc)
  }, [playerImageSrc])

  const handleDownload = useCallback(async () => {
    const el = ticketRef.current
    if (!el) return
    if (!selectedPlayer) {
      setExportError('Elige un jugador del roster.')
      return
    }

    setExportError(null)
    setIsExporting(true)
    try {
      await downloadWorldCupTicket(el)
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : 'No se pudo exportar el boleto.',
      )
    } finally {
      setIsExporting(false)
    }
  }, [selectedPlayer])

  return (
    <div className={`${pageX} py-4 pb-6 sm:py-8`}>
      <header className="mb-5 text-center">
        <h1 className="font-display text-3xl tracking-wide text-stone-900 sm:text-4xl">
          Boleto al Mundial
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Crea tu pase VIP 9:16 para Instagram Stories
        </p>
      </header>

      <div className="mx-auto flex max-w-md flex-col gap-6">
        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-stone-700">
            Tus datos
          </h2>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-600">
              País a apoyar
            </span>
            <TicketCountryPicker
              value={countryCode}
              onChange={setCountryCode}
            />
            <p className="text-center text-xs font-semibold text-stone-700">
              {country.label}
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-600">
              Filtrar por posición
            </span>
            <select
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value)
                setPlayerKey('')
              }}
              className={fieldInput}
            >
              <option value="">Todas las posiciones</option>
              {TICKET_POSITIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-stone-600">
              Jugador del roster
            </span>
            <select
              value={playerKey}
              onChange={(e) => setPlayerKey(e.target.value)}
              className={fieldInput}
            >
              <option value="">Elige un jugador…</option>
              {filteredPositions.map((position) => (
                <optgroup key={position.id} label={position.name}>
                  {position.players.map((player) => {
                    const option: TicketPlayerOption = {
                      name: player.name,
                      positionName: position.name,
                      stars: player.stars,
                    }
                    return (
                      <option
                        key={ticketPlayerKey(option)}
                        value={ticketPlayerKey(option)}
                      >
                        {player.name} ({player.stars}★)
                      </option>
                    )
                  })}
                </optgroup>
              ))}
            </select>
          </label>

          {selectedPlayer && (
            <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
              {playerImageSrc ? (
                <img
                  src={playerImageSrc}
                  alt={selectedPlayer.name}
                  className="h-16 w-12 shrink-0 rounded-md object-cover object-center ring-2 ring-stone-200"
                  loading="eager"
                />
              ) : (
                <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-md bg-stone-200 text-[8px] font-bold uppercase text-stone-500">
                  Foto
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-stone-900">
                  {selectedPlayer.name}
                </p>
                <p className="text-xs text-stone-500">
                  {playerNation ?? 'Selección'} · {selectedPlayer.positionName} ·{' '}
                  {selectedPlayer.stars}★
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-center text-sm font-bold uppercase tracking-wide text-stone-600">
            Vista previa
          </h2>
          <TicketCanvas
            ref={ticketRef}
            country={country}
            playerName={selectedPlayer?.name ?? ''}
            playerImageSrc={playerImageSrc}
          />
        </section>

        {exportError && (
          <p className="text-center text-sm text-red-600" role="alert">
            {exportError}
          </p>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting || !selectedPlayer}
          className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-base font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60 sm:text-sm"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Generando PNG…
            </>
          ) : (
            <>
              <Download className="h-5 w-5" aria-hidden />
              Descargar mi Boleto (IG Story)
            </>
          )}
        </button>
        <p className="text-center text-[10px] leading-snug text-stone-400">
          Al compartir se incluye el enlace a nuestromundial.com/boleto. En WhatsApp
          pégalo como segundo mensaje si no sale solo.
        </p>
      </div>
    </div>
  )
}
