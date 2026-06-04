import { LogIn, User } from 'lucide-react'

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

interface AccountEntryButtonProps {
  isLoggedIn: boolean
  displayName?: string | null
  onClick: () => void
  stacked?: boolean
}

export function AccountEntryButton({
  isLoggedIn,
  displayName,
  onClick,
  stacked = false,
}: AccountEntryButtonProps) {
  const stackedBtn = stacked ? 'w-full justify-center' : ''
  const textSize = stacked
    ? 'text-[9px]'
    : 'text-[10px] sm:text-[11px]'

  if (isLoggedIn && displayName) {
    const initials = initialsFromName(displayName)

    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex max-w-full items-center gap-1.5 rounded-full border-2 border-[#6b00ff]/25 bg-gradient-to-r from-[#6b00ff]/10 to-white py-1 pl-1 pr-2.5 shadow-sm transition-transform active:scale-[0.98] sm:max-w-[10rem] sm:pr-3 ${stackedBtn}`}
        aria-label={`Cuenta de ${displayName}`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6b00ff] text-[10px] font-black text-white shadow-sm shadow-[#6b00ff]/30 sm:h-8 sm:w-8 sm:text-xs">
          {initials}
        </span>
        <span
          className={`max-w-[4.5rem] truncate font-black uppercase tracking-tight text-[#6b00ff] ${textSize}`}
        >
          {displayName}
        </span>
      </button>
    )
  }

  if (isLoggedIn) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full border-2 border-[#6b00ff]/25 bg-[#6b00ff]/10 px-2.5 py-1.5 shadow-sm transition-transform active:scale-[0.98] sm:px-3 sm:py-2 ${stackedBtn}`}
        aria-label="Mi cuenta"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6b00ff] text-white sm:h-7 sm:w-7">
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
        </span>
        <span
          className={`font-black uppercase tracking-tight text-[#6b00ff] ${textSize}`}
        >
          Cuenta
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full bg-[#6b00ff] px-2.5 py-1.5 font-black uppercase tracking-wide text-white shadow-md shadow-[#6b00ff]/25 transition-transform active:scale-[0.98] sm:gap-2 sm:px-4 sm:py-2 ${textSize} ${stackedBtn}`}
      aria-label="Entrar o crear cuenta"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 sm:h-6 sm:w-6">
        <LogIn className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={2.5} aria-hidden />
      </span>
      Entrar
    </button>
  )
}
