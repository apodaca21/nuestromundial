import type { BracketMatch, ClassifiedTeam } from './types'

export interface BracketPickState {
  r32Matches: BracketMatch[]
  winners: Record<string, ClassifiedTeam>
}

export interface ResolvedBracketMatch {
  id: string
  label: string
  round: 'r32' | 'r16' | 'qf' | 'semi' | 'final'
  home: ClassifiedTeam | null
  away: ClassifiedTeam | null
  winner: ClassifiedTeam | null
  ready: boolean
}

type Side = 'L' | 'R'

const ROUND_LABELS: Record<ResolvedBracketMatch['round'], string> = {
  r32: 'Dieciseisavos',
  r16: 'Octavos',
  qf: 'Cuartos',
  semi: 'Semifinal',
  final: 'Final',
}

/**
 * Avance oficial FIFA 2026 — calendario knockoutSchedule.ts
 *
 * IDs visuales L/R se asignan para que cada par ADYACENTE en la columna
 * de 16avos alimente el mismo partido de octavos.  Orden visual ↓:
 *
 * Izquierda (→ semi-L / M101):
 *   slots 0-1  r32-1(M73) + r32-3(M75) → r16-L-0 (M90)
 *   slots 2-3  r32-2(M74) + r32-5(M77) → r16-L-1 (M89)
 *   slots 4-5  r32-11(M83)+ r32-12(M84)→ r16-L-2 (M93)
 *   slots 6-7  r32-9(M81) + r32-10(M82)→ r16-L-3 (M94)
 *
 * Derecha (→ semi-R / M102):
 *   slots 0-1  r32-4(M76) + r32-6(M78) → r16-R-0 (M91)
 *   slots 2-3  r32-7(M79) + r32-8(M80) → r16-R-1 (M92)
 *   slots 4-5  r32-14(M86)+ r32-16(M88)→ r16-R-2 (M95)
 *   slots 6-7  r32-13(M85)+ r32-15(M87)→ r16-R-3 (M96)
 */
const MATCH_FEEDERS: Record<string, [string, string]> = {
  // Octavos — izquierda
  'r16-L-0': ['r32-1', 'r32-3'],    // M73 + M75 → M90
  'r16-L-1': ['r32-2', 'r32-5'],    // M74 + M77 → M89
  'r16-L-2': ['r32-11', 'r32-12'],  // M83 + M84 → M93
  'r16-L-3': ['r32-9', 'r32-10'],   // M81 + M82 → M94
  // Octavos — derecha
  'r16-R-0': ['r32-4', 'r32-6'],    // M76 + M78 → M91
  'r16-R-1': ['r32-7', 'r32-8'],    // M79 + M80 → M92
  'r16-R-2': ['r32-14', 'r32-16'],  // M86 + M88 → M95
  'r16-R-3': ['r32-13', 'r32-15'],  // M85 + M87 → M96
  // Cuartos
  'qf-L-0': ['r16-L-0', 'r16-L-1'],  // M90 + M89 → M97
  'qf-L-1': ['r16-L-2', 'r16-L-3'],  // M93 + M94 → M98
  'qf-R-0': ['r16-R-0', 'r16-R-1'],  // M91 + M92 → M99
  'qf-R-1': ['r16-R-2', 'r16-R-3'],  // M95 + M96 → M100
  // Semifinales
  'semi-L': ['qf-L-0', 'qf-L-1'],    // M97 + M98 → M101
  'semi-R': ['qf-R-0', 'qf-R-1'],    // M99 + M100 → M102
  final: ['semi-L', 'semi-R'],        // M101 + M102 → M104
}

export function createBracketPickState(r32Matches: BracketMatch[]): BracketPickState {
  return { r32Matches, winners: {} }
}

function r16Id(side: Side, index: number): string {
  return `r16-${side}-${index}`
}

function qfId(side: Side, index: number): string {
  return `qf-${side}-${index}`
}

function semiId(side: Side): string {
  return `semi-${side}`
}

export function listAllBracketMatchIds(r32Matches: BracketMatch[]): string[] {
  const ids = r32Matches.map((match) => match.id)
  for (const side of ['L', 'R'] as Side[]) {
    for (let i = 0; i < 4; i += 1) ids.push(r16Id(side, i))
    for (let i = 0; i < 2; i += 1) ids.push(qfId(side, i))
    ids.push(semiId(side))
  }
  ids.push('final')
  return ids
}

function feederIds(matchId: string): string[] {
  return MATCH_FEEDERS[matchId] ?? []
}

function dependsOn(matchId: string, ancestorId: string): boolean {
  const feeds = feederIds(matchId)
  if (feeds.includes(ancestorId)) return true
  return feeds.some((feedId) => dependsOn(feedId, ancestorId))
}

