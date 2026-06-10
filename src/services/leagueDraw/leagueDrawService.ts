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

const SAVE_TIMEOUT_MS = 20_000

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms)
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timer))
  })
}

function formatSaveError(code: string | undefined, message: string): string {
  if (code === '42P01') {
    return 'Falta la tabla leagues en Supabase. Ejecuta el SQL de supabase/schema.sql.'
  }
  if (code === '42501') {
    return 'Sin permiso para guardar. Cierra sesión, vuelve a entrar e inténtalo otra vez.'
  }
  if (code === '23503') {
    return 'Tu cuenta no está vinculada correctamente. Vuelve a iniciar sesión.'
  }
  return message || 'No se pudo guardar la liga'
}

async function ensureAuthenticatedSession(supabase: ReturnType<typeof requireClient>) {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(error.message)
  if (!data.session?.user) {
    throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
  }
  return data.session
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
  const session = await ensureAuthenticatedSession(supabase)

  if (session.user.id !== input.ownerId) {
    throw new Error(
      'La sesión activa no coincide con tu cuenta. Cierra sesión e inténtalo de nuevo.',
    )
  }

  const drawResult = toStoredResult(input.assignments)
  let shareCode = input.shareCode ?? createShareCode()

  if (input.shareCode) {
    const existing = await fetchLeagueByShareCode(input.shareCode)
    if (existing && existing.record.owner_id === input.ownerId) {
      return existing.record
    }
  }

  const saveOperation = async (): Promise<LeagueRecord> => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { error: insertError } = await supabase.from('leagues').insert({
        owner_id: input.ownerId,
        name: input.name.trim(),
        share_code: shareCode,
        draw_result: drawResult,
      })

      if (!insertError) {
        const { data, error: selectError } = await supabase
          .from('leagues')
          .select('id, owner_id, name, share_code, draw_result, created_at')
          .eq('share_code', shareCode)
          .single()

        if (selectError) {
          throw new Error(formatSaveError(selectError.code, selectError.message))
        }
        if (!data) {
          throw new Error('La liga se guardó pero no pudimos leerla. Recarga la página.')
        }
        return data as LeagueRecord
      }

      if (insertError.code === '23505') {
        shareCode = createShareCode()
        continue
      }

      throw new Error(formatSaveError(insertError.code, insertError.message))
    }

    throw new Error('No se pudo generar un código único para la liga')
  }

  return withTimeout(
    saveOperation(),
    SAVE_TIMEOUT_MS,
    'Tiempo agotado al guardar. Ya puedes usar la quiniela; reintenta sincronizar.',
  )
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
