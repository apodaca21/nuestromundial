import { getSupabase } from '../../lib/supabase'
import {
  ORPHAN_PARTICIPANT,
  type ParticipantAssignment,
} from '../../features/leagueDraw/distributeTeams'
import { ALL_WORLD_CUP_TEAMS } from '../../features/leagueDraw/worldCupTeams'
import type {
  LeagueRecord,
  LeagueSummary,
  SavedLeagueView,
  StoredLeagueDrawResult,
} from '../../types/league'

const TEAM_BY_CODE = new Map(
  ALL_WORLD_CUP_TEAMS.map((team) => [team.code, team]),
)

function requireClient() {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    )
  }
  return supabase
}

function createShareCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000))
}

export function createLeagueShareCode(): string {
  return createShareCode()
}

function toStoredResult(
  assignments: ParticipantAssignment[],
): StoredLeagueDrawResult {
  return {
    assignments: assignments.map((entry) => ({
      participant: entry.participant,
      teamCodes: entry.teams.map((team) => team.code),
    })),
  }
}

export function hydrateAssignments(
  drawResult: StoredLeagueDrawResult,
): ParticipantAssignment[] {
  return drawResult.assignments.map((entry) => ({
    participant: entry.participant,
    teams: entry.teamCodes.map((code) => {
      const team = TEAM_BY_CODE.get(code)
      if (!team) {
        return {
          code,
          name: code,
          flagEmoji: '🏳️',
          group: 'A' as const,
        }
      }
      return team
    }),
  }))
}

export async function saveLeagueDraw(input: {
  ownerId: string
  name: string
  assignments: ParticipantAssignment[]
  shareCode?: string
}): Promise<LeagueRecord> {
  const supabase = requireClient()
  const drawResult = toStoredResult(input.assignments)

  let shareCode = input.shareCode ?? createShareCode()

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase
      .from('leagues')
      .insert({
        owner_id: input.ownerId,
        name: input.name.trim(),
        share_code: shareCode,
        draw_result: drawResult,
      })
      .select('id, owner_id, name, share_code, draw_result, created_at')
      .single()

    if (!error && data) {
      return data as LeagueRecord
    }

    if (error?.code === '23505') {
      shareCode = createShareCode()
      continue
    }
    throw new Error(error?.message ?? 'No se pudo guardar la liga')
  }

  throw new Error('No se pudo generar un código único para la liga')
}

export async function fetchUserLeagues(userId: string): Promise<LeagueSummary[]> {
  const supabase = requireClient()

  const { data, error } = await supabase
    .from('leagues')
    .select('id, name, share_code, created_at, draw_result')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const drawResult = row.draw_result as StoredLeagueDrawResult
    const realParticipants = drawResult.assignments.filter(
      (entry) => entry.participant !== ORPHAN_PARTICIPANT,
    )
    return {
      id: row.id as string,
      name: row.name as string,
      share_code: row.share_code as string,
      created_at: row.created_at as string,
      participant_count: realParticipants.length,
    }
  })
}

export async function fetchLeagueByShareCode(
  shareCode: string,
): Promise<SavedLeagueView | null> {
  const supabase = requireClient()

  const { data, error } = await supabase
    .from('leagues')
    .select('id, owner_id, name, share_code, draw_result, created_at')
    .eq('share_code', shareCode)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const record = data as LeagueRecord
  return {
    record,
    assignments: hydrateAssignments(record.draw_result),
  }
}
