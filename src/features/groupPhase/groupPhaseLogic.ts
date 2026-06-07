import type { GroupLetter } from './groupData'
import {
  mapThirdPlacesToWinnerSlots,
  type WinnerThirdSlot,
} from './thirdPlaceAnnexC'
import type {
  BracketMatch,
  ClassifiedTeam,
  GroupStandings,
  ManualStandingsResult,
  ThirdPlaceEntry,
} from './types'

export function resolveManualStandings(
  groups: GroupStandings[],
  thirdPlaceOrder: ThirdPlaceEntry[],
): ManualStandingsResult {
  const firstAndSecond: ClassifiedTeam[] = []

  for (const group of groups) {
    firstAndSecond.push({
      team: group.teams[0],
      group: group.group,
      rank: 1,
    })
    firstAndSecond.push({
      team: group.teams[1],
      group: group.group,
      rank: 2,
    })
  }

  const bestThirds: ClassifiedTeam[] = thirdPlaceOrder.slice(0, 8).map((entry, index) => ({
    team: entry.team,
    group: entry.group,
    rank: 3,
    isBestThird: true,
    thirdPlaceRank: index + 1,
  }))

  const eliminatedThirds = thirdPlaceOrder.slice(8)

  return {
    classified: [...firstAndSecond, ...bestThirds],
    eliminatedThirds,
    firstAndSecond,
    bestThirds,
  }
}

type RankSlot = { rank: 1 | 2; group: GroupLetter }

const R32_MATCH_NUMS = [
  73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88,
] as const

/** Plantilla FIFA — partidos fijos sin terceros (knockoutSchedule.ts). */
const FIXED_R32_MATCHES: Record<number, { home: RankSlot; away: RankSlot }> = {
  73: { home: { rank: 2, group: 'A' }, away: { rank: 2, group: 'B' } },
  75: { home: { rank: 1, group: 'F' }, away: { rank: 2, group: 'C' } },
  76: { home: { rank: 1, group: 'C' }, away: { rank: 2, group: 'F' } },
  78: { home: { rank: 2, group: 'E' }, away: { rank: 2, group: 'I' } },
  83: { home: { rank: 2, group: 'K' }, away: { rank: 2, group: 'L' } },
  84: { home: { rank: 1, group: 'H' }, away: { rank: 2, group: 'J' } },
  86: { home: { rank: 1, group: 'J' }, away: { rank: 2, group: 'H' } },
  88: { home: { rank: 2, group: 'D' }, away: { rank: 2, group: 'G' } },
}

/** Ganador de grupo vs tercero — Annex C define qué tercero va a cada cruce. */
const THIRD_WINNER_R32: Record<number, WinnerThirdSlot> = {
  74: 'E',
  77: 'I',
  79: 'A',
  80: 'L',
  81: 'D',
  82: 'G',
  85: 'B',
  87: 'K',
}

function r32Id(matchNumber: number): string {
  return `r32-${matchNumber - 72}`
}

function findByGroupRank(
  classified: ClassifiedTeam[],
  group: GroupLetter,
  rank: 1 | 2 | 3,
): ClassifiedTeam | undefined {
  return classified.find((entry) => entry.group === group && entry.rank === rank)
}

function resolveRankSlot(
  classified: ClassifiedTeam[],
  slot: RankSlot,
): ClassifiedTeam {
  const team = findByGroupRank(classified, slot.group, slot.rank)
  if (!team) {
    throw new Error(`Falta ${slot.rank}º del Grupo ${slot.group} para armar el bracket.`)
  }
  return team
}

/** Dieciseisavos según calendario FIFA 2026 + Annex C para mejores terceros. */
export function generateBracketTree(classified: ClassifiedTeam[]): BracketMatch[] {
  const bestThirds = classified.filter((entry) => entry.isBestThird)
  const qualifyingGroups = bestThirds.map((entry) => entry.group)
  const thirdMapping = mapThirdPlacesToWinnerSlots(qualifyingGroups)

  if (!thirdMapping) {
    throw new Error('No se pudo resolver la combinación de mejores terceros (Annex C).')
  }

  const matches: BracketMatch[] = []

  for (const matchNumber of R32_MATCH_NUMS) {
    const fixed = FIXED_R32_MATCHES[matchNumber]
    const winnerSlot = THIRD_WINNER_R32[matchNumber]

    if (fixed) {
      matches.push({
        id: r32Id(matchNumber),
        matchNumber,
        home: resolveRankSlot(classified, fixed.home),
        away: resolveRankSlot(classified, fixed.away),
      })
      continue
    }

    if (winnerSlot) {
      const thirdGroup = thirdMapping[winnerSlot]
      const home = findByGroupRank(classified, winnerSlot, 1)
      const away = findByGroupRank(classified, thirdGroup, 3)

      if (!home || !away) {
        throw new Error(
          `Falta cruce 1${winnerSlot} vs 3${thirdGroup} (partido ${matchNumber}).`,
        )
      }

      matches.push({
        id: r32Id(matchNumber),
        matchNumber,
        home,
        away,
      })
      continue
    }

    throw new Error(`Partido ${matchNumber} sin plantilla de dieciseisavos.`)
  }

  return matches
}

export function formatClassifiedLabel(entry: ClassifiedTeam): string {
  if (entry.isBestThird) {
    return `${entry.rank}º Grupo ${entry.group} · Mejor 3º #${entry.thirdPlaceRank}`
  }
  return `${entry.rank}º Grupo ${entry.group}`
}
