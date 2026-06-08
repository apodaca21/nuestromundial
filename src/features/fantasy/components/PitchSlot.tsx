import type { SelectedPlayer } from '../types'
import { getPlayerImageSrc } from '../fantasyImages'
import { getPositionShortLabel } from '../pitchLayout'

interface PitchPlayerChipProps {
  player: SelectedPlayer
  size?: 'sm' | 'md'
}

export function PitchPlayerChip({ player, size = 'md' }: PitchPlayerChipProps) {
  const sm = size === 'sm'

  return (
    <div
      className={`flex flex-col items-center ${sm ? 'w-[2.75rem] sm:w-[3.25rem]' : 'w-[4.5rem] sm:w-[5.5rem]'}`}
    >
      <div
        className={`overflow-hidden rounded-full border-2 border-white bg-white shadow-md ${
          sm ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-10 w-10 sm:h-12 sm:w-12'
        }`}
      >
        <img
          src={getPlayerImageSrc(player.positionName, player.name)}
          alt={player.name}
          className="h-full w-full object-cover object-top"
          draggable={false}
        />
      </div>
      <div className="mt-0.5 w-full rounded-md bg-white/90 px-1 py-0.5 text-center shadow-sm backdrop-blur-sm">
        <p
          className={`truncate font-bold leading-tight text-stone-900 ${
            sm ? 'text-[8px] sm:text-[9px]' : 'text-[9px] sm:text-[10px]'
          }`}
        >
          {player.name.split(' ').pop()}
        </p>
        <p
          className={`leading-none text-amber-500 ${sm ? 'text-[7px] sm:text-[8px]' : 'text-[8px] sm:text-[9px]'}`}
        >
          {'⭐'.repeat(player.stars)}
        </p>
      </div>
    </div>
  )
}

export function PitchPackButton({
  positionId,
  scale,
  isOpening,
  imageSrc,
  onClick,
  disabled,
}: {
  positionId: string
  scale: number
  isOpening: boolean
  imageSrc: string
  onClick: () => void
  disabled: boolean
}) {
  const label = getPositionShortLabel(positionId)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-[2.75rem] touch-manipulation flex-col items-center transition-all duration-300 ease-out sm:w-[3.25rem] ${
        disabled && !isOpening ? 'pointer-events-none opacity-50' : ''
      }`}
      style={{ transform: `scale(${scale})` }}
      aria-label={`Abrir sobre ${label}`}
    >
      <img
        src={imageSrc}
        alt={`Sobre ${label}`}
        className={`h-10 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:h-11 ${
          isOpening ? 'animate-wiggle' : ''
        }`}
        draggable={false}
      />
      <span className="mt-0.5 whitespace-nowrap rounded-md bg-stone-900/90 px-1.5 py-px text-[8px] font-black uppercase tracking-wide text-white shadow-md ring-1 ring-white/30 sm:text-[9px]">
        {label}
      </span>
    </button>
  )
}
