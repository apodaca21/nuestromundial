import { useMemo } from 'react'
import { useMatchOdds } from '../../hooks/useMatchOdds'
import { useScheduleTick } from '../../hooks/useScheduleTick'
import { useStoreSubscription } from '../../hooks/useStoreSubscription'
import { formatMatchKickoffLabel } from '../../lib/format'
import { canViewPronosticos, getMatchById } from '../../lib/schedule'
import {
  getTournamentRevision,
  subscribeTournament,
} from '../../lib/tournamentStore'
import { pageX } from '../../lib/layout'
import { MatchDetailHeader } from './components/MatchDetailHeader'
import { PronosticosScreen } from './PronosticosScreen'

interface MatchDetailScreenProps {
  matchId: string
  onBack: () => void
}

export function MatchDetailScreen({ matchId, onBack }: MatchDetailScreenProps) {
  const now = useScheduleTick(30_000)
  const tournamentRev = useStoreSubscription(
    subscribeTournament,
    getTournamentRevision,
  )
  const match = useMemo(
    () => getMatchById(matchId, now),
    [matchId, now, tournamentRev],
  )
  const oddsState = useMatchOdds(match)

  if (!match) {
    return (
      <div className="flex min-h-full flex-col">
        <MatchDetailHeader onBack={onBack} />
        <div className={`${pageX} py-8 text-center`}>
          <p className="text-stone-500">Partido no encontrado</p>
        </div>
      </div>
    )
  }

  const teamTitle =
    match.homeTeam && match.awayTeam
      ? `${match.homeTeam.code} vs ${match.awayTeam.code}`
      : 'Partido'

  return (
    <div className="flex min-h-full flex-col">
      <MatchDetailHeader onBack={onBack} title={teamTitle} />

      <div className="flex-1 pb-4">
        {!canViewPronosticos(match) ? (
          <div className={`space-y-4 py-6 ${pageX}`}>
            <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6b00ff]">
                {match.phaseLabel}
                {match.matchNumber ? ` · Partido ${match.matchNumber}` : ''}
              </p>
              <h2 className="mt-2 text-lg font-black text-stone-900">
                {match.homeLabel ?? match.homeTeam?.name} vs{' '}
                {match.awayLabel ?? match.awayTeam?.name}
              </h2>
              <p className="mt-2 text-sm font-bold uppercase tracking-wide text-stone-500">
                {formatMatchKickoffLabel(match.kickoffAt)}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                {match.venue}
                {match.city ? ` (${match.city})` : ''}
              </p>
            </div>

            <p className="rounded-xl bg-stone-100 px-4 py-3 text-center text-sm text-stone-600">
              {match.status === 'finished'
                ? 'Este partido ya finalizó.'
                : match.homeTeam || match.awayTeam
                  ? 'Falta confirmar el rival en admin para abrir pronósticos.'
                  : 'Este cruce se publicará cuando el admin asigne local y visitante (cuartos, semis, etc.).'}
            </p>
          </div>
        ) : (
          <PronosticosScreen match={match} oddsState={oddsState} />
        )}
      </div>
    </div>
  )
}
