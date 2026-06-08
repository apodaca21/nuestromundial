import { PACK_IMAGES, PITCH_BG } from '../fantasyImages'
import { getPositionShortLabel, PITCH_SLOTS } from '../pitchLayout'

interface DraftLobbyProps {
  onStart: () => void
}

function PitchPackSlot({ positionId }: { positionId: string }) {
  const label = getPositionShortLabel(positionId)

  return (
    <div className="flex w-[2.75rem] flex-col items-center sm:w-[3.25rem]">
      <img
        src={PACK_IMAGES.closed}
        alt={`Sobre ${label}`}
        className="h-10 w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:h-11"
        draggable={false}
      />
      <span className="mt-0.5 whitespace-nowrap rounded-md bg-stone-900/90 px-1.5 py-px text-[8px] font-black uppercase tracking-wide text-white shadow-md ring-1 ring-white/30 sm:text-[9px]">
        {label}
      </span>
    </div>
  )
}

export function DraftLobby({ onStart }: DraftLobbyProps) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-xl shadow-lg sm:max-w-lg"
        style={{
          backgroundImage: `url('${PITCH_BG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maxHeight: 'min(72dvh, calc(100dvh - 11rem))',
        }}
        aria-label="Cancha con 11 sobres por posición"
      >
        {PITCH_SLOTS.map(({ positionId, top, left }) => (
          <div
            key={positionId}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ top, left }}
          >
            <PitchPackSlot positionId={positionId} />
          </div>
        ))}

        <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/15" aria-hidden />
          <button
            type="button"
            onClick={onStart}
            className="relative z-10 inline-flex min-h-12 min-w-[10rem] touch-manipulation items-center justify-center rounded-xl bg-[#6b00ff] px-10 py-3 font-display text-xl tracking-wide text-white shadow-[0_8px_32px_rgba(107,0,255,0.55)] ring-4 ring-white/40 transition-transform active:scale-[0.97] sm:min-h-14 sm:min-w-[11rem] sm:text-2xl"
          >
            Comenzar
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-stone-500 sm:text-sm">
        Toca Comenzar y elige qué sobres abrir primero
      </p>
    </div>
  )
}
