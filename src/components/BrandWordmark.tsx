interface BrandWordmarkProps {
  /** mobile = dos líneas centradas; desktop = una línea */
  variant?: 'mobile' | 'desktop'
}

export function BrandWordmark({ variant = 'mobile' }: BrandWordmarkProps) {
  if (variant === 'desktop') {
    return (
      <h1 className="font-display flex items-baseline gap-2 leading-none">
        <span className="text-[1.65rem] tracking-[0.06em] text-stone-800 sm:text-3xl">
          NUESTRO
        </span>
        <span className="text-[1.75rem] tracking-[0.08em] text-[#6b00ff] sm:text-[2rem]">
          MUNDIAL
        </span>
      </h1>
    )
  }

  return (
    <h1 className="font-display flex flex-col items-center justify-center px-0.5 text-center leading-[0.9]">
      <span className="text-[1.85rem] tracking-[0.1em] text-stone-800">NUESTRO</span>
      <span className="-mt-0.5 text-[2rem] tracking-[0.12em] text-[#6b00ff] drop-shadow-sm">
        MUNDIAL
      </span>
    </h1>
  )
}
