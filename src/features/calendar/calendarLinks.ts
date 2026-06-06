import type { CalendarMatch } from './calendarMatches'

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000

function toICSUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export function matchCalendarTitle(match: CalendarMatch): string {
  const home = match.teamA.isPlaceholder ? match.teamA.name : match.teamA.code
  const away = match.teamB.isPlaceholder ? match.teamB.name : match.teamB.code
  return `⚽ ${home} vs ${away}`
}

export function generateGoogleCalendarLink(match: CalendarMatch): string {
  const start = new Date(match.date)
  const end = new Date(start.getTime() + MATCH_DURATION_MS)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: matchCalendarTitle(match),
    dates: `${toICSUtc(start)}/${toICSUtc(end)}`,
    details: match.description,
    location: match.stadium,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function buildVEvent(match: CalendarMatch, dtStamp: string): string[] {
  const start = new Date(match.date)
  const end = new Date(start.getTime() + MATCH_DURATION_MS)
  return [
    'BEGIN:VEVENT',
    `UID:${match.id}@nuestromundial.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${toICSUtc(start)}`,
    `DTEND:${toICSUtc(end)}`,
    `SUMMARY:${escapeICS(matchCalendarTitle(match))}`,
    `DESCRIPTION:${escapeICS(match.description)}`,
    `LOCATION:${escapeICS(match.stadium)}`,
    'END:VEVENT',
  ]
}

function buildICSContent(matches: CalendarMatch[], calendarName: string): string {
  const dtStamp = toICSUtc(new Date())
  const events = matches.flatMap((match) => buildVEvent(match, dtStamp))
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nuestro Mundial//Calendario//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(calendarName)}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

function triggerICSDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function downloadICS(match: CalendarMatch): void {
  downloadICSBundle([match], `${match.id}-mundial-2026.ics`, 'Mundial 2026')
}

export function downloadICSBundle(
  matches: CalendarMatch[],
  filename: string,
  calendarName: string,
): void {
  if (matches.length === 0) return
  triggerICSDownload(buildICSContent(matches, calendarName), filename)
}

export function downloadAllMatchesICS(matches: CalendarMatch[]): void {
  downloadICSBundle(
    matches,
    'mundial-2026-todos-los-partidos.ics',
    'Mundial 2026 — Todos los partidos',
  )
}

export function downloadMexicoMatchesICS(matches: CalendarMatch[]): void {
  downloadICSBundle(
    matches,
    'mundial-2026-mexico.ics',
    'Mundial 2026 — Selección Mexicana',
  )
}
