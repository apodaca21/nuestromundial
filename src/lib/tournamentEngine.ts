import type { Match, Team, WinProbabilities } from '../types/match'

/**
 * Fuerza relativa 1–100 (motor interno, sin API).
 * Valores basados en nivel FIFA aproximado; separación moderada para evitar 95/5 en todo.
 */
export const TEAM_POWER_RANKINGS: Record<string, number> = {
  ARG: 96,
  FRA: 94,
  ENG: 93,
  BRA: 92,
  ESP: 91,
  POR: 90,
  GER: 89,
  NED: 88,
  BEL: 87,
  CRO: 86,
  URU: 85,
  COL: 84,
  MEX: 80,
  USA: 79,
  SUI: 78,
  AUT: 77,
  NOR: 76,
  SWE: 75,
  JPN: 74,
  SEN: 73,
  MAR: 72,
  ECU: 71,
  GHA: 70,
  AUS: 69,
  TUR: 68,
  KOR: 67,
  IRN: 66,
  EGY: 65,
  RSA: 64,
  CZE: 63,
  CAN: 62,
  IRQ: 61,
  TUN: 60,
  KSA: 59,
  PAR: 58,
  SCO: 57,
  ALG: 56,
  CIV: 55,
  CPV: 54,
  PAN: 53,
  UZB: 52,
  QAT: 51,
  BIH: 50,
  NZL: 49,
  JOR: 48,
  COD: 47,
  HAI: 45,
  CUW: 43,
}

const DEFAULT_POWER = 55
/** Centro del ranking; comprime extremos para más partidos equilibrados. */
const POWER_BASELINE = 65
const POWER_COMPRESSION = 0.72
/** Ventaja local suave (Mundial en sedes compartidas). */
const HOME_BOOST = 2
/** Mayor divisor = curva más plana (más partidos “parejos”). */
const LOGISTIC_SCALE = 36
const MIN_WIN_PERCENT = 25
const MAX_WIN_PERCENT = 75

function effectivePower(teamCode: string): number {
  const raw = getTeamPower(teamCode)
  return POWER_BASELINE + (raw - POWER_BASELINE) * POWER_COMPRESSION
}

export interface FinalizeMatchInput {
  matchId: string
  homeScore: number
  awayScore: number
  homeTeamCode: string
  awayTeamCode: string
}

export interface FinalizeMatchResult {
  matchId: string
  winner: string | null
  nextMatchId: string | number
  homeScore: number
  awayScore: number
}

/** Mapa simplificado bracket — ampliar en Fase Supabase */
const NEXT_MATCH_BY_ID: Record<string, string | number> = {
  'group-a-1': 'ko-round_of_32-79',
  'group-mex-rsa-001': 5,
}

export function getTeamPower(teamCode: string): number {
  return TEAM_POWER_RANKINGS[teamCode] ?? DEFAULT_POWER
}

/**
 * Probabilidad de victoria local vs visitante (sin empate en UI).
 * Modelo tipo Elo: 50% cuando powers son iguales; sube/baja de forma gradual.
 */
export function calculateMatchOdds(
  teamA: string,
  teamB: string,
  homeTeamCode?: string,
): WinProbabilities {
  let powerA = effectivePower(teamA)
  let powerB = effectivePower(teamB)

  if (homeTeamCode === teamA) powerA += HOME_BOOST
  if (homeTeamCode === teamB) powerB += HOME_BOOST

  const diff = powerA - powerB
  const homeShare = 1 / (1 + Math.pow(10, -diff / LOGISTIC_SCALE))

  let homePercent = Math.round(homeShare * 100)
  homePercent = Math.max(MIN_WIN_PERCENT, Math.min(MAX_WIN_PERCENT, homePercent))

  return {
    homePercent,
    awayPercent: 100 - homePercent,
  }
}

export function calculateMatchOddsFromTeams(
  homeTeam: Team,
  awayTeam: Team,
): WinProbabilities {
  return calculateMatchOdds(homeTeam.code, awayTeam.code, homeTeam.code)
}

export function resolveWinner(
  homeScore: number,
  awayScore: number,
  homeTeamCode: string,
  awayTeamCode: string,
): string | null {
  if (homeScore > awayScore) return homeTeamCode
  if (awayScore > homeScore) return awayTeamCode
  return null
}

export function getNextMatchId(matchId: string): string | number {
  return NEXT_MATCH_BY_ID[matchId] ?? 'TBD'
}

/**
 * Finaliza partido y prepara avance de bracket.
 */
export function finalizeMatchAdvancement(
  input: FinalizeMatchInput,
): FinalizeMatchResult {
  const winner = resolveWinner(
    input.homeScore,
    input.awayScore,
    input.homeTeamCode,
    input.awayTeamCode,
  )
  const nextMatchId = getNextMatchId(input.matchId)

  const payload: FinalizeMatchResult = {
    matchId: input.matchId,
    winner: winner ?? 'DRAW',
    nextMatchId,
    homeScore: input.homeScore,
    awayScore: input.awayScore,
  }

  // TODO: Conectar con Supabase — guardar resultado y actualizar siguiente cruce
  persistMatchResult(payload)

  return payload
}

export function persistMatchResult(result: FinalizeMatchResult): void {
  // TODO: Conectar con Supabase — UPDATE matches SET scores, status='finished', winner
  void result
}

export function getEngineProbabilitiesForMatch(match: Match): WinProbabilities {
  if (!match.homeTeam || !match.awayTeam) {
    return { homePercent: 50, awayPercent: 50 }
  }

  return calculateMatchOddsFromTeams(match.homeTeam, match.awayTeam)
}
