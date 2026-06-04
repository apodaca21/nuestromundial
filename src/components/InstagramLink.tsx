import { AtSign } from 'lucide-react'

export function InstagramLink() {
  return (
    <a
      href="https://instagram.com/Apo.webs"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-stone-500 shadow-sm transition-colors hover:border-[#6b00ff]/30 hover:text-[#6b00ff] sm:px-3 sm:text-[11px]"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100">
        <AtSign className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="hidden min-[380px]:inline">@Apo.webs</span>
    </a>
  )
}
