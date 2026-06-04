import { AtSign, type LucideIcon } from 'lucide-react'

const INSTAGRAM_URL = 'https://instagram.com/Apo.webs'

interface ComingSoonModuleProps {
  title: string
  icon: LucideIcon
  iconClassName?: string
}

export function ComingSoonModule({
  title,
  icon: Icon,
  iconClassName = 'text-[#6b00ff]/30',
}: ComingSoonModuleProps) {
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-safe py-8 text-center sm:min-h-[60vh] sm:gap-5">
      <Icon className={`h-16 w-16 sm:h-20 sm:w-20 ${iconClassName}`} aria-hidden />

      <h2 className="text-xl font-black uppercase tracking-tighter text-stone-800 sm:text-2xl">
        {title}
      </h2>

      <div className="max-w-xs space-y-2 sm:max-w-sm">
        <p className="rounded-xl bg-stone-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-stone-600">
          Fase 2 y 3 en desarrollo
        </p>
        <p className="text-sm leading-relaxed text-stone-600">
          Entérate de todo en{' '}
          <span className="font-black text-[#6b00ff]">@Apo.webs</span>
        </p>
      </div>

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#6b00ff] px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition-opacity active:opacity-90"
      >
        <AtSign className="h-4 w-4" aria-hidden />
        Síguenos en Instagram
      </a>

      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        instagram.com/Apo.webs
      </p>
    </div>
  )
}
