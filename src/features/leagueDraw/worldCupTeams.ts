import { getTeam } from '../../data/teams'
import { GROUP_LETTERS, type GroupLetter } from '../groupPhase/groupData'

export interface WorldCupTeamEntry {
  code: string
  name: string
  flagEmoji: string
  group: GroupLetter
}

export interface WorldCupGroup {
  letter: GroupLetter
  teams: WorldCupTeamEntry[]
}

const GROUP_TEAM_CODES: Record<GroupLetter, string[]> = {
  A: ['MEX', 'RSA', 'KOR', 'CZE'],
  B: ['CAN', 'BIH', 'QAT', 'SUI'],
  C: ['HAI', 'SCO', 'BRA', 'MAR'],
  D: ['USA', 'PAR', 'AUS', 'TUR'],
  E: ['CIV', 'ECU', 'GER', 'CUW'],
  F: ['NED', 'JPN', 'SWE', 'TUN'],
  G: ['IRN', 'NZL', 'BEL', 'EGY'],
  H: ['KSA', 'URU', 'ESP', 'CPV'],
  I: ['FRA', 'SEN', 'IRQ', 'NOR'],
  J: ['ARG', 'ALG', 'AUT', 'JOR'],
  K: ['POR', 'COD', 'UZB', 'COL'],
  L: ['GHA', 'PAN', 'ENG', 'CRO'],
}

/** 48 selecciones oficiales del Mundial 2026, agrupadas A–L (4 por grupo). */
export const WORLD_CUP_TEAMS: WorldCupGroup[] = GROUP_LETTERS.map((letter) => ({
  letter,
  teams: GROUP_TEAM_CODES[letter].map((code) => {
    const team = getTeam(code)
    return {
      code: team.code,
      name: team.name,
      flagEmoji: team.flagEmoji,
      group: letter,
    }
  }),
}))

export const ALL_WORLD_CUP_TEAMS: WorldCupTeamEntry[] = WORLD_CUP_TEAMS.flatMap(
  (group) => group.teams,
)
