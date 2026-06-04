export function formatMatchDateTime(
  isoDate: string,
  timeZone = 'America/Mexico_City',
): string {
  const date = new Date(isoDate)
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date)
}

export function formatMatchTime(
  isoDate: string,
  timeZone = 'America/Mexico_City',
): string {
  const date = new Date(isoDate)
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function formatVoteCount(count: number): string {
  return new Intl.NumberFormat('es-MX').format(count)
}

export function formatDayHeader(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`)
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  }).format(date)
}
