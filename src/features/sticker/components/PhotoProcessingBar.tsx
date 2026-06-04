import { Loader2 } from 'lucide-react'

export interface PhotoProcessingBarProps {
  percent: number
  label: string
  compact?: boolean
}

export function PhotoProcessingBar({
  percent,
  label,
  compact = false,
}: PhotoProcessingBarProps) {
  return (
    <div
      className={`space-y-2 rounded-xl border border-[#6b00ff]/25 bg-[#6b00ff]/5 ${
        compact ? 'p-2.5' : 'p-3.5'
      }`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2">
        <Loader2
          className="h-4 w-4 shrink-0 animate-spin text-[#6b00ff]"
          aria-hidden
        />
        <p className="min-w-0 flex-1 truncate text-xs font-bold text-[#6b00ff]">
          {label}
        </p>
        <p className="shrink-0 text-xs font-black tabular-nums text-[#6b00ff]">
          {percent}%
        </p>
      </div>

      <div
        className="h-2.5 overflow-hidden rounded-full bg-[#6b00ff]/15"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6b00ff] via-violet-500 to-[#6b00ff] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {!compact ? (
        <p className="text-[10px] leading-snug text-stone-500">
          Tu foto ya se ve en la vista previa. La IA quita el fondo en tu
          dispositivo; suele tardar 15–40 s la primera vez.
        </p>
      ) : null}
    </div>
  )
}

export function PhotoProcessingOverlay({
  percent,
  label,
}: PhotoProcessingBarProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center rounded-lg bg-black/45 p-3 backdrop-blur-[1px]">
      <div className="w-full max-w-[260px]">
        <PhotoProcessingBar percent={percent} label={label} compact />
      </div>
    </div>
  )
}
