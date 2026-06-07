import { TeamFlag } from '../../../components/ui/TeamFlag'
import { getTeamColors } from '../../../lib/teamVisuals'
import type { Team } from '../../../types/match'

interface GroupTeamRowProps {
  team: Team
  rankLabel: string
  selected?: boolean
  swapTarget?: boolean
  onTap: () => void
}

export function GroupTeamRow({
  team,
  rankLabel,
  selected = false,
  swapTarget = false,
  onTap,
}: GroupTeamRowProps) {
  const colors = getTeamColors(team.code)

  return (
    <button
      type="button"
      onClick={onTap}
      className={`flex w-full items-center gap-2 rounded-xl border bg-white px-2.5 py-2 text-left transition active:scale-[0.99] ${
        selected
          ? 'border-[#6b00ff] bg-[#6b00ff]/5 shadow-md shadow-[#6b00ff]/15 ring-2 ring-[#6b00ff]/30'
          : swapTarget
            ? 'border-[#6b00ff]/40 bg-[#6b00ff]/3'
            : 'border-stone-200'
      }`}
    >
      <span className="w-7 shrink-0 text-[10px] font-black tabular-nums text-stone-400">
        {rankLabel}
      </span>

      <TeamFlag teamCode={team.code} flagEmoji={team.flagEmoji} size="sm" />

      <p className="min-w-0 flex-1 truncate text-sm font-bold" style={{ color: colors.primary }}>
        {team.name}
      </p>
    </button>
  )
}