function clearDownstreamWinners(
  winners: Record<string, ClassifiedTeam>,
  changedId: string,
  r32Matches: BracketMatch[],
): Record<string, ClassifiedTeam> {
  const next = { ...winners }
  for (const id of listAllBracketMatchIds(r32Matches)) {
    if (id !== changedId && dependsOn(id, changedId)) {
      delete next[id]
    }
  }
  return next
}

function resolveParticipants(
  state: BracketPickState,
  matchId: string,
): { home: ClassifiedTeam | null; away: ClassifiedTeam | null } {
  const r32Index = state.r32Matches.findIndex((match) => match.id === matchId)
  if (r32Index >= 0) {
    const match = state.r32Matches[r32Index]
    return { home: match.home, away: match.away }
  }

  const feeds = feederIds(matchId)
  return {
    home: state.winners[feeds[0]] ?? null,
    away: state.winners[feeds[1]] ?? null,
  }
}

export function resolveBracketMatch(
  state: BracketPickState,
  matchId: string,
): ResolvedBracketMatch {
  const round = matchId.startsWith('r32')
    ? 'r32'
    : matchId.startsWith('r16')
      ? 'r16'
      : matchId.startsWith('qf')
        ? 'qf'
        : matchId.startsWith('semi')
          ? 'semi'
          : 'final'

  const { home, away } = resolveParticipants(state, matchId)

  return {
    id: matchId,
    label: ROUND_LABELS[round],
    round,
    home,
    away,
    winner: state.winners[matchId] ?? null,
    ready: Boolean(home && away),
  }
}

export function pickBracketWinner(
  state: BracketPickState,
  matchId: string,
  teamCode: string,
): BracketPickState {
  const { home, away } = resolveParticipants(state, matchId)
  if (!home || !away) return state

  const picked =
    home.team.code === teamCode
      ? home
      : away.team.code === teamCode
        ? away
        : null
  if (!picked) return state

  const winners = clearDownstreamWinners(
    { ...state.winners, [matchId]: picked },
    matchId,
    state.r32Matches,
  )

  return { ...state, winners }
}

export function getBracketColumns(_state: BracketPickState): {
  left: string[][]
  right: string[][]
  finalId: string
} {
  /**
   * Orden visual de los 16avos: cada par de posiciones adyacentes (0-1, 2-3,
   * 4-5, 6-7) debe corresponder a los dos partidos que alimentan el mismo
   * octavo.  Esto hace que el ganador avance al slot correcto sin "saltar".
   *
   * Izquierda: M73, M75, M74, M77, M83, M84, M81, M82
   * Derecha:   M76, M78, M79, M80, M86, M88, M85, M87
   */
  const leftR32 = [
    'r32-1',  // M73: 2ºA vs 2ºB  ┐ → r16-L-0 (M90)
    'r32-3',  // M75: 1ºF vs 2ºC  ┘
    'r32-2',  // M74: 1ºE vs 3º   ┐ → r16-L-1 (M89)
    'r32-5',  // M77: 1ºI vs 3º   ┘
    'r32-11', // M83: 2ºK vs 2ºL  ┐ → r16-L-2 (M93)
    'r32-12', // M84: 1ºH vs 2ºJ  ┘
    'r32-9',  // M81: 1ºD vs 3º   ┐ → r16-L-3 (M94)
    'r32-10', // M82: 1ºG vs 3º   ┘
  ]
  const rightR32 = [
    'r32-4',  // M76: 1ºC vs 2ºF  ┐ → r16-R-0 (M91)
    'r32-6',  // M78: 2ºE vs 2ºI  ┘
    'r32-7',  // M79: 1ºA vs 3º   ┐ → r16-R-1 (M92)
    'r32-8',  // M80: 1ºL vs 3º   ┘
    'r32-14', // M86: 1ºJ vs 2ºH  ┐ → r16-R-2 (M95)
    'r32-16', // M88: 2ºD vs 2ºG  ┘
    'r32-13', // M85: 1ºB vs 3º   ┐ → r16-R-3 (M96)
    'r32-15', // M87: 1ºK vs 3º   ┘
  ]

  return {
    left: [
      leftR32,
      [0, 1, 2, 3].map((i) => r16Id('L', i)),
      [0, 1].map((i) => qfId('L', i)),
      [semiId('L')],
    ],
    right: [
      rightR32,
      [0, 1, 2, 3].map((i) => r16Id('R', i)),
      [0, 1].map((i) => qfId('R', i)),
      [semiId('R')],
    ],
    finalId: 'final',
  }
}

export function getChampion(state: BracketPickState): ClassifiedTeam | null {
  return state.winners.final ?? null
}
