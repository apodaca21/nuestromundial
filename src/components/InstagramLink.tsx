import { AtSign } from 'lucide-react'

interface InstagramLinkProps {
  /** En barra móvil: ancho completo del bloque derecho */
  stacked?: boolean
}

export function InstagramLink({ stacked = false }: InstagramLinkProps) {
  return (
    <a
      href="https://instagram.com/Apo.webs"
      target="_blank"
      rel="noopener noreferrer"
      className={
        stacked
          ? 'inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-full border border-stone-200 bg-white px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide text-stone-500 shadow-sm'
          : 'inline-flex min-h-10 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-stone-500 shadow-sm transition-colors hover:border-[#6b00ff]/30 hover:text-[#6b00ff] sm:px-3 sm:text-[11px]'
      }
    >
      <span
        className={`flex items-center justify-center rounded-full bg-stone-100 ${
          stacked ? 'h-5 w-5' : 'h-6 w-6'
        }`}
      >
        <AtSign className={stacked ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
      </span>
      <span className={stacked ? 'inline' : 'hidden min-[380px]:inline'}>
        @Apo.webs
      </span>
    </a>
  )
}
