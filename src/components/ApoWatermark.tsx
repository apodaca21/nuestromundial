const INSTAGRAM_URL = 'https://instagram.com/Apo.webs'

/** Franja superior de marca @Apo.webs (p. ej. pantalla de detalle sin TopBar). */
export function ApoWatermark() {
  return (
    <div className="flex justify-center border-b border-stone-100 bg-[#6b00ff]/[0.04] py-1.5">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[9px] font-black uppercase tracking-[0.28em] text-stone-400 transition-colors hover:text-[#6b00ff] sm:text-[10px]"
      >
        @Apo.webs
      </a>
    </div>
  )
}
