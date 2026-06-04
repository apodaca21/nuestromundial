import type { TournamentState } from '../../types/tournament'

export interface TournamentPersistence {
  readonly id: 'local' | 'supabase'
  load(): Promise<TournamentState>
  save(state: TournamentState): Promise<void>
}
