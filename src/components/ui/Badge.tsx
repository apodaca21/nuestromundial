import type { MatchStatus } from '../../types/match'

const statusConfig: Record<
  MatchStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  pending: {
    label: 'Pendiente',
    className: 'border border-[#6b00ff]/40 bg-[#6b00ff]/10 text-[#6b00ff]',
  },
  live: {
    label: 'En vivo',
    className: 'border border-[#ff004d] bg-[#ff004d]/10 text-[#ff004d]',
    pulse: true,
  },
  finished: {
    label: 'Finalizado',
    className: 'border border-stone-300 bg-stone-100 text-stone-600',
  },
}

interface BadgeProps {
  status: MatchStatus
}

export function Badge({ status }: BadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${config.className} ${config.pulse ? 'animate-pulse' : ''}`}
    >
      {status === 'live' && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff004d]" aria-hidden />
      )}
      {config.label}
    </span>
  )
}
