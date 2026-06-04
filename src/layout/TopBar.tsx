import { useCallback, useRef, useState } from 'react'
import { AccountEntryButton } from '../components/AccountEntryButton'
import { AdminGateModal } from '../components/AdminGateModal'
import { InstagramLink } from '../components/InstagramLink'
import { AuthModal } from '../features/auth/AuthModal'
import { useAuth } from '../context/AuthContext'
import { unlockAdmin } from '../lib/adminAccess'
import { pageX, stickyHeader, touchBtn } from '../lib/layout'
import logoMundial from '../assets/logomundial.jpeg'

const TAP_RESET_MS = 2000
const TAPS_REQUIRED = 3

interface TopBarProps {
  onAdminUnlocked?: () => void
}

export function TopBar({ onAdminUnlocked }: TopBarProps) {
  const { profile, user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTaps = useCallback(() => {
    tapCountRef.current = 0
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current)
      tapTimerRef.current = null
    }
  }, [])

  const handleLogoTap = () => {
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
    tapCountRef.current += 1

    if (tapCountRef.current >= TAPS_REQUIRED) {
      resetTaps()
      setShowGate(true)
      return
    }

    tapTimerRef.current = setTimeout(resetTaps, TAP_RESET_MS)
  }

  const handleUnlock = () => {
    unlockAdmin()
    setShowGate(false)
    onAdminUnlocked?.()
  }

  return (
    <>
      <header className={stickyHeader}>
        {/* Móvil: logo + título 2 líneas | botones apilados */}
        <div
          className={`grid min-h-[4.75rem] grid-cols-[auto_1fr_auto] items-center gap-2 py-2.5 sm:hidden ${pageX}`}
        >
          <button
            type="button"
            onClick={handleLogoTap}
            className={`${touchBtn} shrink-0 justify-self-start rounded-lg p-0.5 ring-2 ring-[#6b00ff]/30`}
            aria-label="Logo Nuestro Mundial"
          >
            <img
              src={logoMundial}
              alt=""
              className="h-12 w-12 rounded-lg object-cover"
            />
          </button>

          <h1 className="flex flex-col items-center justify-center px-1 text-center leading-[1.05]">
            <span className="block text-xl font-black uppercase tracking-tighter text-stone-900">
              Nuestro
            </span>
            <span className="block text-xl font-black uppercase tracking-tighter text-stone-900">
              Mundial
            </span>
          </h1>

          <div className="flex w-[6.25rem] shrink-0 flex-col justify-center justify-self-end gap-1.5">
            <InstagramLink stacked />
            <AccountEntryButton
              stacked
              isLoggedIn={Boolean(user)}
              displayName={profile?.display_name}
              onClick={() => setShowAuth(true)}
            />
          </div>
        </div>

        {/* Tablet/desktop: una fila */}
        <div
          className={`hidden min-h-[3.25rem] items-center justify-between gap-3 py-2.5 sm:flex sm:py-3 ${pageX}`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={handleLogoTap}
              className={`${touchBtn} shrink-0 rounded-lg p-0.5 ring-2 ring-[#6b00ff]/30`}
              aria-label="Logo Nuestro Mundial"
            >
              <img
                src={logoMundial}
                alt=""
                className="h-11 w-11 rounded-lg object-cover"
              />
            </button>
            <span className="text-base font-black uppercase tracking-tighter text-stone-900">
              Nuestro Mundial
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <AccountEntryButton
              isLoggedIn={Boolean(user)}
              displayName={profile?.display_name}
              onClick={() => setShowAuth(true)}
            />
            <InstagramLink />
          </div>
        </div>
      </header>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      <AdminGateModal
        open={showGate}
        onClose={() => setShowGate(false)}
        onSuccess={handleUnlock}
      />
    </>
  )
}
