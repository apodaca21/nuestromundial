import { canVoteOnMatch } from '../../lib/schedule'
import type { OddsLoadState } from '../../hooks/useMatchOdds'
import type { Match } from '../../types/match'
import { CommunityThermometer } from './components/CommunityThermometer'
import { MatchStatsHeader } from './components/MatchStatsHeader'
import { WinProbabilityBar } from './components/WinProbabilityBar'

interface PronosticosScreenProps {
  match: Match
  oddsState: OddsLoadState | null
}

export function PronosticosScreen({ match, oddsState }: PronosticosScreenProps) {
  const { homeTeam, awayTeam } = match

  if (!homeTeam || !awayTeam || !oddsState) return null

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-2 sm:gap-5 sm:px-5 sm:pt-5 md:px-6">
      <MatchStatsHeader match={match} />

      <WinProbabilityBar
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homePercent={oddsState.probabilities.homePercent}
        awayPercent={oddsState.probabilities.awayPercent}
      />

      <CommunityThermometer
        matchId={match.id}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        poll={{
          homeVotesPercent: oddsState.probabilities.homePercent,
          awayVotesPercent: oddsState.probabilities.awayPercent,
          totalVotes: oddsState.poll.totalVotes,
        }}
        votingOpen={canVoteOnMatch(match)}
      />
    </div>
  )
}
