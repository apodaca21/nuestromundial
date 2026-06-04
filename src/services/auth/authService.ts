import { getSupabase, isSupabaseAuthConfigured } from '../../lib/supabase'
import type { SignInInput, SignUpInput, UserProfile } from '../../types/user'

export class AuthNotConfiguredError extends Error {
  constructor() {
    super(
      'Supabase no está configurado. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env',
    )
    this.name = 'AuthNotConfiguredError'
  }
}

function requireClient() {
  const supabase = getSupabase()
  if (!supabase) throw new AuthNotConfiguredError()
  return supabase
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[auth] fetchProfile', error.message)
    return null
  }

  return data as UserProfile | null
}

export async function signUpUser(input: SignUpInput): Promise<{
  needsEmailConfirmation: boolean
  userId: string | null
}> {
  const supabase = requireClient()

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        display_name: input.displayName.trim(),
      },
    },
  })

  if (error) throw new Error(error.message)

  const user = data.user
  const needsEmailConfirmation = !data.session && Boolean(user)

  return {
    needsEmailConfirmation,
    userId: user?.id ?? null,
  }
}

export async function signInUser(input: SignInInput): Promise<string> {
  const supabase = requireClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('No se pudo iniciar sesión')

  return data.user.id
}

export async function signOutUser(): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export { isSupabaseAuthConfigured }
