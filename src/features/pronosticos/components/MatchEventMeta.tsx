import { Badge } from '../../../components/ui/Badge'
import type { Match } from '../../../types/match'

function cityShownSeparately(venue: string, city?: string): boolean {
  if (!city?.trim()) return false
  const v = venue.toLowerCase()
  const c = city.toLowerCase()
  if (v === c) return false
  if (v.includes(c)) return false
  return true
}

interface MatchEventMetaProps {
  match: Pick<Match, 'status' | 'phaseLabel' | 'group' | 'venue' | 'city'>
}

/** Encabezado de fase, grupo y sede — mismo layout en todos los partidos */
export function MatchEventMeta({ match }: MatchEventMetaProps) {
  const phaseLine = [match.phaseLabel, match.group ? `Grupo ${match.group}` : null]
    .filter(Boolean)
    .join(' · ')

  const showCity = cityShownSeparately(match.venue, match.city)

  return (
    <div className="mb-4 space-y-2 border-b border-stone-100 pb-3">
      <div className="flex justify-center">
        <Badge status={match.status} />
      </div>

      {phaseLine ? (
        <p className="text-center text-[10px] font-black uppercase leading-snug tracking-[0.14em] text-stone-600">
          {phaseLine}
        </p>
      ) : null}

      {match.venue ? (
        <p className="mx-auto max-w-full px-1 text-center text-[10px] font-bold uppercase leading-snug tracking-wide text-stone-400">
          {match.venue}
        </p>
      ) : null}

      {showCity && match.city ? (
        <p className="text-center text-[10px] font-bold uppercase tracking-wide text-stone-400">
          {match.city}
        </p>
      ) : null}
    </div>
  )
}
