import { useEffect, useState } from 'react'
import { ChevronRight, Trophy, User, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { fieldInput, pageX } from '../../lib/layout'
import { fetchUserLeagues } from '../../services/leagueDraw/leagueDrawService'
import type { LeagueSummary } from '../../types/league'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onOpenLeague?: (shareCode: string) => void
}

function formatLeagueDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function AuthModal({ open, onClose, onOpenLeague }: AuthModalProps) {
  const { configured, loading, user, profile, signUp, signIn, signOut } = useAuth()
  const [mode, setMode] = useState<AuthMode>('register')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [leagues, setLeagues] = useState<LeagueSummary[]>([])
  const [leaguesLoading, setLeaguesLoading] = useState(false)
  const [leaguesError, setLeaguesError] = useState('')

  useEffect(() => {
    if (!open || !user || !configured) {
      setLeagues([])
      return
    }

    let cancelled = false
    setLeaguesLoading(true)
    setLeaguesError('')

    void fetchUserLeagues(user.id)
      .then((rows) => {
        if (!cancelled) setLeagues(rows)
      })
      .catch((err) => {
        if (!cancelled) {
          setLeaguesError(
            err instanceof Error ? err.message : 'No se pudieron cargar tus ligas',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLeaguesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, user, configured])

  if (!open) return null

  const resetForm = () => {
    setError('')
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setError('Escribe tu nombre o apodo')
          return
        }
        const { needsEmailConfirmation } = await signUp({
          email,
          password,
          displayName: displayName.trim(),
        })
        if (needsEmailConfirmation) {
          setMessage(
            'Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.',
          )
          setMode('login')
        } else {
          setMessage('¡Listo! Ya estás registrado.')
          onClose()
        }
      } else {
        await signIn({ email, password })
        setMessage('Sesión iniciada.')
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar usuario')
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = async () => {
    setBusy(true)
    try {
      await signOut()
      setMessage('Sesión cerrada.')
      setLeagues([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión')
    } finally {
      setBusy(false)
    }
  }

  const handleOpenLeague = (shareCode: string) => {
    onOpenLeague?.(shareCode)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-stone-200 bg-white sm:rounded-2xl">
        <div
          className={`flex items-center justify-between border-b border-stone-100 py-3 ${pageX}`}
        >
          <h2
            id="auth-modal-title"
            className="text-base font-black uppercase tracking-tight text-stone-900"
          >
            Mi cuenta
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-stone-500"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={`overflow-y-auto ${pageX} py-4 pb-[max(1rem,env(safe-area-inset-bottom))]`}>
          {!configured ? (
            <div className="space-y-3 text-sm text-stone-600">
              <p>
                Para guardar usuarios y ligas en la base de datos, configura Supabase en tu
                archivo <code className="text-xs">.env</code>:
              </p>
              <pre className="overflow-x-auto rounded-lg bg-stone-100 p-3 text-xs">
                {`VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
              </pre>
              <p className="text-xs text-stone-500">
                Ejecuta el SQL de <code>supabase/schema.sql</code> en el panel de
                Supabase (incluye <strong>profiles</strong> y <strong>leagues</strong>).
              </p>
            </div>
          ) : loading ? (
            <p className="text-center text-sm text-stone-500">Cargando sesión…</p>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-[#6b00ff]/5 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6b00ff]/15">
                  <User className="h-6 w-6 text-[#6b00ff]" />
                </div>
                <div>
                  <p className="font-black text-stone-900">
                    {profile?.display_name ?? 'Usuario'}
                  </p>
                  <p className="text-xs text-stone-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#6b00ff]" aria-hidden />
                  <h3 className="text-xs font-black uppercase tracking-wide text-stone-500">
                    Mis ligas
                  </h3>
                </div>

                {leaguesLoading ? (
                  <p className="text-xs text-stone-400">Cargando ligas…</p>
                ) : leaguesError ? (
                  <p className="text-xs font-bold text-[#ff004d]">{leaguesError}</p>
                ) : leagues.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-3 py-4 text-xs text-stone-500">
                    Aún no has creado ninguna liga. Ve a Quiniela, arma tu liga y
                    genera el reparto.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {leagues.map((league) => (
                      <li key={league.id}>
                        <button
                          type="button"
                          onClick={() => handleOpenLeague(league.share_code)}
                          className="flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-3 text-left active:bg-stone-50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-stone-900">
                              {league.name}
                            </p>
                            <p className="text-[11px] text-stone-500">
                              {league.participant_count} participantes ·{' '}
                              {formatLeagueDate(league.created_at)}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {message && (
                <p className="text-xs font-bold text-[#006847]">{message}</p>
              )}
              {error && (
                <p className="text-xs font-bold text-[#ff004d]">{error}</p>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSignOut()}
                className="w-full rounded-xl border border-stone-200 py-3 text-sm font-bold text-stone-600"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex rounded-xl bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    resetForm()
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-black uppercase ${
                    mode === 'register'
                      ? 'bg-white text-[#6b00ff] shadow-sm'
                      : 'text-stone-500'
                  }`}
                >
                  Crear cuenta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    resetForm()
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-black uppercase ${
                    mode === 'login'
                      ? 'bg-white text-[#6b00ff] shadow-sm'
                      : 'text-stone-500'
                  }`}
                >
                  Iniciar sesión
                </button>
              </div>

              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
                {mode === 'register' && (
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase text-stone-400">
                      Nombre o apodo
                    </span>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={fieldInput}
                      placeholder="Ej. Miguel"
                    />
                  </label>
                )}

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-stone-400">
                    Correo
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldInput}
                    placeholder="tu@correo.com"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-stone-400">
                    Contraseña
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={
                      mode === 'register' ? 'new-password' : 'current-password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={fieldInput}
                    placeholder="Mínimo 6 caracteres"
                  />
                </label>

                {error && (
                  <p className="text-xs font-bold text-[#ff004d]">{error}</p>
                )}
                {message && (
                  <p className="text-xs font-bold text-[#006847]">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-[#6b00ff] py-3 text-sm font-black uppercase text-white disabled:opacity-50"
                >
                  {busy
                    ? 'Guardando…'
                    : mode === 'register'
                      ? 'Crear usuario'
                      : 'Entrar'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
