import { useState } from 'react'
import { getCachedTeamFlagSrc } from '../../lib/exportImage'
import { getFlagUrl, getTeamColors } from '../../lib/teamVisuals'

interface TeamFlagProps {
  teamCode: string
  flagEmoji: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  loading?: 'lazy' | 'eager'
  width?: number
  height?: number
  preferCachedSrc?: boolean
}

const sizeMap = {
  xs: { img: 40, w: 24, h: 16 },
  sm: { img: 80, w: 40, h: 28 },
  md: { img: 80, w: 56, h: 40 },
  lg: { img: 160, w: 80, h: 56 },
}

export function TeamFlag({
  teamCode,
  flagEmoji: _flagEmoji,
  size = 'md',
  className = '',
  loading = 'lazy',
  width,
  height,
  preferCachedSrc = false,
}: TeamFlagProps) {
  const [failed, setFailed] = useState(false)
  const { img, w, h } = sizeMap[size]
  const displayW = width ?? w
  const displayH = height ?? h
  const colors = getTeamColors(teamCode)
  const cachedSrc = preferCachedSrc ? getCachedTeamFlagSrc(teamCode) : undefined
  const src = cachedSrc ?? getFlagUrl(teamCode, img)
  const isDataUrl = src.startsWith('data:')

  if (failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-sm border border-stone-200/80 text-[7px] font-black uppercase leading-none shadow-sm ${className}`}
        style={{
          width: displayW,
          height: displayH,
          maxWidth: 'none',
          backgroundColor: colors.primary,
          color: colors.secondary === '#FFFFFF' ? '#fff' : colors.secondary,
        }}
        title={teamCode}
        aria-hidden
      >
        {teamCode.slice(0, 3)}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      width={displayW}
      height={displayH}
      loading={loading}
      decoding="async"
      crossOrigin={isDataUrl ? undefined : 'anonymous'}
      data-team-code={teamCode}
      onError={() => setFailed(true)}
      className={`block shrink-0 rounded-sm border border-stone-200/80 object-cover shadow-sm ${className}`}
      style={{ width: displayW, height: displayH, maxWidth: 'none' }}
    />
  )
}
