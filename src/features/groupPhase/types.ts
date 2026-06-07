import type { Team } from '../../types/match'
import type { GroupLetter } from './groupData'

export type DragStep = 'groups' | 'thirds' | 'bracket'

export interface GroupStandings {
  group: GroupLetter
  teams: Team[]
}

export interface ThirdPlaceEntry {
  team: Team
  group: GroupLetter
}

export interface ClassifiedTeam {
  team: Team
  group: GroupLetter
  rank: 1 | 2 | 3
  isBestThird?: boolean
  thirdPlaceRank?: number
}

export interface ManualStandingsResult {
  classified: ClassifiedTeam[]
  eliminatedThirds: ThirdPlaceEntry[]
  firstAndSecond: ClassifiedTeam[]
  bestThirds: ClassifiedTeam[]
}

export interface BracketMatch {
  id: string
  matchNumber: number
  home: ClassifiedTeam
  away: ClassifiedTeam
}
