import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { GroupStandings } from '../types'
import {
  groupTeamId,
  reorderGroupTeams,
  type GroupLetter,
} from '../groupData'
import { SortableTeamCard } from './SortableTeamCard'

const RANK_LABELS = ['1º', '2º', '3º', '4º']

interface GroupDragBoardProps {
  groups: GroupStandings[]
  onGroupsChange: (groups: GroupStandings[]) => void
}

function GroupColumn({ entry }: { entry: GroupStandings }) {
  const itemIds = entry.teams.map((team) => groupTeamId(entry.group, team.code))

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wide text-[#6b00ff]">
          Grupo {entry.group}
        </h3>
        <span className="text-[10px] font-bold text-stone-400">Arrastra ↕</span>
      </div>

      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {entry.teams.map((team, index) => (
            <SortableTeamCard
              key={groupTeamId(entry.group, team.code)}
              id={groupTeamId(entry.group, team.code)}
              team={team}
              rankLabel={RANK_LABELS[index]}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function GroupDragBoard({ groups, onGroupsChange }: GroupDragBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const activeGroup = activeId.split('-')[0] as GroupLetter
    const overGroup = overId.split('-')[0] as GroupLetter
    if (activeGroup !== overGroup) return

    const groupEntry = groups.find((g) => g.group === activeGroup)
    if (!groupEntry) return

    const ids = groupEntry.teams.map((team) =>
      groupTeamId(activeGroup, team.code),
    )
    const oldIndex = ids.indexOf(activeId)
    const newIndex = ids.indexOf(overId)
    if (oldIndex < 0 || newIndex < 0) return

    const nextIds = [...ids]
    const [moved] = nextIds.splice(oldIndex, 1)
    nextIds.splice(newIndex, 0, moved)

    const teamCodes = nextIds.map((id) => id.slice(activeGroup.length + 1))
    onGroupsChange(reorderGroupTeams(groups, activeGroup, teamCodes))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {groups.map((entry) => (
          <GroupColumn key={entry.group} entry={entry} />
        ))}
      </div>
    </DndContext>
  )
}

export function GroupLegend() {
  return (
    <p className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[10px] leading-snug text-stone-500">
      <span className="font-black text-stone-600">1º y 2º</span> clasifican
      directo.{' '}
      <span className="font-black text-stone-600">3º</span> va a la zona de
      supervivencia. <span className="font-black text-stone-600">4º</span> queda
      fuera.
    </p>
  )
}
