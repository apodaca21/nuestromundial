import type { RefObject } from 'react'
import { TeamFlag } from '../../../components/ui/TeamFlag'
import logoMundial from '../../../assets/logomundial.jpeg'
import {
  clusterTeamsByGroup,
  ORPHAN_PARTICIPANT,
  sortTeamsByGroup,
  type ParticipantAssignment,
} from '../distributeTeams'
import {
  getStoryDensity,
  STORY_FRAME_HEIGHT,
  STORY_FRAME_WIDTH,
  storyParticipantColumns,
  type StoryDensity,
} from '../storyDensity'

interface LeagueResultsStoryProps {
  leagueName: string
  assignments: ParticipantAssignment[]
  participantCount: number
  teamsPerPlayer: number
  innerRef?: RefObject<HTMLDivElement | null>
}

export function LeagueResultsStory({
  leagueName,
  assignments,
  participantCount,
  teamsPerPlayer,
  innerRef,
}: LeagueResultsStoryProps) {
  const realAssignments = assignments.filter(
    (entry) => entry.participant !== ORPHAN_PARTICIPANT,
  )
  const orphanEntry = assignments.find(
    (entry) => entry.participant === ORPHAN_PARTICIPANT,
  )
  const density = getStoryDensity(participantCount, teamsPerPlayer)
  const columns = storyParticipantColumns(participantCount, teamsPerPlayer)
  const useCompactGrid = density === 'dense' || density === 'ultra'

  return (
    <div className="mx-auto w-full max-w-[360px] px-1 sm:px-0">
      <div
        ref={innerRef}
        data-league-export
        className="mx-auto overflow-hidden shadow-xl ring-1 ring-stone-200/80 rounded-3xl"
        style={{
          width: '100%',
          maxWidth: STORY_FRAME_WIDTH,
          aspectRatio: `${STORY_FRAME_WIDTH} / ${STORY_FRAME_HEIGHT}`,
        }}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-[#6b00ff] via-[#7a1aff] to-[#faf9f7]">
          <StoryHeader
            leagueName={leagueName}
            participantCount={participantCount}
            teamsPerPlayer={teamsPerPlayer}
            density={density}
          />

          <div
            className={`min-h-0 flex-1 overflow-hidden ${
              density === 'ultra' ? 'px-1.5 pb-1' : density === 'dense' ? 'px-2 pb-1.5' : 'px-3 pb-2'
            }`}
          >
            <div
              className={`grid h-full min-h-0 auto-rows-fr overflow-hidden ${
                columns === 1 ? 'grid-cols-1' : 'grid-cols-2'
              } ${density === 'ultra' ? 'gap-1' : density === 'dense' ? 'gap-1.5' : 'gap-2'}`}
            >
              {realAssignments.map((entry) => (
                <ParticipantCard
                  key={entry.participant}
                  entry={entry}
                  density={density}
                  compactGrid={useCompactGrid}
                />
              ))}
            </div>
          </div>

          {orphanEntry && orphanEntry.teams.length > 0 && (
            <div className="shrink-0 border-t border-amber-200/50 bg-amber-50/95 px-2 py-1">
              <p className="mb-0.5 text-[7px] font-black uppercase tracking-wide text-amber-800">
                {ORPHAN_PARTICIPANT}
              </p>
              <div className="flex flex-wrap gap-0.5">
                {orphanEntry.teams.map((team) => (
                  <TeamFlag
                    key={team.code}
                    teamCode={team.code}
                    flagEmoji={team.flagEmoji}
                    size="xs"
                    loading="eager"
                    width={16}
                    height={11}
                  />
                ))}
              </div>
            </div>
          )}

          <StoryFooter density={density} />
        </div>
      </div>
    </div>
  )
}

function StoryHeader({
  leagueName,
  participantCount,
  teamsPerPlayer,
  density,
}: {
  leagueName: string
  participantCount: number
  teamsPerPlayer: number
  density: StoryDensity
}) {
  const tight = density === 'dense' || density === 'ultra'

  return (
    <header
      className={`shrink-0 text-center ${tight ? 'px-2 pb-1.5 pt-2' : 'px-3 pb-2 pt-3'}`}
    >
      <div className={`flex items-center justify-center gap-1.5 ${tight ? 'mb-0.5' : 'mb-1'}`}>
        <img
          src={logoMundial}
          alt=""
          className={`rounded-lg object-cover ring-2 ring-white/30 ${
            tight ? 'h-6 w-6' : 'h-8 w-8'
          }`}
        />
        <p
          className={`font-display font-black uppercase tracking-[0.16em] text-white/90 ${
            tight ? 'text-[8px]' : 'text-[10px]'
          }`}
        >
          Nuestro Mundial
        </p>
      </div>
      <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/70">
        Resultados de la quiniela
      </p>
      <h2
        className={`mt-0.5 font-display leading-tight tracking-wide text-white ${
          tight ? 'text-base' : 'text-xl'
        }`}
      >
        {leagueName.trim()}
      </h2>
      <p className={`mt-0.5 font-semibold text-white/75 ${tight ? 'text-[8px]' : 'text-[9px]'}`}>
        {participantCount} participantes · 48 equipos · {teamsPerPlayer} c/u
      </p>
    </header>
  )
}

function StoryFooter({ density }: { density: StoryDensity }) {
  const tight = density === 'dense' || density === 'ultra'
  return (
    <footer
      className={`shrink-0 border-t border-white/20 bg-white/90 text-center ${
        tight ? 'px-2 py-1' : 'px-3 py-1.5'
      }`}
    >
      <p className={`font-bold uppercase tracking-widest text-[#6b00ff] ${tight ? 'text-[7px]' : 'text-[8px]'}`}>
        nuestromundial.com
      </p>
      <p className={`font-semibold text-stone-400 ${tight ? 'text-[6px]' : 'text-[7px]'}`}>
        Mundial 2026
      </p>
    </footer>
  )
}

function ParticipantCard({
  entry,
  density,
  compactGrid,
}: {
  entry: ParticipantAssignment
  density: StoryDensity
  compactGrid: boolean
}) {
  const tight = density === 'dense' || density === 'ultra'
  const ultra = density === 'ultra'

  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/60 bg-white/95 shadow-sm ${
        ultra ? 'p-1' : tight ? 'p-1.5' : 'p-2'
      }`}
    >
      <header
        className={`mb-0.5 flex shrink-0 items-baseline justify-between gap-1 border-b border-stone-100 ${
          ultra ? 'pb-0.5' : 'pb-1'
        }`}
      >
        <h3
          className={`min-w-0 truncate font-black uppercase tracking-tight text-stone-900 ${
            ultra ? 'text-[7px]' : tight ? 'text-[8px]' : 'text-[10px]'
          }`}
        >
          {entry.participant}
        </h3>
        <span
          className={`shrink-0 font-bold text-[#6b00ff] ${
            ultra ? 'text-[7px]' : 'text-[8px]'
          }`}
        >
          {entry.teams.length}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {compactGrid ? (
          <CompactTeamGrid teams={entry.teams} density={density} />
        ) : (
          <div className={`grid grid-cols-2 ${tight ? 'gap-0.5' : 'gap-1'}`}>
            {clusterTeamsByGroup(entry.teams).map((cluster) => (
              <GroupCluster
                key={`${entry.participant}-${cluster.group}`}
                cluster={cluster}
                density={density}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function CompactTeamGrid({
  teams,
  density,
}: {
  teams: ParticipantAssignment['teams']
  density: StoryDensity
}) {
  const ultra = density === 'ultra'
  const sorted = sortTeamsByGroup(teams)
  const cols = ultra ? 4 : 3

  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {sorted.map((team) => (
        <div
          key={team.code}
          className="flex min-w-0 flex-col items-center rounded-md bg-stone-50/90 px-0.5 py-0.5"
        >
          <TeamFlag
            teamCode={team.code}
            flagEmoji={team.flagEmoji}
            size="xs"
            loading="eager"
            width={ultra ? 14 : 16}
            height={ultra ? 10 : 11}
          />
          <span
            className={`mt-0.5 max-w-full truncate font-bold text-stone-700 ${
              ultra ? 'text-[5px]' : 'text-[6px]'
            }`}
          >
            {team.code}
          </span>
          <span className={`font-black text-stone-400 ${ultra ? 'text-[5px]' : 'text-[6px]'}`}>
            {team.group}
          </span>
        </div>
      ))}
    </div>
  )
}

function GroupCluster({
  cluster,
  density,
}: {
  cluster: { group: string; teams: ParticipantAssignment['teams'] }
  density: StoryDensity
}) {
  const multi = cluster.teams.length > 1
  const tight = density === 'dense' || density === 'ultra'

  return (
    <div
      className={`min-w-0 rounded-lg border bg-stone-50/80 ${
        multi ? 'border-[#6b00ff]/25 bg-[#6b00ff]/5' : 'border-stone-200/80'
      } ${tight ? 'p-0.5' : 'p-1'}`}
    >
      <p
        className={`mb-0.5 font-black uppercase tracking-wider text-[#6b00ff] ${
          tight ? 'text-[6px]' : 'text-[7px]'
        }`}
      >
        Gr. {cluster.group}
        {multi ? ` · ${cluster.teams.length}` : ''}
      </p>
      <ul className="space-y-px">
        {cluster.teams.map((team) => (
          <li key={team.code} className="flex min-w-0 items-center gap-0.5">
            <TeamFlag
              teamCode={team.code}
              flagEmoji={team.flagEmoji}
              size="xs"
              loading="eager"
              width={tight ? 14 : 16}
              height={tight ? 10 : 11}
            />
            <span
              className={`min-w-0 flex-1 truncate font-semibold leading-none text-stone-800 ${
                tight ? 'text-[6px]' : 'text-[7px]'
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
