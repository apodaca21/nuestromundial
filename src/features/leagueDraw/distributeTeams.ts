import type { WorldCupTeamEntry } from './worldCupTeams'
import type { GroupLetter } from '../groupPhase/groupData'

export const ORPHAN_PARTICIPANT = 'Equipos Huérfanos'

export interface ParticipantAssignment {
  participant: string
  teams: WorldCupTeamEntry[]
}

export type DrawDistributionMode = 'groups' | 'random'

export const DRAW_DISTRIBUTION_OPTIONS: Array<{
  id: DrawDistributionMode
  label: string
  description: string
}> = [
  {
    id: 'groups',
    label: 'Por grupos',
    description: 'Parejas de grupos del Mundial juntas (A+B, C+D…)',
  },
  {
    id: 'random',
    label: 'Aleatorio',
    description: 'Reparto totalmente al azar entre todos los equipos',
  },
]

/** Fisher-Yates — mezcla in-place y devuelve el mismo array. */
export function shuffleTeams<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/** Ordena equipos por grupo (A→L) para mostrar parejas juntas. */
export function sortTeamsByGroup(teams: WorldCupTeamEntry[]): WorldCupTeamEntry[] {
  return [...teams].sort((a, b) => a.group.localeCompare(b.group))
}

/**
 * Agrupa equipos consecutivos del mismo grupo para render compacto.
 * Ej: [H, K, F, F, I, I] → [{ group: F, teams: [...] }, ...]
 */
export function clusterTeamsByGroup(
  teams: WorldCupTeamEntry[],
): Array<{ group: GroupLetter; teams: WorldCupTeamEntry[] }> {
  const sorted = sortTeamsByGroup(teams)
  const clusters: Array<{ group: GroupLetter; teams: WorldCupTeamEntry[] }> = []

  for (const team of sorted) {
    const last = clusters[clusters.length - 1]
    if (last && last.group === team.group) {
      last.teams.push(team)
    } else {
      clusters.push({ group: team.group, teams: [team] })
    }
  }

  return clusters
}

/**
 * Reparte equipos en bloques de parejas de grupos (A+B, C+D…)
 * y luego asigna porciones consecutivas a cada jugador.
 */
function distributeByGroups(
  names: string[],
  teams: WorldCupTeamEntry[],
  perPlayer: number,
): ParticipantAssignment[] {
  const byGroup = new Map<GroupLetter, WorldCupTeamEntry[]>()
  for (const team of teams) {
    const bucket = byGroup.get(team.group) ?? []
    bucket.push(team)
    byGroup.set(team.group, bucket)
  }

  for (const [group, bucket] of byGroup) {
    byGroup.set(group, shuffleTeams(bucket))
  }

  const shuffledGroups = shuffleTeams([...byGroup.keys()])
  const pool: WorldCupTeamEntry[] = []

  for (let i = 0; i < shuffledGroups.length; i += 2) {
    const pair = [shuffledGroups[i], shuffledGroups[i + 1]].filter(Boolean)
    const pairTeams: WorldCupTeamEntry[] = []
    for (const group of pair) {
      pairTeams.push(...(byGroup.get(group) ?? []))
    }
    pool.push(...shuffleTeams(pairTeams))
  }

  return slicePoolToAssignments(names, pool, perPlayer, sortTeamsByGroup)
}

/** Fisher-Yates global y porciones consecutivas por jugador. */
function distributeRandom(
  names: string[],
  teams: WorldCupTeamEntry[],
  perPlayer: number,
): ParticipantAssignment[] {
  const pool = shuffleTeams(teams)
  return slicePoolToAssignments(names, pool, perPlayer, sortTeamsByGroup)
}

function slicePoolToAssignments(
  names: string[],
  pool: WorldCupTeamEntry[],
  perPlayer: number,
  sort: (items: WorldCupTeamEntry[]) => WorldCupTeamEntry[],
): ParticipantAssignment[] {
  const assignments: ParticipantAssignment[] = names.map((participant) => ({
    participant,
    teams: [],
  }))

  let cursor = 0
  for (const assignment of assignments) {
    assignment.teams = sort(pool.slice(cursor, cursor + perPlayer))
    cursor += perPlayer
  }

  const leftovers = pool.slice(cursor)
  if (leftovers.length > 0) {
    assignments.push({
      participant: ORPHAN_PARTICIPANT,
      teams: sort(leftovers),
    })
  }

  return assignments
}

export function distributeTeams(
  participants: string[],
  teams: WorldCupTeamEntry[],
  mode: DrawDistributionMode = 'groups',
): ParticipantAssignment[] {
  const names = participants.map((name) => name.trim()).filter(Boolean)
  if (names.length === 0) return []

  const perPlayer = Math.floor(teams.length / names.length)

  if (mode === 'random') {
    return distributeRandom(names, teams, perPlayer)
  }

  return distributeByGroups(names, teams, perPlayer)
}
