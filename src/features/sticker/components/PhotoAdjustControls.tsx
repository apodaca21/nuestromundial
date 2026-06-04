import { RotateCcw } from 'lucide-react'
import type { PhotoTransform } from '../photoTransform'
import { DEFAULT_PHOTO_TRANSFORM } from '../photoTransform'

interface PhotoAdjustControlsProps {
  value: PhotoTransform
  onChange: (next: PhotoTransform) => void
  onReset: () => void
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wide text-stone-500">
        <span>{label}</span>
        <span className="text-stone-400">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-3 w-full cursor-pointer touch-manipulation accent-[#6b00ff]"
      />
    </label>
  )
}

export function PhotoAdjustControls({
  value,
  onChange,
  onReset,
}: PhotoAdjustControlsProps) {
  return (
    <div className="space-y-3 rounded-xl border border-stone-100 bg-stone-50/80 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
          Ajustar foto
        </p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#6b00ff]"
        >
          <RotateCcw className="h-3 w-3" aria-hidden />
          Reset
        </button>
      </div>
      <p className="text-[10px] leading-snug text-stone-400">
        Arrastra la foto en la vista previa o usa los controles
      </p>
      <SliderRow
        label="Horizontal"
        value={value.offsetX}
        min={-45}
        max={45}
        step={1}
        format={(v) => `${v > 0 ? '+' : ''}${v}%`}
        onChange={(offsetX) => onChange({ ...value, offsetX })}
      />
      <SliderRow
        label="Vertical"
        value={value.offsetY}
        min={-35}
        max={35}
        step={1}
        format={(v) => `${v > 0 ? '+' : ''}${v}%`}
        onChange={(offsetY) => onChange({ ...value, offsetY })}
      />
      <SliderRow
        label="Tamaño"
        value={value.scale}
        min={0.55}
        max={2.2}
        step={0.05}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(scale) => onChange({ ...value, scale })}
      />
    </div>
  )
}

export { DEFAULT_PHOTO_TRANSFORM }
