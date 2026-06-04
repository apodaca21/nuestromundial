import { KNOCKOUT_LINES } from '../data/knockoutSchedule'

export type BracketSlot = 'home' | 'away'

export interface BracketFeed {
  destMatchId: string
  destMatchNum: number
  slot: BracketSlot
}

/** Ganador del partido N → slot en partido destino */
export const WINNER_FEEDS_BY_MATCH_NUM: Record<number, BracketFeed[]> = {}
/** Subcampeón del partido N (perdedor) → slot en partido destino */
export const LOSER_FEEDS_BY_MATCH_NUM: Record<number, BracketFeed[]> = {}

function koMatchId(phase: string, matchNum: number) {
  return `ko-${phase}-${matchNum}`
}

function parseSourceLabel(label: string): { type: 'winner' | 'loser'; num: number } | null {
  const win = label.match(/Ganador (\d+)/i)
  if (win) return { type: 'winner', num: Number(win[1]) }

  const lose = label.match(/Subcampeón (\d+)/i)
  if (lose) return { type: 'loser', num: Number(lose[1]) }

  return null
}

function registerFeed(
  map: Record<number, BracketFeed[]>,
  sourceNum: number,
  feed: BracketFeed,
) {
  if (!map[sourceNum]) map[sourceNum] = []
  map[sourceNum].push(feed)
}

function buildFeeds() {
  for (const line of KNOCKOUT_LINES.split('\n').filter(Boolean)) {
    const [phase, matchNumStr, , , , homeLabel, awayLabel] = line.split('|')
    const destNum = Number(matchNumStr)
    const destId = koMatchId(phase, destNum)

    const homeSource = parseSourceLabel(homeLabel)
    if (homeSource) {
      registerFeed(
        homeSource.type === 'winner' ? WINNER_FEEDS_BY_MATCH_NUM : LOSER_FEEDS_BY_MATCH_NUM,
        homeSource.num,
        { destMatchId: destId, destMatchNum: destNum, slot: 'home' },
      )
    }

    const awaySource = parseSourceLabel(awayLabel)
    if (awaySource) {
      registerFeed(
        awaySource.type === 'winner' ? WINNER_FEEDS_BY_MATCH_NUM : LOSER_FEEDS_BY_MATCH_NUM,
        awaySource.num,
        { destMatchId: destId, destMatchNum: destNum, slot: 'away' },
      )
    }
  }
}

buildFeeds()

export function getKnockoutMatchNumber(matchId: string): number | null {
  const m = matchId.match(/^ko-[a-z_]+-(\d+)$/)
  return m ? Number(m[1]) : null
}

export function getFeedsForWinner(matchNum: number): BracketFeed[] {
  return WINNER_FEEDS_BY_MATCH_NUM[matchNum] ?? []
}

export function getFeedsForLoser(matchNum: number): BracketFeed[] {
  return LOSER_FEEDS_BY_MATCH_NUM[matchNum] ?? []
}
