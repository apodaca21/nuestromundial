import { getAllMatches } from '../../lib/schedule'
import type { Match } from '../../types/match'

export interface CalendarMatchTeam {
  code: string
  name: string
  flagEmoji: string
  isPlaceholder?: boolean
}

export interface CalendarMatch {
  id: string
  teamA: CalendarMatchTeam
  teamB: CalendarMatchTeam
  /** Inicio del partido (ISO 8601 con offset) */
  date: string
  stadium: string
  description: string
  phaseLabel: string
  group?: string
}

const DEFAULT_DESCRIPTION =
  '🏆 Sigue el partido en vivo y compite con tus amigos en nuestromundial.com'

function sideFromTeam(
  team: Match['homeTeam'],
  label?: string,
): CalendarMatchTeam {
  if (team) {
    return {
      code: team.code,
      name: team.name,
      flagEmoji: team.flagEmoji,
    }
  }
  return {
    code: 'TBD',
    name: label ?? 'Por definir',
    flagEmoji: '⚽',
    isPlaceholder: true,
  }
}

function stadiumLabel(match: Match): string {
  return match.city ? `${match.venue}, ${match.city}` : match.venue
}

export function buildCalendarSchedule(now = Date.now()): CalendarMatch[] {
  return getAllMatches(now).map((match) => ({
    id: match.id,
    teamA: sideFromTeam(match.homeTeam, match.homeLabel),
    teamB: sideFromTeam(match.awayTeam, match.awayLabel),
    date: match.kickoffAt,
    stadium: stadiumLabel(match),
    description: DEFAULT_DESCRIPTION,
    phaseLabel: match.phaseLabel,
    group: match.group,
  }))
}

export const MEXICO_TEAM_CODE = 'MEX'

export function isMexicoCalendarMatch(match: CalendarMatch): boolean {
  return (
    match.teamA.code === MEXICO_TEAM_CODE ||
    match.teamB.code === MEXICO_TEAM_CODE
  )
}

export function filterMexicoCalendarMatches(
  matches: CalendarMatch[],
): CalendarMatch[] {
  return matches.filter(isMexicoCalendarMatch)
}
