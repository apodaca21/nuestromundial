/** maps to: matches.status */
export type MatchStatus = 'pending' | 'live' | 'finished'

export type TournamentPhase =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter'
  | 'semi'
  | 'third_place'
  | 'final'

/** maps to: teams */
export interface Team {
  id: string
  name: string
  code: string
  flagEmoji: string
}

/** maps to: matches */
export interface Match {
  id: string
  homeTeam: Team | null
  awayTeam: Team | null
  homeLabel?: string
  awayLabel?: string
  kickoffAt: string
  status: MatchStatus
  venue: string
  city?: string
  phase: TournamentPhase
  phaseLabel: string
  group?: string
  matchNumber?: number
  homeScore?: number
  awayScore?: number
  winnerCode?: string | null
}

/** maps to: match_probabilities */
export interface WinProbabilities {
  homePercent: number
  awayPercent: number
}

/** maps to: community_polls */
export interface CommunityPoll {
  homeVotesPercent: number
  awayVotesPercent: number
  totalVotes: number
}

export interface PronosticosViewModel {
  match: Match
  probabilities: WinProbabilities
  communityPoll: CommunityPoll
}

export type AppTab =
  | 'quiniela'
  | 'pronosticos'
  | 'bingo'
  | 'estampa'
  | 'admin'

export interface ScheduleDayGroup {
  dateKey: string
  dateLabel: string
  matches: Match[]
}
