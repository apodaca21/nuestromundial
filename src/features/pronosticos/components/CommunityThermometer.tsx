import { useState } from 'react'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import { TeamFlag } from '../../../components/ui/TeamFlag'
import { VoteButton } from '../../../components/ui/VoteButton'
import { formatPercent, formatVoteCount } from '../../../lib/format'
import { sportCard } from '../../../lib/styles'
import { getTeamColors } from '../../../lib/teamVisuals'
import type { CommunityPoll, Team } from '../../../types/match'

type UserVote = 'home' | 'away' | null

interface CommunityThermometerProps {
  homeTeam: Team
  awayTeam: Team
  poll: CommunityPoll
  votingOpen?: boolean
}

export function CommunityThermometer({
  homeTeam,
  awayTeam,
  poll,
  votingOpen = true,
}: CommunityThermometerProps) {
  const [userVote, setUserVote] = useState<UserVote>(null)
  const showResults = !votingOpen || userVote !== null

  const { homeVotesPercent, awayVotesPercent, totalVotes } = poll
  const homeColors = getTeamColors(homeTeam.code)
  const awayColors = getTeamColors(awayTeam.code)

  const votedTeamName =
    userVote === 'home' ? homeTeam.name : userVote === 'away' ? awayTeam.name : ''

  return (
    <section className={sportCard}>
      <h2 className="mb-4 text-center text-base font-black uppercase tracking-tighter text-stone-900">
        ¿Quién ganará?
      </h2>

      {!showResults ? (
        <div className="flex flex-col gap-3">
          <VoteButton
            flagEmoji={homeTeam.flagEmoji}
            teamName={homeTeam.name}
            teamCode={homeTeam.code}
            onClick={() => setUserVote('home')}
          />
          <VoteButton
            flagEmoji={awayTeam.flagEmoji}
            teamName={awayTeam.name}
            teamCode={awayTeam.code}
            onClick={() => setUserVote('away')}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {!votingOpen && (
            <p className="text-center text-xs font-bold uppercase text-[#ff004d]">
              Votación cerrada — partido en curso o finalizado
            </p>
          )}
          {userVote && (
          <p className="text-center text-sm font-bold text-stone-600">
            Tu voto:{' '}
            <span className="font-black text-[#6b00ff]">{votedTeamName}</span>
          </p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-stone-600">
                <TeamFlag
                  teamCode={homeTeam.code}
                  flagEmoji={homeTeam.flagEmoji}
                  size="sm"
                />
                {homeTeam.name}
              </span>
              <span style={{ color: homeColors.primary }}>
                {formatPercent(homeVotesPercent)}
              </span>
            </div>
            <ProgressBar
              heightClass="h-2.5"
              segments={[
                {
                  value: homeVotesPercent,
                  colorClass: '',
                  style: { backgroundColor: homeColors.primary },
                },
                {
                  value: 100 - homeVotesPercent,
                  colorClass: 'bg-stone-100',
                },
              ]}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-stone-600">
                <TeamFlag
                  teamCode={awayTeam.code}
                  flagEmoji={awayTeam.flagEmoji}
                  size="sm"
                />
                {awayTeam.name}
              </span>
              <span style={{ color: awayColors.primary }}>
                {formatPercent(awayVotesPercent)}
              </span>
            </div>
            <ProgressBar
              heightClass="h-2.5"
              segments={[
                {
                  value: awayVotesPercent,
                  colorClass: '',
                  style: { backgroundColor: awayColors.primary },
                },
                {
                  value: 100 - awayVotesPercent,
                  colorClass: 'bg-stone-100',
                },
              ]}
            />
          </div>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {formatVoteCount(totalVotes)} pronósticos de la comunidad
          </p>
        </div>
      )}
    </section>
  )
}
