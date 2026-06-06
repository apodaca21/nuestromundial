import { useMemo } from 'react'
import { Calendar, CalendarPlus, Download } from 'lucide-react'
import { ApoWatermark } from '../../components/ApoWatermark'
import { TeamFlag } from '../../components/ui/TeamFlag'
import { useStoreSubscription } from '../../hooks/useStoreSubscription'
import {
  formatLocalDayLabel,
  formatLocalMatchTime,
  localDateKeyFromKickoff,
} from '../../lib/format'
import { pageX } from '../../lib/layout'
import {
  getTournamentRevision,
  subscribeTournament,
} from '../../lib/tournamentStore'
import { getTeamColors } from '../../lib/teamVisuals'
import type { CalendarMatch } from './calendarMatches'
import {
  buildCalendarSchedule,
  filterMexicoCalendarMatches,
} from './calendarMatches'
import {
  downloadAllMatchesICS,
  downloadICS,
  downloadMexicoMatchesICS,
  generateGoogleCalendarLink,
} from './calendarLinks'

function TeamLine({ team }: { team: CalendarMatch['teamA'] }) {
  if (team.isPlaceholder) {
    return <span className="font-bold text-stone-500">{team.name}</span>
  }

  const colors = getTeamColors(team.code)
  return (
    <span className="flex items-center gap-2 font-bold text-stone-800">
      <TeamFlag teamCode={team.code} flagEmoji={team.flagEmoji} size="sm" />
      <span style={{ color: colors.primary }}>{team.name}</span>
    </span>
  )
}

function MatchCard({ match }: { match: CalendarMatch }) {
  const googleUrl = generateGoogleCalendarLink(match)
  const meta = [match.phaseLabel, match.group ? `Grupo ${match.group}` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm [contain-intrinsic-size:auto_9.5rem] [content-visibility:auto]">
      <div className="mb-2">
        <span className="text-lg font-black text-[#6b00ff]">
          {formatLocalMatchTime(match.date)}
        </span>
      </div>

      <div className="text-sm">
        <TeamLine team={match.teamA} />
        <div className="my-0.5 text-[10px] font-black text-[#ff004d]">vs</div>
        <TeamLine team={match.teamB} />
      </div>

      <p className="mt-2 text-[10px] leading-snug text-stone-400">
        {meta}
        {meta ? ' · ' : ''}
        {match.stadium}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2 py-2 text-[10px] font-black uppercase tracking-wide text-stone-600 transition active:scale-[0.98] hover:border-[#6b00ff]/35 hover:bg-[#6b00ff]/5 hover:text-[#6b00ff]"
        >
          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Google
        </a>
        <button
          type="button"
          onClick={() => downloadICS(match)}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2 py-2 text-[10px] font-black uppercase tracking-wide text-stone-600 transition active:scale-[0.98] hover:border-[#6b00ff]/35 hover:bg-[#6b00ff]/5 hover:text-[#6b00ff]"
        >
          <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Apple
        </button>
      </div>
    </article>
  )
}

export function WorldCupCalendar() {
  const tournamentRev = useStoreSubscription(
    subscribeTournament,
    getTournamentRevision,
  )

  const { dayGroups, allMatches, mexicoMatches } = useMemo(() => {
    const schedule = buildCalendarSchedule()
    const map = new Map<string, CalendarMatch[]>()

    for (const match of schedule) {
      const dateKey = localDateKeyFromKickoff(match.date)
      const list = map.get(dateKey) ?? []
      list.push(match)
      map.set(dateKey, list)
    }

    const groups = [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, items]) => ({
        dateKey,
        dateLabel: formatLocalDayLabel(items[0].date),
        items: items.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      }))

    return {
      dayGroups: groups,
      allMatches: schedule,
      mexicoMatches: filterMexicoCalendarMatches(schedule),
    }
  }, [tournamentRev])

  const totalMatches = allMatches.length
  const mexicoCount = mexicoMatches.length

  return (
    <div className="flex flex-col">
      <ApoWatermark />

      <div className={`${pageX} py-3 pb-8 sm:py-5 sm:pb-10`}>
        <header className="mb-4 text-center sm:mb-5">
          <h1 className="font-display text-3xl tracking-wide text-stone-900 sm:text-4xl">
            CALENDARIO
          </h1>
          <p className="mt-1 px-2 text-sm text-stone-500">
            {totalMatches} partidos · agrégalos a tu calendario con un toque
          </p>
        </header>

        <section className="mb-5 space-y-2 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
            Agregar varios a la vez
          </p>
          <button
            type="button"
            onClick={() => downloadAllMatchesICS(allMatches)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#6b00ff]/30 bg-[#6b00ff]/8 px-3 text-xs font-black uppercase tracking-wide text-[#6b00ff] transition active:scale-[0.98] hover:border-[#6b00ff]/50 hover:bg-[#6b00ff]/12"
          >
            <CalendarPlus className="h-4 w-4 shrink-0" aria-hidden />
            Todos los partidos ({totalMatches})
          </button>
          <button
            type="button"
            onClick={() => downloadMexicoMatchesICS(mexicoMatches)}
            disabled={mexicoCount === 0}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-black uppercase tracking-wide text-stone-700 transition active:scale-[0.98] hover:border-[#006847]/40 hover:bg-[#006847]/8 hover:text-[#006847] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-base leading-none" aria-hidden>
              🇲🇽
            </span>
            Solo México ({mexicoCount})
          </button>
          <p className="text-center text-[10px] leading-snug text-stone-400">
            Descarga un archivo .ics e impórtalo en Apple Calendar, Google
            Calendar u Outlook. En iPhone se agregan al abrir el archivo.
          </p>
        </section>

        <div className="space-y-5">
          {dayGroups.map(({ dateKey, dateLabel, items }) => (
            <section key={dateKey}>
              <h2 className="sticky top-0 z-10 -mx-1 mb-2 border-b border-stone-200/80 bg-[#faf9f7]/95 px-1 py-2 text-xs font-bold capitalize text-stone-600 backdrop-blur-sm">
                {dateLabel}
              </h2>
              <div className="space-y-2">
                {items.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-5 text-center text-[10px] leading-snug text-stone-400">
          Horarios en tu hora local. Al agregar al calendario, Google y Apple
          ajustan la hora a tu zona. Cada evento dura aprox. 2 horas.
        </p>
      </div>
    </div>
  )
}
