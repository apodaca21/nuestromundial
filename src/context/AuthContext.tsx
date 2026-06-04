import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchProfile,
  isSupabaseAuthConfigured,
  signInUser,
  signOutUser,
  signUpUser,
} from '../services/auth/authService'
import { getSupabase } from '../lib/supabase'
import type { SignInInput, SignUpInput, UserProfile } from '../types/user'
import type { User } from '@supabase/supabase-js'

interface AuthContextValue {
  configured: boolean
  loading: boolean
  user: User | null
  profile: UserProfile | null
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>
  signIn: (input: SignInInput) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseAuthConfigured()
  const [loading, setLoading] = useState(configured)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const loadProfile = useCallback(async (userId: string) => {
    const p = await fetchProfile(userId)
    setProfile(p)
  }, [])

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        await loadProfile(sessionUser.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        await loadProfile(sessionUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [configured, loadProfile])

  const signUp = useCallback(async (input: SignUpInput) => {
    const result = await signUpUser(input)
    if (!result.needsEmailConfirmation && result.userId) {
      const supabase = getSupabase()
      const { data } = await supabase!.auth.getSession()
      if (data.session?.user) {
        setUser(data.session.user)
        await loadProfile(data.session.user.id)
      }
    }
    return { needsEmailConfirmation: result.needsEmailConfirmation }
  }, [loadProfile])

  const signIn = useCallback(
    async (input: SignInInput) => {
      const userId = await signInUser(input)
      const supabase = getSupabase()
      const { data } = await supabase!.auth.getUser()
      if (data.user?.id === userId) {
        setUser(data.user)
        await loadProfile(userId)
      }
    },
    [loadProfile],
  )

  const signOut = useCallback(async () => {
    await signOutUser()
    setUser(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id)
  }, [user, loadProfile])

  const value = useMemo(
    () => ({
      configured,
      loading,
      user,
      profile,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [
      configured,
      loading,
      user,
      profile,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
