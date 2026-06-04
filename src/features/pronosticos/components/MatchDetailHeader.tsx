import { ArrowLeft } from 'lucide-react'
import { ApoWatermark } from '../../../components/ApoWatermark'
import { InstagramLink } from '../../../components/InstagramLink'
import { pageX, stickyHeader, touchBtn } from '../../../lib/layout'
import logoMundial from '../../../assets/logomundial.jpeg'

interface MatchDetailHeaderProps {
  onBack: () => void
  title?: string
}

export function MatchDetailHeader({
  onBack,
  title = 'Pronóstico',
}: MatchDetailHeaderProps) {
  return (
    <header className={stickyHeader}>
      <ApoWatermark />
      <div
        className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3 sm:py-2.5 ${pageX}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className={`${touchBtn} -ml-1 shrink-0 gap-1 rounded-lg px-2 text-sm font-bold text-[#6b00ff] sm:text-base`}
          >
            <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate">Calendario</span>
          </button>
          <img
            src={logoMundial}
            alt=""
            className="h-8 w-8 shrink-0 rounded-md object-cover sm:h-9 sm:w-9"
            aria-hidden
          />
          <span className="min-w-0 truncate text-sm font-black uppercase tracking-tight text-stone-800 sm:text-base">
            {title}
          </span>
        </div>
        <InstagramLink stacked />
      </div>
    </header>
  )
}
