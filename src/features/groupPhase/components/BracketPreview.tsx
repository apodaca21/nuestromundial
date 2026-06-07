import { TeamFlag } from '../../../components/ui/TeamFlag'
import { formatClassifiedLabel } from '../groupPhaseLogic'
import type { BracketMatch } from '../types'

interface BracketPreviewProps {
  matches: BracketMatch[]
}

export function BracketPreview({ matches }: BracketPreviewProps) {
  return (
    <div className="space-y-2">
      {matches.map((match) => (
        <article
          key={match.id}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 shadow-sm"
        >
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#6b00ff]">
            Partido {match.matchNumber}
          </p>
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <TeamFlag
                  teamCode={match.home.team.code}
                  flagEmoji={match.home.team.flagEmoji}
                  size="sm"
                />
                <span className="truncate">{match.home.team.name}</span>
              </div>
              <p className="mt-0.5 text-[9px] font-bold text-stone-400">
                {formatClassifiedLabel(match.home)}
              </p>
            </div>

            <span className="shrink-0 text-[10px] font-black text-[#ff004d]">
              vs
            </span>

            <div className="min-w-0 flex-1 text-right">
              <div className="flex items-center justify-end gap-1.5 font-bold text-stone-800">
                <span className="truncate">{match.away.team.name}</span>
                <TeamFlag
                  teamCode={match.away.team.code}
                  flagEmoji={match.away.team.flagEmoji}
                  size="sm"
                />
              </div>
              <p className="mt-0.5 text-[9px] font-bold text-stone-400">
                {formatClassifiedLabel(match.away)}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
