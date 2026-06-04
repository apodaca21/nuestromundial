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
        <div className={`flex items-center justify-between gap-2 py-2.5 sm:py-3 ${pageX}`}>
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={handleLogoTap}
              className={`${touchBtn} rounded-lg p-0.5 ring-2 ring-[#6b00ff]/30`}
              aria-label="Logo Nuestro Mundial"
            >
              <img
                src={logoMundial}
                alt=""
                className="h-10 w-10 rounded-lg object-cover sm:h-11 sm:w-11"
              />
            </button>
            <span className="truncate text-sm font-black uppercase tracking-tighter text-stone-900 sm:text-base">
              Nuestro Mundial
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
