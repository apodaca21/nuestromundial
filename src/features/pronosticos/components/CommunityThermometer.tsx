import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import { TeamFlag } from '../../../components/ui/TeamFlag'
import { VoteButton } from '../../../components/ui/VoteButton'
import { useAuth } from '../../../context/AuthContext'
import { formatPercent, formatVoteCount } from '../../../lib/format'
import { sportCard } from '../../../lib/styles'
import { getTeamColors } from '../../../lib/teamVisuals'
import {
  fetchUserPollVote,
  saveUserPollVote,
  type PollVoteSide,
} from '../../../services/poll/pollVoteService'
import type { CommunityPoll, Team } from '../../../types/match'

type UserVote = PollVoteSide | null

interface CommunityThermometerProps {
  matchId: string
  homeTeam: Team
  awayTeam: Team
  poll: CommunityPoll
  votingOpen?: boolean
}

export function CommunityThermometer({
  matchId,
  homeTeam,
  awayTeam,
  poll,
  votingOpen = true,
}: CommunityThermometerProps) {
  const { user } = useAuth()
  const [userVote, setUserVote] = useState<UserVote>(null)
  const [voteLoaded, setVoteLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setVoteLoaded(false)
    setUserVote(null)

    if (!user?.id) {
      setVoteLoaded(true)
      return
    }

    void fetchUserPollVote(matchId, user.id).then((saved) => {
      if (cancelled) return
      setUserVote(saved)
      setVoteLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [matchId, user?.id])

  const handleVote = useCallback(
    (side: PollVoteSide) => {
      if (!votingOpen) return
      setUserVote(side)
      if (user?.id) {
        const teamCode = side === 'home' ? homeTeam.code : awayTeam.code
        void saveUserPollVote(matchId, user.id, side, teamCode)
      }
    },
    [votingOpen, user?.id, matchId, homeTeam.code, awayTeam.code],
  )

  const showVoteButtons = votingOpen && userVote === null && voteLoaded

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

      {!voteLoaded && user ? (
        <div className="flex min-h-[7.5rem] items-center justify-center gap-2 text-sm font-bold text-stone-400">
          <Loader2 className="h-4 w-4 animate-spin text-[#6b00ff]" aria-hidden />
          Cargando tu voto…
        </div>
      ) : showVoteButtons ? (
        <div className="flex flex-col gap-3">
          <VoteButton
            flagEmoji={homeTeam.flagEmoji}
            teamName={homeTeam.name}
            teamCode={homeTeam.code}
            onClick={() => handleVote('home')}
          />
          <VoteButton
            flagEmoji={awayTeam.flagEmoji}
            teamName={awayTeam.name}
            teamCode={awayTeam.code}
            onClick={() => handleVote('away')}
          />
          {!user && (
            <p className="text-center text-[10px] leading-snug text-stone-400">
              Inicia sesión para guardar tu voto al volver
            </p>
          )}
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
