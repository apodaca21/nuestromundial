import type { MatchStatus } from '../types/match'

const MATCH_DURATION_MS = 105 * 60 * 1000

export function resolveMatchStatus(kickoffAt: string, now = Date.now()): MatchStatus {
  const start = new Date(kickoffAt).getTime()
  const end = start + MATCH_DURATION_MS

  if (now < start) return 'pending'
  if (now < end) return 'live'
  return 'finished'
}
