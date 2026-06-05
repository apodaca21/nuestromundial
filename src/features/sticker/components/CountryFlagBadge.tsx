import type { ReactElement } from 'react'
import type { StickerCountryId } from '../stickerCountries'

const badgeClass = (className: string) =>
  `inline-block shrink-0 overflow-hidden rounded-sm border border-stone-200 shadow-sm ${className}`

interface FlagProps {
  className?: string
}

function MexicoFlag({ className = 'h-6 w-8' }: FlagProps) {
  return (
    <span className={badgeClass(className)} aria-hidden>
      <img
        src="https://flagcdn.com/w80/mx.png"
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </span>
  )
}

function BrazilFlag({ className = 'h-6 w-8' }: FlagProps) {
  return (
    <span className={badgeClass(className)} aria-hidden>
      <svg viewBox="0 0 60 40" className="h-full w-full">
        <rect width="60" height="40" fill="#009c3b" />
        <polygon points="30,4 56,20 30,36 4,20" fill="#ffdf00" />
        <circle cx="30" cy="20" r="7" fill="#002776" />
      </svg>
    </span>
  )
}

function ArgentinaFlag({ className = 'h-6 w-8' }: FlagProps) {
  return (
    <span className={badgeClass(className)} aria-hidden>
      <svg viewBox="0 0 60 40" className="h-full w-full">
        <rect width="60" height="13.3" fill="#74acdf" />
        <rect y="13.3" width="60" height="13.4" fill="#ffffff" />
        <rect y="26.7" width="60" height="13.3" fill="#74acdf" />
        <circle cx="30" cy="20" r="5" fill="#f6b40e" />
      </svg>
    </span>
  )
}

function SpainFlag({ className = 'h-6 w-8' }: FlagProps) {
  return (
    <span className={badgeClass(className)} aria-hidden>
      <svg viewBox="0 0 60 40" className="h-full w-full">
        <rect width="60" height="10" fill="#c60b1e" />
        <rect y="10" width="60" height="20" fill="#ffc400" />
        <rect y="30" width="60" height="10" fill="#c60b1e" />
      </svg>
    </span>
  )
}

function GermanyFlag({ className = 'h-6 w-8' }: FlagProps) {
  return (
    <span className={badgeClass(className)} aria-hidden>
      <svg viewBox="0 0 60 40" className="h-full w-full">
        <rect width="60" height="13.3" fill="#000000" />
        <rect y="13.3" width="60" height="13.4" fill="#dd0000" />
        <rect y="26.7" width="60" height="13.3" fill="#ffce00" />
      </svg>
    </span>
  )
}

function EnglandFlag({ className = 'h-6 w-8' }: FlagProps) {
  return (
    <span className={badgeClass(className)} aria-hidden>
      <svg viewBox="0 0 60 40" className="h-full w-full">
        <rect width="60" height="40" fill="#ffffff" />
        <rect x="26" width="8" height="40" fill="#ce1126" />
        <rect y="16" width="60" height="8" fill="#ce1126" />
      </svg>
    </span>
  )
}

function FranceFlag({ className = 'h-6 w-8' }: FlagProps) {
  return (
    <span className={badgeClass(className)} aria-hidden>
      <svg viewBox="0 0 60 40" className="h-full w-full">
        <rect width="20" height="40" fill="#0055a4" />
        <rect x="20" width="20" height="40" fill="#ffffff" />
        <rect x="40" width="20" height="40" fill="#ef4135" />
      </svg>
    </span>
  )
}

function PortugalFlag({ className = 'h-6 w-8' }: FlagProps) {
  return (
    <span className={badgeClass(className)} aria-hidden>
      <svg viewBox="0 0 60 40" className="h-full w-full">
        <rect width="24" height="40" fill="#006600" />
        <rect x="24" width="36" height="40" fill="#ff0000" />
        <circle cx="24" cy="20" r="7" fill="#ffcc00" stroke="#003399" strokeWidth="1.5" />
      </svg>
    </span>
  )
}

function UsaFlag({ className = 'h-6 w-8' }: FlagProps) {
  return (
    <span className={badgeClass(className)} aria-hidden>
      <img
        src="https://flagcdn.com/w80/us.png"
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </span>
  )
}

const FLAGS: Record<
  StickerCountryId,
  (props: FlagProps) => ReactElement
> = {
  mex: MexicoFlag,
  bra: BrazilFlag,
  arg: ArgentinaFlag,
  esp: SpainFlag,
  deu: GermanyFlag,
  eng: EnglandFlag,
  fra: FranceFlag,
  por: PortugalFlag,
  usa: UsaFlag,
}

export function CountryFlagBadge({
  countryId,
  className = 'h-6 w-8',
}: {
  countryId: StickerCountryId
  className?: string
}) {
  const Flag = FLAGS[countryId]
  return <Flag className={className} />
}
