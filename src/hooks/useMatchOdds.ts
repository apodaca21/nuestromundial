import { useMemo } from 'react'
import { getMatchProbabilities } from '../lib/matchProbabilities'
import type { CommunityPoll, Match, WinProbabilities } from '../types/match'

export type OddsLoadState = {
  status: 'success'
  probabilities: WinProbabilities
  poll: CommunityPoll
}

export function useMatchOdds(match: Match | undefined): OddsLoadState | null {
  return useMemo(() => {
    if (!match?.homeTeam || !match.awayTeam) return null
    const { probabilities, poll } = getMatchProbabilities(match)
    return { status: 'success', probabilities, poll }
  }, [
    match?.id,
    match?.homeTeam?.code,
    match?.awayTeam?.code,
    match?.kickoffAt,
    match?.venue,
    match?.city,
    match?.phase,
  ])
}
