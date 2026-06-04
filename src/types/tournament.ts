export interface StoredMatchResult {
  homeScore: number
  awayScore: number
  winnerCode: string | null
  loserCode: string | null
  finishedAt: string
  updatedAt: string
}

export interface BracketAssignments {
  /** matchId → código FIFA en local o visitante */
  [matchId: string]: {
    homeTeamCode?: string
    awayTeamCode?: string
  }
}

export interface TournamentState {
  results: Record<string, StoredMatchResult>
  bracket: BracketAssignments
}

export const EMPTY_TOURNAMENT_STATE: TournamentState = {
  results: {},
  bracket: {},
}
