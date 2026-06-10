import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppTab } from '../types/match'
import { isAdminUnlocked, subscribeAdminAccess } from '../lib/adminAccess'
import { pathFromTab, tabFromPathname, leagueShareCodeFromPathname } from '../lib/appRoutes'
import { updatePageMeta } from '../lib/pageMeta'
import { appMain, appShell } from '../lib/layout'
import { useStoreSubscription } from '../hooks/useStoreSubscription'
import { AdminScreen } from '../features/admin/AdminScreen'
import { LeagueDraw } from '../features/leagueDraw/LeagueDraw'
import { PronosticosFlow } from '../features/pronosticos/PronosticosFlow'
import { GroupPhaseFlow } from '../features/groupPhase/GroupPhaseFlow'
import { WorldCupCalendar } from '../features/calendar/WorldCupCalendar'
import { FantasyDraft } from '../features/fantasy/FantasyDraft'
import { WorldCupTicket } from '../features/ticket/WorldCupTicket'
import { StickerErrorBoundary } from '../features/sticker/StickerErrorBoundary'
import { StickerGenerator } from '../features/sticker/StickerGenerator'
import { BottomNavigation } from './BottomNavigation'
import { TopBar } from './TopBar'

function resolveTabFromLocation(adminUnlocked: boolean): AppTab {
  const tab = tabFromPathname(window.location.pathname)
  if (tab === 'admin' && !adminUnlocked) return 'pronosticos'
  return tab
}

export function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>(() =>
    tabFromPathname(window.location.pathname),
  )
  const [pronosticosInDetail, setPronosticosInDetail] = useState(false)
  const [leagueShareCode, setLeagueShareCode] = useState<string | null>(() =>
    leagueShareCodeFromPathname(window.location.pathname),
  )
  const adminUnlocked = useStoreSubscription(
    subscribeAdminAccess,
    isAdminUnlocked,
  )

  const showTopBar = !(activeTab === 'pronosticos' && pronosticosInDetail)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 })
  }, [activeTab])

  const syncFromLocation = useCallback(
    (admin: boolean) => {
      const tab = resolveTabFromLocation(admin)
      setActiveTab(tab)
      setLeagueShareCode(leagueShareCodeFromPathname(window.location.pathname))
      updatePageMeta(tab)
    },
    [],
  )

  const navigateToTab = useCallback(
    (tab: AppTab) => {
      if (tab === 'admin' && !adminUnlocked) return
      setActiveTab(tab)
      setLeagueShareCode(null)
      const path = pathFromTab(tab)
      if (window.location.pathname !== path) {
        window.history.pushState({ tab }, '', path)
      }
      updatePageMeta(tab)
    },
    [adminUnlocked],
  )

  const openLeague = useCallback((shareCode: string) => {
    setActiveTab('bingo')
    setLeagueShareCode(shareCode)
    const path = `/liga/${shareCode}`
    if (window.location.pathname !== path) {
      window.history.pushState({ tab: 'bingo' }, '', path)
    }
    updatePageMeta('bingo')
  }, [])

  useEffect(() => {
    syncFromLocation(adminUnlocked)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, [])

  useEffect(() => {
    const onPopState = () => syncFromLocation(adminUnlocked)

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [adminUnlocked, syncFromLocation])

  const clearLeague = useCallback(() => {
    setLeagueShareCode(null)
    window.history.replaceState({ tab: 'bingo' }, '', '/bingo')
  }, [])

  const handleAdminUnlocked = () => {
    navigateToTab('admin')
  }

  useEffect(() => {
    if (activeTab === 'admin' && !adminUnlocked) {
      navigateToTab('pronosticos')
    }
  }, [activeTab, adminUnlocked, navigateToTab])

  return (
    <div className={appShell}>
      {showTopBar && (
        <TopBar
          onAdminUnlocked={handleAdminUnlocked}
          onOpenLeague={openLeague}
        />
      )}

      <main ref={mainRef} className={appMain} tabIndex={-1}>
        {activeTab === 'quiniela' && <GroupPhaseFlow />}
        {activeTab === 'pronosticos' && (
          <PronosticosFlow onDetailOpenChange={setPronosticosInDetail} />
        )}
        {activeTab === 'bingo' && (
          <LeagueDraw
            shareCode={leagueShareCode}
            onLeagueSaved={openLeague}
            onClearLeague={clearLeague}
          />
        )}
        {activeTab === 'estampa' && (
          <StickerErrorBoundary>
            <StickerGenerator />
          </StickerErrorBoundary>
        )}
        {activeTab === 'calendario' && <WorldCupCalendar />}
        {activeTab === 'fantasy' && <FantasyDraft />}
        {activeTab === 'boleto' && <WorldCupTicket />}
        {adminUnlocked && activeTab === 'admin' && (
          <AdminScreen onExit={() => navigateToTab('pronosticos')} />
        )}
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={navigateToTab}
        showAdmin={adminUnlocked}
      />
    </div>
  )
}
