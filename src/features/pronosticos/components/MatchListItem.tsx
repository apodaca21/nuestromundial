import { ChevronRight } from 'lucide-react'
import { TeamFlag } from '../../../components/ui/TeamFlag'
import { formatMatchTime } from '../../../lib/format'
import { canViewPronosticos } from '../../../lib/schedule'
import { getTeamColors } from '../../../lib/teamVisuals'
import type { Match } from '../../../types/match'

interface MatchListItemProps {
  match: Match
  onSelect: (id: string) => void
}

function teamLine(
  team: Match['homeTeam'],
  label: string | undefined,
  codeFallback: string,
) {
  if (team) {
    const colors = getTeamColors(team.code)
    return (
      <span className="flex items-center gap-2 font-bold text-stone-800">
        <TeamFlag teamCode={team.code} flagEmoji={team.flagEmoji} size="sm" />
        <span style={{ color: colors.primary }}>{team.name}</span>
      </span>
    )
  }
  return <span className="font-bold text-stone-500">{label ?? codeFallback}</span>
}

const statusStyles: Record<Match['status'], string> = {
  pending: 'bg-[#6b00ff]/10 text-[#6b00ff]',
  live: 'bg-[#ff004d]/10 text-[#ff004d]',
  finished: 'bg-stone-100 text-stone-500',
}

const statusText: Record<Match['status'], string> = {
  pending: 'Próximo',
  live: 'En vivo',
  finished: 'Final',
}

export function MatchListItem({ match, onSelect }: MatchListItemProps) {
  const meta = [
    match.phaseLabel,
    match.group ? `Grupo ${match.group}` : null,
    match.venue,
    match.city,
  ]
    .filter(Boolean)
    .join(' · ')

  const hasTeams = match.homeTeam && match.awayTeam
  const canOpen = canViewPronosticos(match)

  return (
    <button
      type="button"
      disabled={!canOpen}
      onClick={() => canOpen && onSelect(match.id)}
      className={`w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-left transition-colors ${
        canOpen
          ? 'hover:border-[#6b00ff]/40 active:bg-stone-50'
          : 'cursor-default opacity-90'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-lg font-black text-[#6b00ff]">
          {formatMatchTime(match.kickoffAt)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${statusStyles[match.status]}`}
        >
          {match.status === 'finished' && match.homeScore !== undefined
            ? `Final ${match.homeScore}-${match.awayScore}`
            : statusText[match.status]}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 text-sm">
          <div>{teamLine(match.homeTeam, match.homeLabel, 'Local')}</div>
          <div className="my-0.5 text-[10px] font-black text-[#ff004d]">vs</div>
          <div>{teamLine(match.awayTeam, match.awayLabel, 'Visitante')}</div>
        </div>
        {canOpen && (
          <ChevronRight className="h-5 w-5 shrink-0 text-stone-300" aria-hidden />
        )}
      </div>

      <p className="mt-2 text-[10px] leading-snug text-stone-400">{meta}</p>

      {!canOpen && !hasTeams && (
        <p className="mt-1 text-[10px] font-bold text-stone-400">
          Cruce pendiente — el admin configurará los equipos
        </p>
      )}
      {!canOpen && hasTeams && match.status === 'finished' && (
        <p className="mt-1 text-[10px] font-bold text-stone-400">
          Partido finalizado
        </p>
      )}
    </button>
  )
}
