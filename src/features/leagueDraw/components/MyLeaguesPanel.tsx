import { useEffect, useState } from 'react'
import { ChevronRight, Trophy } from 'lucide-react'
import { fetchUserLeagues } from '../../../services/leagueDraw/leagueDrawService'
import type { LeagueSummary } from '../../../types/league'

interface MyLeaguesPanelProps {
  userId: string
  configured: boolean
  refreshKey?: number
  onSelectLeague: (shareCode: string) => void
}

function formatLeagueDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function MyLeaguesPanel({
  userId,
  configured,
  refreshKey = 0,
  onSelectLeague,
}: MyLeaguesPanelProps) {
  const [leagues, setLeagues] = useState<LeagueSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!configured) {
      setLeagues([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    void fetchUserLeagues(userId)
      .then((rows) => {
        if (!cancelled) setLeagues(rows)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'No se pudieron cargar tus ligas',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId, configured, refreshKey])

  if (!configured) return null

  return (
    <section className="space-y-2 rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-[#6b00ff]" aria-hidden />
        <h2 className="text-xs font-black uppercase tracking-wide text-stone-500">
          Mis ligas guardadas
        </h2>
      </div>
      <p className="text-xs text-stone-500">
        Abre una liga para ver el reparto, compartir el enlace o descargar la Story
        otra vez. No se puede volver a sortear.
      </p>

      {loading ? (
        <p className="text-xs text-stone-400">Cargando ligas…</p>
      ) : error ? (
        <p className="text-xs font-bold text-[#ff004d]">{error}</p>
      ) : leagues.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-3 py-4 text-xs text-stone-500">
          Aún no tienes ligas guardadas. Crea una quiniela abajo y se guardará aquí
          automáticamente.
        </p>
      ) : (
        <ul className="space-y-2">
          {leagues.map((league) => (
            <li key={league.id}>
              <button
                type="button"
                onClick={() => onSelectLeague(league.share_code)}
                className="flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-3 text-left active:bg-stone-100"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-stone-900">{league.name}</p>
                  <p className="text-[11px] text-stone-500">
                    {league.participant_count} participantes ·{' '}
                    {formatLeagueDate(league.created_at)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
