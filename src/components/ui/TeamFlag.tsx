import { useState } from 'react'
import { getFlagUrl } from '../../lib/teamVisuals'

interface TeamFlagProps {
  teamCode: string
  flagEmoji: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { img: 40, class: 'h-7 w-10 sm:h-8 sm:w-11' },
  md: { img: 80, class: 'h-10 w-14 sm:h-11 sm:w-16' },
  lg: { img: 120, class: 'h-12 w-[4.25rem] sm:h-14 sm:w-20' },
}

export function TeamFlag({
  teamCode,
  flagEmoji,
  size = 'md',
  className = '',
}: TeamFlagProps) {
  const [failed, setFailed] = useState(false)
  const { img, class: sizeClass } = sizeMap[size]

  if (failed) {
    return (
      <span className={`text-3xl leading-none ${className}`} aria-hidden>
        {flagEmoji}
      </span>
    )
  }

  return (
    <img
      src={getFlagUrl(teamCode, img)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-md border border-stone-200/80 object-cover shadow-sm ${sizeClass} ${className}`}
    />
  )
}
