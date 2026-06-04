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
}

export function AccountEntryButton({
  isLoggedIn,
  displayName,
  onClick,
}: AccountEntryButtonProps) {
  if (isLoggedIn && displayName) {
    const initials = initialsFromName(displayName)

    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex max-w-[9rem] items-center gap-2 rounded-full border-2 border-[#6b00ff]/25 bg-gradient-to-r from-[#6b00ff]/10 to-white py-1 pl-1 pr-3 shadow-sm transition-transform active:scale-[0.98] sm:max-w-[10rem]"
        aria-label={`Cuenta de ${displayName}`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6b00ff] text-xs font-black text-white shadow-sm shadow-[#6b00ff]/30">
          {initials}
        </span>
        <span className="truncate text-[10px] font-black uppercase tracking-tight text-[#6b00ff] sm:text-[11px]">
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
        className="inline-flex items-center gap-2 rounded-full border-2 border-[#6b00ff]/25 bg-[#6b00ff]/10 px-3 py-2 shadow-sm transition-transform active:scale-[0.98]"
        aria-label="Mi cuenta"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6b00ff] text-white">
          <User className="h-4 w-4" aria-hidden />
        </span>
        <span className="text-[10px] font-black uppercase tracking-tight text-[#6b00ff]">
          Cuenta
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-[#6b00ff] px-3.5 py-2 text-[10px] font-black uppercase tracking-wide text-white shadow-md shadow-[#6b00ff]/25 transition-transform active:scale-[0.98] sm:gap-2 sm:px-4 sm:text-[11px]"
      aria-label="Entrar o crear cuenta"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
        <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} aria-hidden />
      </span>
      Entrar
    </button>
  )
}
