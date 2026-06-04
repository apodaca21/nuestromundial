import { ProgressBar } from '../../../components/ui/ProgressBar'
import { TeamFlag } from '../../../components/ui/TeamFlag'
import { formatPercent } from '../../../lib/format'
import { sportCard } from '../../../lib/styles'
import { getTeamColors } from '../../../lib/teamVisuals'
import type { Team } from '../../../types/match'

interface WinProbabilityBarProps {
  homeTeam: Team
  awayTeam: Team
  homePercent: number
  awayPercent: number
}

export function WinProbabilityBar({
  homeTeam,
  awayTeam,
  homePercent,
  awayPercent,
}: WinProbabilityBarProps) {
  const homeColors = getTeamColors(homeTeam.code)
  const awayColors = getTeamColors(awayTeam.code)

  return (
    <section className={sportCard}>
      <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
        Probabilidad estimada de victoria
      </h2>

      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TeamFlag
            teamCode={homeTeam.code}
            flagEmoji={homeTeam.flagEmoji}
            size="sm"
          />
          <span
            className="text-2xl font-black tracking-tighter"
            style={{ color: homeColors.primary }}
          >
            {formatPercent(homePercent)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-2xl font-black tracking-tighter"
            style={{ color: awayColors.primary }}
          >
            {formatPercent(awayPercent)}
          </span>
          <TeamFlag
            teamCode={awayTeam.code}
            flagEmoji={awayTeam.flagEmoji}
            size="sm"
          />
        </div>
      </div>

      <ProgressBar
        animateOnMount
        heightClass="h-4"
        segments={[
          { value: homePercent, colorClass: '', style: { backgroundColor: homeColors.primary } },
          { value: awayPercent, colorClass: '', style: { backgroundColor: awayColors.primary } },
        ]}
      />

      <div className="mt-3 flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span style={{ color: homeColors.primary }}>{homeTeam.name}</span>
        <span style={{ color: awayColors.primary }}>{awayTeam.name}</span>
      </div>
    </section>
  )
}
