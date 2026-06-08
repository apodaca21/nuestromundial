import type { SelectedPlayer } from '../types'
import { PITCH_BG } from '../fantasyImages'
import { PITCH_SLOTS } from '../pitchLayout'
import { PitchPlayerChip } from './PitchSlot'

interface DraftPitchProps {
  selectedTeam: SelectedPlayer[]
}

export function DraftPitch({ selectedTeam }: DraftPitchProps) {
  const byPosition = new Map(selectedTeam.map((p) => [p.positionId, p]))

  return (
    <div
      className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-xl shadow-lg sm:max-w-lg"
      style={{
        backgroundImage: `url('${PITCH_BG}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      aria-label="Formación 4-3-3"
    >
      {PITCH_SLOTS.map(({ positionId, top, left }) => {
        const player = byPosition.get(positionId)
        if (!player) return null

        return (
          <div
            key={positionId}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top, left }}
          >
            <PitchPlayerChip player={player} />
          </div>
        )
      })}
    </div>
  )
}
