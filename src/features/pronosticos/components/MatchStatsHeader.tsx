import { TeamFlag } from '../../../components/ui/TeamFlag'
import { MatchEventMeta } from './MatchEventMeta'
import { formatMatchDateTime } from '../../../lib/format'
import { sportCard } from '../../../lib/styles'
import { getTeamColors } from '../../../lib/teamVisuals'
import type { Match } from '../../../types/match'

interface MatchStatsHeaderProps {
  match: Match
}

function TeamPanel({
  team,
  label,
}: {
  team?: Match['homeTeam']
  label?: string
}) {
  const colors = team ? getTeamColors(team.code) : null

  return (
    <div
      className="flex flex-1 flex-col items-center gap-2 rounded-xl py-3 text-center"
      style={
        colors
          ? {
              background: `linear-gradient(160deg, ${colors.primary}18 0%, ${colors.secondary}12 100%)`,
              borderTop: `3px solid ${colors.primary}`,
            }
          : undefined
      }
    >
      {team ? (
        <>
          <TeamFlag teamCode={team.code} flagEmoji={team.flagEmoji} size="lg" />
          <span
            className="text-3xl font-black leading-none tracking-tighter sm:text-4xl"
            style={{ color: colors?.primary }}
          >
            {team.code}
          </span>
          <span className="text-xs font-black uppercase tracking-tight text-stone-700">
            {team.name}
          </span>
        </>
      ) : (
        <span className="px-2 text-sm font-black uppercase text-stone-600">
          {label}
        </span>
      )}
    </div>
  )
}

export function MatchStatsHeader({ match }: MatchStatsHeaderProps) {
  const { homeTeam, awayTeam, homeLabel, awayLabel, kickoffAt } = match

  return (
    <section className={sportCard}>
      <MatchEventMeta match={match} />

      <div className="flex items-stretch justify-between gap-1.5 sm:gap-2">
        <TeamPanel team={homeTeam ?? undefined} label={homeLabel} />

        <div className="flex flex-col items-center justify-center px-1">
          <span className="text-sm font-black uppercase tracking-tighter text-stone-400">
            vs
          </span>
        </div>

        <TeamPanel team={awayTeam ?? undefined} label={awayLabel} />
      </div>

      <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-widest text-stone-500">
        {formatMatchDateTime(kickoffAt)} · hora Tijuana
      </p>
    </section>
  )
}
