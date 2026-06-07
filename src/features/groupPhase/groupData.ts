import { GROUP_STAGE_LINES } from '../../data/groupStageSchedule'
import { getTeam } from '../../data/teams'
import type { GroupStandings, ThirdPlaceEntry } from './types'

export const GROUP_LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
] as const

export type GroupLetter = (typeof GROUP_LETTERS)[number]

export function buildInitialGroups(): GroupStandings[] {
  const teamsByGroup = new Map<string, Set<string>>()

  for (const line of GROUP_STAGE_LINES.split('\n').filter(Boolean)) {
    const [, , , group, home, away] = line.split('|')
    if (!teamsByGroup.has(group)) teamsByGroup.set(group, new Set())
    teamsByGroup.get(group)!.add(home)
    teamsByGroup.get(group)!.add(away)
  }

  return GROUP_LETTERS.map((group) => ({
    group,
    teams: [...(teamsByGroup.get(group) ?? [])].map((code) => getTeam(code)),
  }))
}

export function groupTeamId(group: GroupLetter, teamCode: string): string {
  return `${group}-${teamCode}`
}

export function extractThirdPlaces(groups: GroupStandings[]): ThirdPlaceEntry[] {
  return groups.map((entry) => ({
    team: entry.teams[2],
    group: entry.group,
  }))
}

export function syncThirdPlaceOrder(
  groups: GroupStandings[],
  previous: ThirdPlaceEntry[],
): ThirdPlaceEntry[] {
  const next = extractThirdPlaces(groups)
  const prevIndex = new Map(
    previous.map((entry, index) => [
      groupTeamId(entry.group, entry.team.code),
      index,
    ]),
  )

  return [...next].sort((a, b) => {
    const ia = prevIndex.get(groupTeamId(a.group, a.team.code))
    const ib = prevIndex.get(groupTeamId(b.group, b.team.code))
    if (ia === undefined && ib === undefined) return a.group.localeCompare(b.group)
    if (ia === undefined) return 1
    if (ib === undefined) return -1
    return ia - ib
  })
}

export function reorderGroupTeams(
  groups: GroupStandings[],
  group: GroupLetter,
  teamCodes: string[],
): GroupStandings[] {
  return groups.map((entry) => {
    if (entry.group !== group) return entry
    const byCode = new Map(entry.teams.map((team) => [team.code, team]))
    return {
      ...entry,
      teams: teamCodes.map((code) => byCode.get(code)!).filter(Boolean),
    }
  })
}

export function swapThirdPlaces(
  order: ThirdPlaceEntry[],
  idA: string,
  idB: string,
): ThirdPlaceEntry[] {
  const indexA = order.findIndex(
    (entry) => groupTeamId(entry.group, entry.team.code) === idA,
  )
  const indexB = order.findIndex(
    (entry) => groupTeamId(entry.group, entry.team.code) === idB,
  )
  if (indexA < 0 || indexB < 0 || indexA === indexB) return order

  const next = [...order]
  ;[next[indexA], next[indexB]] = [next[indexB], next[indexA]]
  return next
}

export function reorderThirdPlaces(
  order: ThirdPlaceEntry[],
  activeId: string,
  overId: string,
): ThirdPlaceEntry[] {
  const oldIndex = order.findIndex(
    (entry) => groupTeamId(entry.group, entry.team.code) === activeId,
  )
  const newIndex = order.findIndex(
    (entry) => groupTeamId(entry.group, entry.team.code) === overId,
  )
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return order

  const next = [...order]
  const [moved] = next.splice(oldIndex, 1)
  next.splice(newIndex, 0, moved)
  return next
}
