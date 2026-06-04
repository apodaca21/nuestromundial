import { getTeamColors } from '../../lib/teamVisuals'
import { TeamFlag } from './TeamFlag'

interface VoteButtonProps {
  flagEmoji: string
  teamName: string
  teamCode: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

export function VoteButton({
  flagEmoji,
  teamName,
  teamCode,
  selected = false,
  disabled = false,
  onClick,
}: VoteButtonProps) {
  const colors = getTeamColors(teamCode)

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-[3.5rem] w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-16 sm:gap-4 sm:px-5 sm:py-4"
      style={{
        borderColor: selected ? colors.primary : `${colors.primary}40`,
        background: selected
          ? `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}10)`
          : `linear-gradient(135deg, ${colors.primary}08, white)`,
      }}
    >
      <TeamFlag teamCode={teamCode} flagEmoji={flagEmoji} size="md" />

      <span className="flex flex-1 items-baseline gap-3">
        <span
          className="text-2xl font-black leading-none tracking-tighter sm:text-3xl"
          style={{ color: colors.primary }}
        >
          {teamCode}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-black uppercase tracking-tight text-stone-900">
            {teamName}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Votar
          </span>
        </span>
      </span>
    </button>
  )
}
