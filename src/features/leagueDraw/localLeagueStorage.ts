import type { StoredLeagueDrawResult } from '../../types/league'

const STORAGE_KEY = 'nm:local-leagues'
const MAX_LOCAL_LEAGUES = 20

export interface LocalLeagueEntry {
  share_code: string
  name: string
  created_at: string
  participant_count: number
  draw_result: StoredLeagueDrawResult
}

function readAll(): LocalLeagueEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalLeagueEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(entries: LocalLeagueEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function getLocalLeagues(): LocalLeagueEntry[] {
  return readAll().sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

export function getLocalLeagueByShareCode(
  shareCode: string,
): LocalLeagueEntry | null {
  return readAll().find((entry) => entry.share_code === shareCode) ?? null
}

export function rememberLocalLeague(input: {
  shareCode: string
  name: string
  participantCount: number
  drawResult: StoredLeagueDrawResult
}) {
  const created_at = new Date().toISOString()
  const entry: LocalLeagueEntry = {
    share_code: input.shareCode,
    name: input.name.trim(),
    created_at,
    participant_count: input.participantCount,
    draw_result: input.drawResult,
  }

  const rest = readAll().filter((row) => row.share_code !== entry.share_code)
  writeAll([entry, ...rest].slice(0, MAX_LOCAL_LEAGUES))
  window.dispatchEvent(new Event('nm:local-leagues-changed'))
}
