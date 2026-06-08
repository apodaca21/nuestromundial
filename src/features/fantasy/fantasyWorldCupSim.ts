import { TEAMS } from '../../data/teams'
import { getTeamPower } from '../../lib/tournamentEngine'

export type WorldCupExitStage =
  | 'group'
  | 'round_of_16'
  | 'quarterfinal'
  | 'semifinal'
  | 'final'
  | 'champion'

export interface SimMatchResult {
  phase: string
  opponentCode: string
  opponentName: string
  opponentFlag: string
  userScore: number
  opponentScore: number
  outcome: 'W' | 'D' | 'L'
}

export interface WorldCupSimulationResult {
  exitStage: WorldCupExitStage
  stageLabel: string
  stageEmoji: string
  userPower: number
  groupMatches: SimMatchResult[]
  groupPoints: number
  knockoutMatches: SimMatchResult[]
}

const LOGISTIC_SCALE = 36

const KNOCKOUT_ROUNDS: {
  stage: WorldCupExitStage
  phase: string
  minPower: number
  maxPower: number
}[] = [
  { stage: 'round_of_16', phase: 'Octavos de final', minPower: 68, maxPower: 84 },
  { stage: 'quarterfinal', phase: 'Cuartos de final', minPower: 78, maxPower: 89 },
  { stage: 'semifinal', phase: 'Semifinal', minPower: 86, maxPower: 94 },
  { stage: 'final', phase: 'Final', minPower: 91, maxPower: 98 },
]

export function teamRatingToPower(avgStars: number): number {
  return Math.round(55 + avgStars * 8)
}

function pickOpponent(
  minPower: number,
  maxPower: number,
  usedCodes: Set<string>,
): { code: string; name: string; flag: string; power: number } {
  const pool = Object.keys(TEAMS).filter((code) => {
    if (usedCodes.has(code)) return false
    const power = getTeamPower(code)
    return power >= minPower && power <= maxPower
  })

  let candidates = pool
  if (candidates.length === 0) {
    candidates = Object.keys(TEAMS).filter((code) => !usedCodes.has(code))
  }

  const code = candidates[Math.floor(Math.random() * candidates.length)]
  const team = TEAMS[code]
  usedCodes.add(code)

  return {
    code,
    name: team?.name ?? code,
    flag: team?.flagEmoji ?? '🏳️',
    power: getTeamPower(code),
  }
}

function simulateMatch(
  userPower: number,
  opponent: { code: string; name: string; flag: string; power: number },
  phase: string,
): SimMatchResult {
  const diff = userPower - opponent.power
  const winShare = 1 / (1 + Math.pow(10, -diff / LOGISTIC_SCALE))
  const drawShare = Math.abs(diff) < 10 ? 0.2 : 0.08
  const winProb = Math.max(0.08, Math.min(0.82, winShare * (1 - drawShare)))
  const drawProb = drawShare
  const roll = Math.random()

  let outcome: 'W' | 'D' | 'L'
  if (roll < winProb) outcome = 'W'
  else if (roll < winProb + drawProb) outcome = 'D'
  else outcome = 'L'

  let userScore: number
  let opponentScore: number

  if (outcome === 'W') {
    userScore = 1 + Math.floor(Math.random() * 3)
    opponentScore = Math.floor(Math.random() * userScore)
  } else if (outcome === 'D') {
    userScore = Math.floor(Math.random() * 3)
    opponentScore = userScore
  } else {
    opponentScore = 1 + Math.floor(Math.random() * 3)
    userScore = Math.floor(Math.random() * opponentScore)
  }

  return {
    phase,
    opponentCode: opponent.code,
    opponentName: opponent.name,
    opponentFlag: opponent.flag,
    userScore,
    opponentScore,
    outcome,
  }
}

function pointsForOutcome(outcome: 'W' | 'D' | 'L'): number {
  if (outcome === 'W') return 3
  if (outcome === 'D') return 1
  return 0
}

function buildStageLabel(stage: WorldCupExitStage): { label: string; emoji: string } {
  switch (stage) {
    case 'champion':
      return { label: '¡Campeón del Mundial!', emoji: '🏆' }
    case 'final':
      return { label: 'Perdiste en la Final', emoji: '🥈' }
    case 'semifinal':
      return { label: 'Eliminado en Semifinales', emoji: '⚽' }
    case 'quarterfinal':
      return { label: 'Eliminado en Cuartos de Final', emoji: '⚽' }
    case 'round_of_16':
      return { label: 'Eliminado en Octavos de Final', emoji: '⚽' }
    default:
      return { label: 'Eliminado en Fase de Grupos', emoji: '📋' }
  }
}

export function simulateFantasyWorldCup(teamRating: number): WorldCupSimulationResult {
  const userPower = teamRatingToPower(teamRating)
  const usedCodes = new Set<string>()

  const groupSpread = 14
  const groupMatches: SimMatchResult[] = []
  let groupPoints = 0

  for (let i = 0; i < 3; i++) {
    const opponent = pickOpponent(
      userPower - groupSpread,
      userPower + groupSpread,
      usedCodes,
    )
    const match = simulateMatch(userPower, opponent, 'Fase de grupos')
    groupMatches.push(match)
    groupPoints += pointsForOutcome(match.outcome)
  }

  const groupAdvances = groupPoints >= 4 || (groupPoints >= 3 && userPower >= 72)

  if (!groupAdvances) {
    const { label, emoji } = buildStageLabel('group')
    return {
      exitStage: 'group',
      stageLabel: label,
      stageEmoji: emoji,
      userPower,
      groupMatches,
      groupPoints,
      knockoutMatches: [],
    }
  }

  const knockoutMatches: SimMatchResult[] = []

  for (const round of KNOCKOUT_ROUNDS) {
    const opponent = pickOpponent(round.minPower, round.maxPower, usedCodes)
    const match = simulateMatch(userPower, opponent, round.phase)
    knockoutMatches.push(match)

    if (match.outcome !== 'W') {
      const { label, emoji } = buildStageLabel(round.stage)
      return {
        exitStage: round.stage,
        stageLabel: label,
        stageEmoji: emoji,
        userPower,
        groupMatches,
        groupPoints,
        knockoutMatches,
      }
    }
  }

  const { label, emoji } = buildStageLabel('champion')
  return {
    exitStage: 'champion',
    stageLabel: label,
    stageEmoji: emoji,
    userPower,
    groupMatches,
    groupPoints,
    knockoutMatches,
  }
}
