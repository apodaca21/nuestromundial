import { useState } from 'react'
import type { GroupStandings } from '../types'
import {
  groupTeamId,
  reorderGroupTeams,
  type GroupLetter,
} from '../groupData'
import { GroupTeamRow } from './GroupTeamRow'

const RANK_LABELS = ['1º', '2º', '3º', '4º']

interface GroupDragBoardProps {
  groups: GroupStandings[]
  onGroupsChange: (groups: GroupStandings[]) => void
}

function GroupColumn({
  entry,
  selectedId,
  onSelect,
  onSwap,
}: {
  entry: GroupStandings
  selectedId: string | null
  onSelect: (id: string | null) => void
  onSwap: (group: GroupLetter, idA: string, idB: string) => void
}) {
  const itemIds = entry.teams.map((team) => groupTeamId(entry.group, team.code))
  const hasSelection = selectedId !== null && itemIds.includes(selectedId)

  const handleTap = (teamId: string) => {
    if (!selectedId) {
      onSelect(teamId)
      return
    }
    if (selectedId === teamId) {
      onSelect(null)
      return
    }
    onSwap(entry.group, selectedId, teamId)
    onSelect(null)
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-black uppercase tracking-wide text-[#6b00ff]">
          Grupo {entry.group}
        </h3>
        <span className="text-right text-[10px] font-bold leading-snug text-stone-400">
          {hasSelection ? 'Toca otro para intercambiar' : 'Toca dos equipos'}
        </span>
      </div>

      <div className="space-y-1.5">
        {entry.teams.map((team, index) => {
          const id = groupTeamId(entry.group, team.code)
          return (
            <GroupTeamRow
              key={id}
              team={team}
              rankLabel={RANK_LABELS[index]}
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

export function GroupDragBoard({ groups, onGroupsChange }: GroupDragBoardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSwap = (group: GroupLetter, idA: string, idB: string) => {
    const groupEntry = groups.find((g) => g.group === group)
    if (!groupEntry) return

    const ids = groupEntry.teams.map((team) => groupTeamId(group, team.code))
    const indexA = ids.indexOf(idA)
    const indexB = ids.indexOf(idB)
    if (indexA < 0 || indexB < 0) return

    const nextIds = [...ids]
    ;[nextIds[indexA], nextIds[indexB]] = [nextIds[indexB], nextIds[indexA]]

    const teamCodes = nextIds.map((id) => id.slice(group.length + 1))
    onGroupsChange(reorderGroupTeams(groups, group, teamCodes))
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {groups.map((entry) => (
        <GroupColumn
          key={entry.group}
          entry={entry}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onSwap={handleSwap}
        />
      ))}
    </div>
  )
}

export function GroupLegend() {
  return (
    <p className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[10px] leading-snug text-stone-500">
      <span className="font-black text-stone-600">1º y 2º</span> clasifican
      directo.{' '}
      <span className="font-black text-stone-600">3º</span> va a la zona de
      supervivencia. <span className="font-black text-stone-600">4º</span> queda
      fuera. Toca un equipo y luego otro del mismo grupo para intercambiar
      posiciones.
    </p>
  )
}
