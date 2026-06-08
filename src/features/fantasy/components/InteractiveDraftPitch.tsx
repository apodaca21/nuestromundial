import type { DraftPlayer, PackState, SelectedPlayer } from '../types'
import { PACK_IMAGES, PITCH_BG } from '../fantasyImages'
import { getPositionShortLabel, PITCH_SLOTS } from '../pitchLayout'
import { PitchPackButton, PitchPlayerChip } from './PitchSlot'
import { PlayerCard } from './PlayerCard'

interface InteractiveDraftPitchProps {
  selectedByPosition: Record<string, SelectedPlayer>
  activePositionId: string | null
  packState: PackState
  openingPhase: 'early' | 'late'
  currentOptions: DraftPlayer[]
  activePositionName: string | null
  onPackClick: (positionId: string) => void
  onSelectPlayer: (player: DraftPlayer) => void
}

function packScale(
  positionId: string,
  activePositionId: string | null,
  packState: PackState,
  openingPhase: 'early' | 'late',
): number {
  if (positionId !== activePositionId) return 1
  if (packState === 'REVEALED') return 1.55
  if (packState === 'OPENING' && openingPhase === 'late') return 1.4
  if (packState === 'OPENING') return 1.2
  return 1
}

function packImageForActive(
  activePositionId: string | null,
  positionId: string,
  packState: PackState,
  openingPhase: 'early' | 'late',
): string {
  if (positionId !== activePositionId) return PACK_IMAGES.closed
  if (packState === 'REVEALED') return PACK_IMAGES.open
  if (packState === 'OPENING' && openingPhase === 'late') return PACK_IMAGES.open
  if (packState === 'OPENING') return PACK_IMAGES.opening
  return PACK_IMAGES.closed
}

export function InteractiveDraftPitch({
  selectedByPosition,
  activePositionId,
  packState,
  openingPhase,
  currentOptions,
  activePositionName,
  onPackClick,
  onSelectPlayer,
}: InteractiveDraftPitchProps) {
  const filledCount = Object.keys(selectedByPosition).length
  const isBusy = activePositionId !== null

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-base font-semibold text-stone-700 sm:text-lg">
        Toca un sobre para abrirlo ({filledCount}/11)
      </p>

      <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-xl shadow-lg sm:max-w-lg">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${PITCH_BG}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden
        />

        {PITCH_SLOTS.map(({ positionId, top, left }) => {
          const selected = selectedByPosition[positionId]
          const isActive = positionId === activePositionId
          const scale = packScale(positionId, activePositionId, packState, openingPhase)

          return (
            <div
              key={positionId}
              className={`absolute -translate-x-1/2 -translate-y-1/2 ${isActive ? 'z-30' : 'z-10'}`}
              style={{ top, left }}
            >
              {selected ? (
                <PitchPlayerChip player={selected} size="sm" />
              ) : (
                <PitchPackButton
                  positionId={positionId}
                  scale={scale}
                  isOpening={isActive && packState === 'OPENING'}
                  imageSrc={packImageForActive(
                    activePositionId,
                    positionId,
                    packState,
                    openingPhase,
                  )}
                  onClick={() => onPackClick(positionId)}
                  disabled={isBusy}
                />
              )}
            </div>
          )
        })}

        {packState === 'REVEALED' &&
          currentOptions.length > 0 &&
          activePositionName && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/45 px-1.5 py-2 backdrop-blur-[2px] sm:p-4">
              <p className="mb-1.5 max-w-full truncate px-1 text-center text-[11px] font-bold text-white sm:mb-3 sm:text-base">
                Elige tu {getPositionShortLabel(activePositionId ?? '')}
              </p>
              <div className="grid w-full grid-cols-3 gap-1 sm:gap-3 [grid-template-columns:repeat(3,minmax(0,1fr))]">
                {currentOptions.map((player, index) => (
                  <PlayerCard
                    key={`${player.name}-${index}`}
                    player={player}
                    positionName={activePositionName}
                    compact
                    pitchOverlay
                    onSelect={() => onSelectPlayer(player)}
                  />
                ))}
              </div>
            </div>
          )}
      </div>

      {!isBusy && filledCount < 11 && (
        <p className="text-center text-sm text-stone-500">
          Abre los sobres en el orden que prefieras
        </p>
      )}
    </div>
  )
}
