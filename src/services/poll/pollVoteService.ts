import { getSupabase } from '../../lib/supabase'

export type PollVoteSide = 'home' | 'away'

export async function fetchUserPollVote(
  matchId: string,
  userId: string,
): Promise<PollVoteSide | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('match_poll_votes')
    .select('side')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[poll] fetchUserPollVote', error.message)
    return null
  }

  if (data?.side === 'home' || data?.side === 'away') {
    return data.side
  }

  return null
}

export async function saveUserPollVote(
  matchId: string,
  userId: string,
  side: PollVoteSide,
  teamCode: string,
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { error } = await supabase.from('match_poll_votes').upsert(
    {
      user_id: userId,
      match_id: matchId,
      side,
      team_code: teamCode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,match_id' },
  )

  if (error) {
    console.error('[poll] saveUserPollVote', error.message)
    return false
  }

  return true
}
