import { TeamFlag } from '../../../components/ui/TeamFlag'
import { getTeamColors } from '../../../lib/teamVisuals'
import type { Team } from '../../../types/match'
import type { GroupLetter } from '../groupData'

interface GroupTeamRowProps {
  team: Team
  rankLabel: string
  group?: GroupLetter
  qualified?: boolean
  eliminated?: boolean
  selected?: boolean
  swapTarget?: boolean
  onTap: () => void
}

export function GroupTeamRow({
  team,
  rankLabel,
  group,
  qualified = false,
  eliminated = false,
  selected = false,
  swapTarget = false,
  onTap,
}: GroupTeamRowProps) {
  const colors = getTeamColors(team.code)

  const shellClass = selected
    ? 'border-[#6b00ff] bg-[#6b00ff]/5 shadow-md shadow-[#6b00ff]/15 ring-2 ring-[#6b00ff]/30'
    : swapTarget
      ? 'border-[#6b00ff]/40 bg-[#6b00ff]/3'
      : qualified
        ? 'border-emerald-400/70 shadow-[0_0_0_1px_rgba(52,211,153,0.25)]'
        : eliminated
          ? 'border-red-200/80 opacity-55 grayscale'
          : 'border-stone-200'

  return (
    <button
      type="button"
      onClick={onTap}
      className={`flex w-full items-center gap-2 rounded-xl border bg-white px-2.5 py-2 text-left transition active:scale-[0.99] ${shellClass}`}
    >
      <span className="w-7 shrink-0 text-[10px] font-black tabular-nums text-stone-400">
        {rankLabel}
      </span>

      <TeamFlag teamCode={team.code} flagEmoji={team.flagEmoji} size="sm" />

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-bold"
          style={{ color: eliminated ? undefined : colors.primary }}
        >
          {team.name}
        </p>
        {group ? (
          <span className="mt-0.5 inline-block rounded-full bg-stone-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-stone-500">
            Grupo {group}
          </span>
        ) : null}
      </div>
    </button>
  )
}
