import {
  calculateMatchOddsFromTeams,
  getEngineProbabilitiesForMatch,
} from './tournamentEngine'
import type { CommunityPoll, Match, WinProbabilities } from '../types/match'

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export { calculateMatchOddsFromTeams as calculateMatchOdds }

export function getCommunityPoll(
  matchId: string,
  probabilities: WinProbabilities,
): CommunityPoll {
  const votes = 400 + (hashId(`${matchId}-votes`) % 2400)
  return {
    homeVotesPercent: probabilities.homePercent,
    awayVotesPercent: probabilities.awayPercent,
    totalVotes: votes,
  }
}

export function getMatchProbabilities(match: Match): {
  probabilities: WinProbabilities
  poll: CommunityPoll
} {
  const probabilities = getEngineProbabilitiesForMatch(match)
  return {
    probabilities,
    poll: getCommunityPoll(match.id, probabilities),
  }
}
