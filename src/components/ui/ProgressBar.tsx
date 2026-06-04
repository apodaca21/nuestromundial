import { useEffect, useState, type CSSProperties } from 'react'

export interface ProgressSegment {
  value: number
  colorClass: string
  style?: CSSProperties
}

interface ProgressBarProps {
  segments: ProgressSegment[]
  animateOnMount?: boolean
  heightClass?: string
  trackClass?: string
}

export function ProgressBar({
  segments,
  animateOnMount = false,
  heightClass = 'h-3',
  trackClass = 'bg-stone-100',
}: ProgressBarProps) {
  const [displayValues, setDisplayValues] = useState<number[]>(
    animateOnMount ? segments.map(() => 0) : segments.map((s) => s.value),
  )

  useEffect(() => {
    if (!animateOnMount) {
      setDisplayValues(segments.map((s) => s.value))
      return
    }

    const frame = requestAnimationFrame(() => {
      setDisplayValues(segments.map((s) => s.value))
    })
    return () => cancelAnimationFrame(frame)
  }, [animateOnMount, segments])

  return (
    <div
      className={`flex w-full overflow-hidden rounded-full ${trackClass} ${heightClass}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {segments.map((segment, index) => (
        <div
          key={index}
          className={`${segment.colorClass} transition-all duration-700 ease-out`}
          style={{
            width: `${displayValues[index] ?? 0}%`,
            ...segment.style,
          }}
        />
      ))}
    </div>
  )
}
