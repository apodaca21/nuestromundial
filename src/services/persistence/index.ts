import { isSupabaseConfigured, SupabaseTournamentPersistence } from './supabasePersistence'
import { LocalTournamentPersistence } from './localPersistence'
import type { TournamentPersistence } from './types'

let instance: TournamentPersistence | null = null

export function getTournamentPersistence(): TournamentPersistence {
  if (!instance) {
    instance = isSupabaseConfigured()
      ? new SupabaseTournamentPersistence()
      : new LocalTournamentPersistence()
  }
  return instance
}

export type { TournamentPersistence } from './types'
