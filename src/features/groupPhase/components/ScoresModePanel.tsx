import { ClipboardList } from 'lucide-react'
import { sportCard } from '../../../lib/styles'

export function ScoresModePanel() {
  return (
    <section className={`${sportCard} text-center`}>
      <ClipboardList
        className="mx-auto mb-3 h-10 w-10 text-[#6b00ff]/35"
        aria-hidden
      />
      <h2 className="text-base font-black uppercase tracking-tight text-stone-900">
        Modo Marcadores
      </h2>
      <p className="mt-2 text-sm leading-snug text-stone-500">
        Próximamente podrás ingresar resultados partido a partido y la app
        calculará posiciones automáticamente.
      </p>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-stone-400">
        Usa modo Arrastrar por ahora
      </p>
    </section>
  )
}
