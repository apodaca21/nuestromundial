import type { ParticipantAssignment } from '../features/leagueDraw/distributeTeams'

/** Formato compacto guardado en JSONB (solo códigos de equipo). */
export interface StoredLeagueDrawResult {
  assignments: Array<{
    participant: string
    teamCodes: string[]
  }>
}

export interface LeagueRecord {
  id: string
  owner_id: string
  name: string
  share_code: string
  draw_result: StoredLeagueDrawResult
  created_at: string
}

export interface LeagueSummary {
  id: string
  name: string
  share_code: string
  created_at: string
  participant_count: number
}

export interface SavedLeagueView {
  record: LeagueRecord
  assignments: ParticipantAssignment[]
}
