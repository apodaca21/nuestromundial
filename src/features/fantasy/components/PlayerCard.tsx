import type { DraftPlayer } from '../types'
import { getPlayerImageSrc } from '../fantasyImages'

interface PlayerCardProps {
  player: DraftPlayer
  positionName: string
  onSelect: () => void
  compact?: boolean
}

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="text-amber-500" aria-label={`${stars} estrellas`}>
      {'⭐'.repeat(stars)}
    </span>
  )
}

export function PlayerCard({
  player,
  positionName,
  onSelect,
  compact = false,
}: PlayerCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full touch-manipulation flex-col overflow-hidden rounded-xl border-2 border-stone-200 bg-white shadow-md transition-all hover:border-[#6b00ff] hover:shadow-lg active:scale-[0.98] active:border-[#6b00ff]"
    >
      <div
        className={`w-full overflow-hidden bg-stone-100 ${compact ? 'aspect-[2/3] max-h-28 sm:max-h-36' : 'aspect-[3/4]'}`}
      >
        <img
          src={getPlayerImageSrc(positionName, player.name)}
          alt={player.name}
          className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
          draggable={false}
          loading="lazy"
        />
      </div>
      <div className={`flex flex-col gap-0.5 px-2 py-2 text-left ${compact ? 'py-1.5' : ''}`}>
        <span
          className={`truncate font-bold text-stone-900 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {player.name}
        </span>
        <StarRating stars={player.stars} />
      </div>
    </button>
  )
}
