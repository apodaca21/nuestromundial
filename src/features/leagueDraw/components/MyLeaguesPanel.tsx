import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, LogIn, Trophy } from 'lucide-react'
import { fetchUserLeagues } from '../../../services/leagueDraw/leagueDrawService'
import type { LeagueSummary } from '../../../types/league'
import { getLocalLeagues, type LocalLeagueEntry } from '../localLeagueStorage'

export interface LeagueListItem {
  id: string
  name: string
  share_code: string
  created_at: string
  participant_count: number
  source: 'account' | 'device'
}

interface MyLeaguesPanelProps {
  authLoading: boolean
  userId: string | null
  configured: boolean
  refreshKey?: number
  onSelectLeague: (shareCode: string) => void
  onRequestLogin?: () => void
}

function formatLeagueDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function mergeLeagueLists(
  account: LeagueSummary[],
  local: LocalLeagueEntry[],
): LeagueListItem[] {
  const byCode = new Map<string, LeagueListItem>()

  for (const league of local) {
    byCode.set(league.share_code, {
      id: `local-${league.share_code}`,
      name: league.name,
      share_code: league.share_code,
      created_at: league.created_at,
      participant_count: league.participant_count,
      source: 'device',
    })
  }

  for (const league of account) {
    byCode.set(league.share_code, {
      id: league.id,
      name: league.name,
      share_code: league.share_code,
      created_at: league.created_at,
      participant_count: league.participant_count,
      source: 'account',
    })
  }

  return [...byCode.values()].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

export function MyLeaguesPanel({
  authLoading,
  userId,
  configured,
  refreshKey = 0,
  onSelectLeague,
  onRequestLogin,
}: MyLeaguesPanelProps) {
  const [accountLeagues, setAccountLeagues] = useState<LeagueSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [localRefresh, setLocalRefresh] = useState(0)

  useEffect(() => {
    const onStorage = () => setLocalRefresh((k) => k + 1)
    window.addEventListener('storage', onStorage)
    window.addEventListener('nm:local-leagues-changed', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('nm:local-leagues-changed', onStorage)
    }
  }, [])

  useEffect(() => {
    if (!userId || !configured) {
      setAccountLeagues([])
      setLoading(false)
      setError('')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    void fetchUserLeagues(userId)
      .then((rows) => {
        if (!cancelled) setAccountLeagues(rows)
      })
      .catch((err: unknown) => {
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

  const leagues = useMemo(
    () => mergeLeagueLists(accountLeagues, getLocalLeagues()),
    [accountLeagues, refreshKey, localRefresh],
  )

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[#6b00ff]" aria-hidden />
          <h2 className="text-xs font-black uppercase tracking-wide text-stone-500">
            Mis ligas guardadas
          </h2>
        </div>
        <p className="text-xs text-stone-500">
          Abre una liga para ver el reparto, compartir el enlace o descargar la
          Story otra vez. No se puede volver a sortear.
        </p>
      </div>

      {!authLoading && !userId && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-3">
          <p className="text-xs font-semibold text-amber-900">
            Inicia sesión para sincronizar tus ligas en la nube.
          </p>
          <p className="mt-1 text-[11px] text-amber-800/80">
            Las quinielas de este dispositivo también aparecen abajo.
          </p>
          {onRequestLogin && (
            <button
              type="button"
              onClick={onRequestLogin}
              disabled={!configured}
              className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#6b00ff] px-3 text-xs font-bold text-white active:scale-[0.98] disabled:opacity-50"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden />
              {configured ? 'Iniciar sesión' : 'Supabase no configurado'}
            </button>
          )}
        </div>
      )}

      {!authLoading && userId && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          Sesión activa — las quinielas nuevas se guardan en tu cuenta.
        </div>
      )}

      {authLoading || loading ? (
        <p className="text-xs text-stone-400">Cargando ligas…</p>
      ) : error ? (
        <p className="text-xs font-bold text-[#ff004d]">{error}</p>
      ) : leagues.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-3 py-6 text-center text-xs text-stone-500">
          Aún no tienes ligas. Crea una quiniela en la pestaña{' '}
          <span className="font-bold">Nueva</span> y aparecerá aquí.
        </p>
      ) : (
        <ul className="space-y-2">
          {leagues.map((league) => (
            <li key={league.id}>
              <button
                type="button"
                onClick={() => onSelectLeague(league.share_code)}
                className="flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-3 text-left shadow-sm active:bg-stone-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-stone-900">{league.name}</p>
                  <p className="text-[11px] text-stone-500">
                    {league.participant_count} participantes ·{' '}
                    {formatLeagueDate(league.created_at)}
                    {league.source === 'device' && !userId ? ' · este dispositivo' : ''}
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
