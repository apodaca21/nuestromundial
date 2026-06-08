import type { DraftPlayer } from '../types'
import { getPlayerImageSrc } from '../fantasyImages'

interface PlayerCardProps {
  player: DraftPlayer
  positionName: string
  onSelect: () => void
  compact?: boolean
  /** Cartas sobre la cancha — extra pequeñas en móvil */
  pitchOverlay?: boolean
}

function StarRating({
  stars,
  small,
}: {
  stars: number
  small?: boolean
}) {
  return (
    <span
      className={`text-amber-500 ${small ? 'text-[8px] leading-none sm:text-[10px]' : ''}`}
      aria-label={`${stars} estrellas`}
    >
      {'⭐'.repeat(stars)}
    </span>
  )
}

export function PlayerCard({
  player,
  positionName,
  onSelect,
  compact = false,
  pitchOverlay = false,
}: PlayerCardProps) {
  const overlay = compact && pitchOverlay

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full touch-manipulation flex-col overflow-hidden bg-white shadow-md transition-all hover:border-[#6b00ff] hover:shadow-lg active:scale-[0.98] active:border-[#6b00ff] ${
        overlay
          ? 'rounded-lg border border-stone-200'
          : 'rounded-xl border-2 border-stone-200'
      }`}
    >
      <div
        className={`flex w-full items-center justify-center overflow-hidden bg-stone-100 ${
          overlay
            ? 'h-[4.25rem] sm:h-28'
            : compact
              ? 'aspect-[2/3] max-h-28 sm:max-h-36'
              : 'aspect-[3/4]'
        }`}
      >
        <img
          src={getPlayerImageSrc(positionName, player.name)}
          alt={player.name}
          className={`max-h-full max-w-full transition-transform group-hover:scale-105 ${
            overlay ? 'h-full w-auto object-contain' : 'h-full w-full object-cover object-top'
          }`}
          draggable={false}
          loading="lazy"
        />
      </div>
      <div
        className={`flex flex-col gap-0.5 text-left ${
          overlay ? 'px-1 py-1' : compact ? 'px-2 py-1.5' : 'px-2 py-2'
        }`}
      >
        <span
          className={`truncate font-bold text-stone-900 ${
            overlay
              ? 'text-[8px] leading-tight sm:text-xs'
              : compact
                ? 'text-xs'
                : 'text-sm'
          }`}
        >
          {player.name}
        </span>
        <StarRating stars={player.stars} small={overlay} />
      </div>
    </button>
  )
}
