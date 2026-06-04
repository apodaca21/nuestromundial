import { EMPTY_TOURNAMENT_STATE, type TournamentState } from '../../types/tournament'
import type { TournamentPersistence } from './types'

const STORAGE_KEY = 'nuestromundial-tournament-v1'

export class LocalTournamentPersistence implements TournamentPersistence {
  readonly id = 'local' as const

  async load(): Promise<TournamentState> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { ...EMPTY_TOURNAMENT_STATE }
      const parsed = JSON.parse(raw) as TournamentState
      const results = parsed.results ?? {}
      for (const id of Object.keys(results)) {
        const row = results[id]
        if (row && !row.updatedAt) {
          results[id] = {
            ...row,
            updatedAt: row.finishedAt ?? new Date().toISOString(),
          }
        }
      }
      return {
        results,
        bracket: parsed.bracket ?? {},
      }
    } catch {
      return { ...EMPTY_TOURNAMENT_STATE }
    }
  }

  async save(state: TournamentState): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}
