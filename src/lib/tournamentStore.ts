import {
  resolveWinner,
  type FinalizeMatchInput,
  type FinalizeMatchResult,
} from './tournamentEngine'
import { getTournamentPersistence } from '../services/persistence'
import {
  EMPTY_TOURNAMENT_STATE,
  type BracketAssignments,
  type StoredMatchResult,
  type TournamentState,
} from '../types/tournament'

type Listener = () => void

let state: TournamentState = { ...EMPTY_TOURNAMENT_STATE }
const listeners = new Set<Listener>()
let persistQueue: Promise<void> = Promise.resolve()
let initialized = false

function notify() {
  listeners.forEach((fn) => fn())
}

function queuePersist() {
  const snapshot = state
  persistQueue = persistQueue
    .then(() => getTournamentPersistence().save(snapshot))
    .catch((err) => console.error('[tournament] persist failed', err))
}

export function subscribeTournament(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getTournamentState(): TournamentState {
  return state
}

export function getTournamentRevision(): string {
  return JSON.stringify(state)
}

export async function initTournamentStore(): Promise<void> {
  if (initialized) return
  state = await getTournamentPersistence().load()
  initialized = true
  notify()
}

export function assignMatchTeams(
  matchId: string,
  homeTeamCode: string | null,
  awayTeamCode: string | null,
): void {
  const entry = { ...(state.bracket[matchId] ?? {}) }

  if (homeTeamCode) entry.homeTeamCode = homeTeamCode
  else delete entry.homeTeamCode

  if (awayTeamCode) entry.awayTeamCode = awayTeamCode
  else delete entry.awayTeamCode

  const bracket = { ...state.bracket }
  if (!entry.homeTeamCode && !entry.awayTeamCode) {
    delete bracket[matchId]
  } else {
    bracket[matchId] = entry
  }

  state = { ...state, bracket }
  queuePersist()
  notify()
}

function buildStoredResult(
  input: FinalizeMatchInput,
): StoredMatchResult {
  const winnerCode = resolveWinner(
    input.homeScore,
    input.awayScore,
    input.homeTeamCode,
    input.awayTeamCode,
  )

  const loserCode =
    winnerCode === input.homeTeamCode
      ? input.awayTeamCode
      : winnerCode === input.awayTeamCode
        ? input.homeTeamCode
        : null

  const now = new Date().toISOString()

  return {
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    winnerCode,
    loserCode,
    finishedAt: now,
    updatedAt: now,
  }
}

/** Guarda o actualiza resultado. No avanza bracket automático — tú asignas el siguiente cruce. */
export function saveMatchResult(input: FinalizeMatchInput): FinalizeMatchResult {
  const stored = buildStoredResult(input)
  const existing = state.results[input.matchId]

  state = {
    ...state,
    results: {
      ...state.results,
      [input.matchId]: {
        ...stored,
        finishedAt: existing?.finishedAt ?? stored.finishedAt,
        updatedAt: stored.updatedAt,
      },
    },
  }

  queuePersist()
  notify()

  const winner = stored.winnerCode
  return {
    matchId: input.matchId,
    winner,
    nextMatchId: 'manual',
    homeScore: input.homeScore,
    awayScore: input.awayScore,
  }
}

/** Alias histórico */
export const recordMatchResult = saveMatchResult

export function reopenMatch(matchId: string): void {
  if (!state.results[matchId]) return
  const { [matchId]: _removed, ...results } = state.results
  state = { ...state, results }
  queuePersist()
  notify()
}

export function getStoredResult(matchId: string): StoredMatchResult | undefined {
  return state.results[matchId]
}

export function getBracketAssignments(): BracketAssignments {
  return state.bracket
}

export function clearTournamentState(): void {
  state = { ...EMPTY_TOURNAMENT_STATE }
  queuePersist()
  notify()
}
