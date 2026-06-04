import { useMemo } from 'react'
import { useScheduleTick } from '../../hooks/useScheduleTick'
import { useStoreSubscription } from '../../hooks/useStoreSubscription'
import { getAllMatches, groupMatchesByPhase } from '../../lib/schedule'
import {
  getTournamentRevision,
  subscribeTournament,
} from '../../lib/tournamentStore'
import { pageX } from '../../lib/layout'
import { MatchListItem } from './components/MatchListItem'

interface MatchScheduleScreenProps {
  onSelectMatch: (id: string) => void
}

export function MatchScheduleScreen({ onSelectMatch }: MatchScheduleScreenProps) {
  const now = useScheduleTick()
  const tournamentRev = useStoreSubscription(
    subscribeTournament,
    getTournamentRevision,
  )
  const phaseGroups = useMemo(
    () => groupMatchesByPhase(getAllMatches(now)),
    [now, tournamentRev],
  )

  return (
    <div className={`${pageX} py-4 sm:py-5`}>
      <header className="mb-4">
        <h1 className="text-xl font-black uppercase tracking-tighter text-stone-900">
          Calendario
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Toca un partido para ver probabilidades y votar
        </p>
      </header>

      <div className="space-y-6">
        {phaseGroups.map(({ phase, label, matches }) => (
          <section key={phase}>
            <h2 className="mb-2 text-[11px] font-black uppercase tracking-widest text-[#6b00ff]">
              {label}
              <span className="ml-2 font-bold text-stone-400">
                ({matches.length})
              </span>
            </h2>

            <div className="space-y-4">
              {matches.reduce<{ dateKey: string; items: typeof matches }[]>(
                (acc, match) => {
                  const dateKey = match.kickoffAt.slice(0, 10)
                  const last = acc[acc.length - 1]
                  if (last?.dateKey === dateKey) {
                    last.items.push(match)
                  } else {
                    acc.push({ dateKey, items: [match] })
                  }
                  return acc
                },
                [],
              ).map(({ dateKey, items }) => (
                <div key={dateKey}>
                  <h3 className="mb-2 text-xs font-bold capitalize text-stone-600">
                    {new Intl.DateTimeFormat('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      timeZone: 'America/Mexico_City',
                    }).format(new Date(`${dateKey}T12:00:00`))}
                  </h3>
                  <div className="space-y-2">
                    {items.map((match) => (
                      <MatchListItem
                        key={match.id}
                        match={match}
                        onSelect={onSelectMatch}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
