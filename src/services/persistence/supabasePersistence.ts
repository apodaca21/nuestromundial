import type { TournamentState } from '../../types/tournament'
import type { TournamentPersistence } from './types'
import { LocalTournamentPersistence } from './localPersistence'

/**
 * Persistencia en Supabase — activa cuando existan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
 * Mientras no esté conectado, delega en localStorage y sincroniza en segundo plano.
 *
 * Tablas esperadas: ver supabase/schema.sql
 */
export class SupabaseTournamentPersistence implements TournamentPersistence {
  readonly id = 'supabase' as const
  private fallback = new LocalTournamentPersistence()

  private get configured(): boolean {
    return Boolean(
      import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY,
    )
  }

  async load(): Promise<TournamentState> {
    const local = await this.fallback.load()

    if (!this.configured) {
      return local
    }

    // TODO: Conectar Supabase — SELECT bracket_assignments + match_results
    // const remote = await fetchTournamentState()
    // return mergeRemoteAndLocal(remote, local)
    return local
  }

  async save(state: TournamentState): Promise<void> {
    await this.fallback.save(state)

    if (!this.configured) return

    // TODO: Conectar Supabase — UPSERT match_results y bracket_assignments
    void state
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  )
}
