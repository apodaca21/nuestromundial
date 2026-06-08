import type { PackState } from '../types'
import { PACK_IMAGES } from '../fantasyImages'

interface PackOpeningProps {
  packState: PackState
  openingPhase: 'early' | 'late'
  onOpen: () => void
}

export function PackOpening({ packState, openingPhase, onOpen }: PackOpeningProps) {
  if (packState === 'REVEALED') return null

  const src =
    packState === 'IDLE'
      ? PACK_IMAGES.closed
      : openingPhase === 'early'
        ? PACK_IMAGES.opening
        : PACK_IMAGES.open

  const alt =
    packState === 'IDLE'
      ? 'Sobre cerrado — toca para abrir'
      : 'Abriendo sobre'

  if (packState === 'IDLE') {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="mx-auto flex max-h-[40vh] w-full max-w-xs touch-manipulation flex-col items-center justify-center transition-transform active:scale-[0.97]"
        aria-label="Abrir sobre"
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[40vh] w-full object-contain drop-shadow-lg"
          draggable={false}
        />
        <span className="mt-3 text-sm font-semibold text-stone-500">
          Toca para abrir el sobre
        </span>
      </button>
    )
  }

  return (
    <div className="mx-auto flex max-h-[40vh] w-full max-w-xs flex-col items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="max-h-[40vh] w-full animate-wiggle object-contain drop-shadow-lg"
        draggable={false}
      />
      <span className="mt-3 text-sm font-semibold text-[#6b00ff]">
        Abriendo…
      </span>
    </div>
  )
}
