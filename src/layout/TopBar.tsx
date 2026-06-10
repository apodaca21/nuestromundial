import { useCallback, useEffect, useRef, useState } from 'react'
import { BrandWordmark } from '../components/BrandWordmark'
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
  onOpenLeague?: (shareCode: string) => void
}

export function TopBar({ onAdminUnlocked, onOpenLeague }: TopBarProps) {
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

  useEffect(() => {
    const handler = () => setShowAuth(true)
    window.addEventListener('nm:open-auth', handler)
    return () => window.removeEventListener('nm:open-auth', handler)
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
        {/* Solo móvil */}
        <div
          className={`grid min-h-[5rem] grid-cols-[3rem_minmax(0,1fr)_5.75rem] items-center gap-x-2 gap-y-0 py-2.5 sm:hidden ${pageX}`}
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

          <BrandWordmark />

          <div className="flex w-full shrink-0 flex-col justify-center justify-self-end gap-1.5">
            <InstagramLink stacked />
            <AccountEntryButton
              stacked
              isLoggedIn={Boolean(user)}
              displayName={profile?.display_name}
              onClick={() => setShowAuth(true)}
            />
          </div>
        </div>

        {/* PC / tablet — layout original */}
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
                className="h-10 w-10 rounded-lg object-cover sm:h-11 sm:w-11"
              />
            </button>
            <span className="whitespace-nowrap text-sm font-black uppercase tracking-tighter text-stone-900 sm:text-base">
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

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onOpenLeague={onOpenLeague}
      />

      <AdminGateModal
        open={showGate}
        onClose={() => setShowGate(false)}
        onSuccess={handleUnlock}
      />
    </>
  )
}
