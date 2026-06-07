import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { TeamFlag } from '../../../components/ui/TeamFlag'
import { getTeamColors } from '../../../lib/teamVisuals'
import type { Team } from '../../../types/match'
import type { GroupLetter } from '../groupData'

interface SortableTeamCardProps {
  id: string
  team: Team
  group?: GroupLetter
  rankLabel?: string
  qualified?: boolean
  eliminated?: boolean
  compact?: boolean
}

export function SortableTeamCard({
  id,
  team,
  group,
  rankLabel,
  qualified = false,
  eliminated = false,
  compact = false,
}: SortableTeamCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const colors = getTeamColors(team.code)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center gap-2 rounded-xl border bg-white px-2.5 py-2 transition-shadow ${
        compact ? 'py-1.5' : 'py-2'
      } ${
        isDragging
          ? 'z-20 scale-[1.02] border-[#6b00ff] shadow-lg shadow-[#6b00ff]/20'
          : qualified
            ? 'border-emerald-400/70 shadow-[0_0_0_1px_rgba(52,211,153,0.25)]'
            : eliminated
              ? 'border-red-200/80 opacity-55 grayscale'
              : 'border-stone-200'
      }`}
    >
      {rankLabel ? (
        <span className="w-7 shrink-0 text-[10px] font-black tabular-nums text-stone-400">
          {rankLabel}
        </span>
      ) : null}

      <button
        type="button"
        className="flex min-h-9 min-w-9 shrink-0 touch-manipulation items-center justify-center rounded-lg text-stone-400 active:bg-stone-100"
        aria-label={`Reordenar ${team.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" aria-hidden />
      </button>

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
    </div>
  )
}
