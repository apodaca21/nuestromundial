/** Marca solo en barra móvil — desktop usa título clásico en TopBar */
export function BrandWordmark() {
  return (
    <h1 className="font-display flex w-full flex-col items-center justify-center text-center leading-[0.88]">
      <span className="text-[clamp(1.65rem,7.2vw,2.15rem)] tracking-[0.08em] text-stone-800">
        NUESTRO
      </span>
      <span className="bg-gradient-to-r from-[#6b00ff] to-[#8b3dff] bg-clip-text text-[clamp(1.8rem,7.8vw,2.35rem)] tracking-[0.1em] text-transparent">
        MUNDIAL
      </span>
    </h1>
  )
}
