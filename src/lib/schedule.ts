import { GROUP_STAGE_LINES } from '../data/groupStageSchedule'
import { KNOCKOUT_LINES } from '../data/knockoutSchedule'
import { getTeam } from '../data/teams'
import type { Match, ScheduleDayGroup, TournamentPhase } from '../types/match'
import type { TournamentState } from '../types/tournament'
import { getTournamentState } from './tournamentStore'
import { resolveMatchStatus } from './matchStatus'

const TZ_OFFSET: Record<string, string> = {
  'America/Mexico_City': '-06:00',
  'America/New_York': '-04:00',
  'America/Chicago': '-05:00',
  'America/Los_Angeles': '-07:00',
  'America/Toronto': '-04:00',
  'America/Vancouver': '-07:00',
}

const PHASE_LABELS: Record<TournamentPhase, string> = {
  group: 'Primera fase',
  round_of_32: 'Dieciseisavos',
  round_of_16: 'Octavos',
  quarter: 'Cuartos',
  semi: 'Semifinal',
  third_place: 'Tercer lugar',
  final: 'Final',
}

function toKickoffISO(date: string, time: string, timeZone: string): string {
  const offset = TZ_OFFSET[timeZone] ?? '-06:00'
  return `${date}T${time}:00${offset}`
}

function withStatus(match: Omit<Match, 'status'>): Match {
  return {
    ...match,
    status: resolveMatchStatus(match.kickoffAt),
  }
}

function parseGroupStage(): Match[] {
  return GROUP_STAGE_LINES.split('\n')
    .filter(Boolean)
    .map((line, index) => {
      const [date, time, tz, group, home, away, venue, city] = line.split('|')
      const id = `group-${group.toLowerCase()}-${index + 1}`
      return withStatus({
        id,
        homeTeam: getTeam(home),
        awayTeam: getTeam(away),
        kickoffAt: toKickoffISO(date, time, tz),
        venue,
        city,
        phase: 'group',
        phaseLabel: PHASE_LABELS.group,
        group,
      })
    })
}

function parseKnockout(): Match[] {
  return KNOCKOUT_LINES.split('\n')
    .filter(Boolean)
    .map((line) => {
      const [
        phase,
        matchNum,
        date,
        time,
        tz,
        homeLabel,
        awayLabel,
        venue,
        city,
      ] = line.split('|')
      const id = `ko-${phase}-${matchNum}`
      return withStatus({
        id,
        homeTeam: null,
        awayTeam: null,
        homeLabel,
        awayLabel,
        kickoffAt: toKickoffISO(date, time, tz),
        venue,
        city,
        phase: phase as TournamentPhase,
        phaseLabel: PHASE_LABELS[phase as TournamentPhase],
        matchNumber: Number(matchNum),
      })
    })
}

let cachedBaseMatches: Match[] | null = null

function getBaseMatches(): Match[] {
  if (!cachedBaseMatches) {
    cachedBaseMatches = [...parseGroupStage(), ...parseKnockout()].sort(
      (a, b) =>
        new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
    )
  }
  return cachedBaseMatches
}

export function applyTournamentState(
  matches: Match[],
  tournament: TournamentState,
  now = Date.now(),
): Match[] {
  return matches.map((base) => {
    const slots = tournament.bracket[base.id]
    let match: Match = { ...base }

    if (slots?.homeTeamCode) {
      match = {
        ...match,
        homeTeam: getTeam(slots.homeTeamCode),
        homeLabel: undefined,
      }
    }
    if (slots?.awayTeamCode) {
      match = {
        ...match,
        awayTeam: getTeam(slots.awayTeamCode),
        awayLabel: undefined,
      }
    }

    const result = tournament.results[base.id]
    if (result) {
      return {
        ...match,
        status: 'finished',
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        winnerCode: result.winnerCode,
      }
    }

    return {
      ...match,
      status: resolveMatchStatus(match.kickoffAt, now),
    }
  })
}

export function getAllMatches(now = Date.now()): Match[] {
  const base = getBaseMatches()
  return applyTournamentState(base, getTournamentState(), now)
}

export function getMatchById(id: string, now = Date.now()): Match | undefined {
  return getAllMatches(now).find((m) => m.id === id)
}

export function canViewPronosticos(match: Match): boolean {
  return Boolean(match.homeTeam && match.awayTeam && match.status !== 'finished')
}

export function canVoteOnMatch(match: Match): boolean {
  return Boolean(
    match.homeTeam && match.awayTeam && match.status === 'pending',
  )
}

/** Partido listo para registrar resultado en admin */
export function isKnockoutPhase(phase: TournamentPhase): boolean {
  return phase !== 'group'
}

export function canAdminControlMatch(match: Match): boolean {
  return Boolean(match.homeTeam && match.awayTeam && match.status !== 'finished')
}

export function canAdminConfigureMatch(match: Match): boolean {
  return isKnockoutPhase(match.phase)
}

export function matchHasBothTeams(match: Match): boolean {
  return Boolean(match.homeTeam && match.awayTeam)
}

export function groupMatchesByDay(matches: Match[]): ScheduleDayGroup[] {
  const formatter = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  })

  const map = new Map<string, Match[]>()

  for (const match of matches) {
    const dateKey = match.kickoffAt.slice(0, 10)
    const list = map.get(dateKey) ?? []
    list.push(match)
    map.set(dateKey, list)
  }

  return [...map.entries()].map(([dateKey, dayMatches]) => ({
    dateKey,
    dateLabel: formatter.format(new Date(dayMatches[0].kickoffAt)),
    matches: dayMatches,
  }))
}

export function groupMatchesByPhase(matches: Match[]): {
  phase: TournamentPhase
  label: string
  matches: Match[]
}[] {
  const order: TournamentPhase[] = [
    'group',
    'round_of_32',
    'round_of_16',
    'quarter',
    'semi',
    'third_place',
    'final',
  ]

  return order
    .map((phase) => ({
      phase,
      label: PHASE_LABELS[phase],
      matches: matches.filter((m) => m.phase === phase),
    }))
    .filter((g) => g.matches.length > 0)
}
