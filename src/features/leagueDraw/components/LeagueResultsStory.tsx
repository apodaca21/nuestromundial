import type { RefObject } from 'react'
import { TeamFlag } from '../../../components/ui/TeamFlag'
import logoMundial from '../../../assets/logomundial.jpeg'
import {
  clusterTeamsByGroup,
  ORPHAN_PARTICIPANT,
  type ParticipantAssignment,
} from '../distributeTeams'

interface LeagueResultsStoryProps {
  leagueName: string
  assignments: ParticipantAssignment[]
  participantCount: number
  teamsPerPlayer: number
  innerRef?: RefObject<HTMLDivElement | null>
  captureMode?: boolean
}

export function LeagueResultsStory({
  leagueName,
  assignments,
  participantCount,
  teamsPerPlayer,
  innerRef,
  captureMode = false,
}: LeagueResultsStoryProps) {
  const realAssignments = assignments.filter(
    (entry) => entry.participant !== ORPHAN_PARTICIPANT,
  )
  const orphanEntry = assignments.find(
    (entry) => entry.participant === ORPHAN_PARTICIPANT,
  )
  const compact = participantCount >= 6

  return (
    <div
      ref={innerRef}
      data-league-export
      className={`mx-auto w-full shadow-xl ring-1 ring-stone-200/80 ${
        captureMode ? 'max-w-[360px] rounded-none' : 'max-w-[360px] rounded-3xl'
      }`}
      style={{ aspectRatio: '9 / 16' }}
    >
      <div className="flex h-full flex-col bg-gradient-to-b from-[#6b00ff] via-[#7a1aff] to-[#faf9f7]">
        <header
          className={`shrink-0 text-center ${compact ? 'px-3 pb-2 pt-3' : 'px-4 pb-3 pt-5'}`}
        >
          <div className={`flex items-center justify-center gap-2 ${compact ? 'mb-1' : 'mb-2'}`}>
            <img
              src={logoMundial}
              alt=""
              className={`rounded-lg object-cover ring-2 ring-white/30 ${
                compact ? 'h-7 w-7' : 'h-9 w-9'
              }`}
            />
            <p
              className={`font-display font-black uppercase tracking-[0.18em] text-white/90 ${
                compact ? 'text-[9px]' : 'text-[11px]'
              }`}
            >
              Nuestro Mundial
            </p>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-white/70">
            Resultados de la quiniela
          </p>
          <h2
            className={`mt-0.5 font-display leading-tight tracking-wide text-white ${
              compact ? 'text-lg' : 'text-2xl'
            }`}
          >
            {leagueName.trim()}
          </h2>
          <p className="mt-0.5 text-[9px] font-semibold text-white/75">
            {participantCount} participantes · 48 equipos · {teamsPerPlayer} por jugador
          </p>
        </header>

        <div className={`flex-1 ${compact ? 'px-2 pb-1.5' : 'px-3 pb-3'}`}>
          <div
            className={`grid h-full auto-rows-fr ${
              compact ? 'gap-1.5' : 'gap-2'
            } ${realAssignments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
          >
            {realAssignments.map((entry) => (
              <ParticipantCard
                key={entry.participant}
                entry={entry}
                compact={compact}
              />
            ))}
          </div>
        </div>

        {orphanEntry && orphanEntry.teams.length > 0 && (
          <div className="shrink-0 border-t border-amber-200/50 bg-amber-50/95 px-3 py-1.5">
            <p className="mb-1 text-[8px] font-black uppercase tracking-wide text-amber-800">
              {ORPHAN_PARTICIPANT}
            </p>
            <div className="flex flex-wrap gap-1">
              {orphanEntry.teams.map((team) => (
                <TeamFlag
                  key={team.code}
                  teamCode={team.code}
                  flagEmoji={team.flagEmoji}
                  size="xs"
                  loading="eager"
                />
              ))}
            </div>
          </div>
        )}

        <footer className="shrink-0 border-t border-white/20 bg-white/90 px-3 py-1.5 text-center">
          <p className="text-[8px] font-bold uppercase tracking-widest text-[#6b00ff]">
            nuestromundial.com
          </p>
          <p className="text-[7px] font-semibold text-stone-400">Mundial 2026</p>
        </footer>
      </div>
    </div>
  )
}

function ParticipantCard({
  entry,
  compact,
}: {
  entry: ParticipantAssignment
  compact?: boolean
}) {
  const clusters = clusterTeamsByGroup(entry.teams)

  return (
    <section
      className={`flex flex-col rounded-xl border border-white/60 bg-white/95 shadow-sm backdrop-blur-sm ${
        compact ? 'p-1.5' : 'p-2'
      }`}
    >
      <header
        className={`mb-1 flex items-baseline justify-between gap-1 border-b border-stone-100 ${
          compact ? 'pb-0.5' : 'pb-1'
        }`}
      >
        <h3
          className={`min-w-0 truncate font-black uppercase tracking-tight text-stone-900 ${
            compact ? 'text-[8px]' : 'text-[10px]'
          }`}
        >
          {entry.participant}
        </h3>
        <span
          className={`shrink-0 font-bold text-[#6b00ff] ${
            compact ? 'text-[8px]' : 'text-[9px]'
          }`}
        >
          {entry.teams.length}
        </span>
      </header>

      <div className={`grid grid-cols-2 ${compact ? 'gap-1' : 'gap-1.5'}`}>
        {clusters.map((cluster) => (
          <GroupCluster key={`${entry.participant}-${cluster.group}`} cluster={cluster} compact={compact} />
        ))}
      </div>
    </section>
  )
}

function GroupCluster({
  cluster,
  compact,
}: {
  cluster: { group: string; teams: ParticipantAssignment['teams'] }
  compact?: boolean
}) {
  const multi = cluster.teams.length > 1

  return (
    <div
      className={`rounded-lg border bg-stone-50/80 ${
        multi ? 'border-[#6b00ff]/25 bg-[#6b00ff]/5' : 'border-stone-200/80'
      } ${compact ? 'p-1' : 'p-1.5'}`}
    >
      <p
        className={`mb-0.5 font-black uppercase tracking-wider text-[#6b00ff] ${
          compact ? 'text-[7px]' : 'text-[8px]'
        }`}
      >
        Grupo {cluster.group}
        {multi ? ` · ${cluster.teams.length}` : ''}
      </p>
      <ul className="space-y-0.5">
        {cluster.teams.map((team) => (
          <li key={team.code} className="flex min-w-0 items-center gap-1">
            <TeamFlag
              teamCode={team.code}
              flagEmoji={team.flagEmoji}
              size="xs"
              loading="eager"
              width={compact ? 18 : 20}
              height={compact ? 12 : 14}
            />
            <span
              className={`min-w-0 flex-1 truncate font-semibold leading-tight text-stone-800 ${
                compact ? 'text-[7px]' : 'text-[8px]'
              }`}
            >
              {team.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
