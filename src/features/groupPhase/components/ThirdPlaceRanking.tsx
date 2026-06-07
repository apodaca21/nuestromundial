import { useState } from 'react'
import type { ThirdPlaceEntry } from '../types'
import { groupTeamId, swapThirdPlaces } from '../groupData'
import { GroupTeamRow } from './GroupTeamRow'

interface ThirdPlaceRankingProps {
  order: ThirdPlaceEntry[]
  onOrderChange: (order: ThirdPlaceEntry[]) => void
}

function ThirdPlaceRow({
  entry,
  rankLabel,
  qualified,
  eliminated,
  selected,
  swapTarget,
  onTap,
}: {
  entry: ThirdPlaceEntry
  rankLabel: string
  qualified?: boolean
  eliminated?: boolean
  selected: boolean
  swapTarget: boolean
  onTap: () => void
}) {
  return (
    <GroupTeamRow
      team={entry.team}
      group={entry.group}
      rankLabel={rankLabel}
      qualified={qualified}
      eliminated={eliminated}
      selected={selected}
      swapTarget={swapTarget}
      onTap={onTap}
    />
  )
}

export function ThirdPlaceRanking({ order, onOrderChange }: ThirdPlaceRankingProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const hasSelection = selectedId !== null

  const handleTap = (teamId: string) => {
    if (!selectedId) {
      setSelectedId(teamId)
      return
    }
    if (selectedId === teamId) {
      setSelectedId(null)
      return
    }
    onOrderChange(swapThirdPlaces(order, selectedId, teamId))
    setSelectedId(null)
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-3 py-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
          Clasificados · posiciones 1–8
        </p>
        <p className="mt-0.5 text-[10px] text-emerald-800/80">
          Los 8 mejores terceros avanzan a dieciseisavos.{' '}
          {hasSelection ? 'Toca otro para intercambiar.' : 'Toca dos equipos para reordenar.'}
        </p>
      </div>

      <div className="space-y-1.5">
        {order.slice(0, 8).map((entry, index) => {
          const id = groupTeamId(entry.group, entry.team.code)
          return (
            <ThirdPlaceRow
              key={id}
              entry={entry}
              rankLabel={`#${index + 1}`}
              qualified
              selected={selectedId === id}
              swapTarget={hasSelection && selectedId !== id}
              onTap={() => handleTap(id)}
            />
          )
        })}
      </div>

      <div
        className="relative my-3 flex items-center gap-3 py-1"
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

      <div className="space-y-1.5">
        {order.slice(8).map((entry, index) => {
          const id = groupTeamId(entry.group, entry.team.code)
          return (
            <ThirdPlaceRow
              key={id}
              entry={entry}
              rankLabel={`#${index + 9}`}
              eliminated
              selected={selectedId === id}
              swapTarget={hasSelection && selectedId !== id}
              onTap={() => handleTap(id)}
            />
          )
        })}
      </div>
    </div>
  )
}
