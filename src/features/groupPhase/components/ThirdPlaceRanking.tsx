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
import type { ThirdPlaceEntry } from '../types'
import { groupTeamId, reorderThirdPlaces } from '../groupData'
import { SortableTeamCard } from './SortableTeamCard'

interface ThirdPlaceRankingProps {
  order: ThirdPlaceEntry[]
  onOrderChange: (order: ThirdPlaceEntry[]) => void
}

export function ThirdPlaceRanking({ order, onOrderChange }: ThirdPlaceRankingProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const itemIds = order.map((entry) => groupTeamId(entry.group, entry.team.code))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onOrderChange(
      reorderThirdPlaces(order, String(active.id), String(over.id)),
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-3 py-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
          Clasificados · posiciones 1–8
        </p>
        <p className="mt-0.5 text-[10px] text-emerald-800/80">
          Los 8 mejores terceros avanzan a dieciseisavos
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {order.slice(0, 8).map((entry, index) => (
              <SortableTeamCard
                key={groupTeamId(entry.group, entry.team.code)}
                id={groupTeamId(entry.group, entry.team.code)}
                team={entry.team}
                group={entry.group}
                rankLabel={`#${index + 1}`}
                qualified
              />
            ))}
          </div>

          <div
            className="relative my-4 flex items-center gap-3 py-1"
            aria-hidden
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#ff004d] to-transparent" />
            <span className="shrink-0 rounded-full border border-[#ff004d]/30 bg-[#ff004d]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#ff004d]">
              Corte · 8 clasifican
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#ff004d] to-transparent" />
          </div>

          <div className="rounded-xl border border-red-200/70 bg-red-50/40 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
              Eliminados · posiciones 9–12
            </p>
          </div>

          <div className="mt-2 space-y-2">
            {order.slice(8).map((entry, index) => (
              <SortableTeamCard
                key={groupTeamId(entry.group, entry.team.code)}
                id={groupTeamId(entry.group, entry.team.code)}
                team={entry.team}
                group={entry.group}
                rankLabel={`#${index + 9}`}
                eliminated
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
