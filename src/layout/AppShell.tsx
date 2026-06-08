import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppTab } from '../types/match'
import { isAdminUnlocked, subscribeAdminAccess } from '../lib/adminAccess'
import { pathFromTab, tabFromPathname } from '../lib/appRoutes'
import { updatePageMeta } from '../lib/pageMeta'
import { appMain, appShell } from '../lib/layout'
import { useStoreSubscription } from '../hooks/useStoreSubscription'
import { AdminScreen } from '../features/admin/AdminScreen'
import { BingoPlaceholder } from '../features/bingo/BingoPlaceholder'
import { PronosticosFlow } from '../features/pronosticos/PronosticosFlow'
import { GroupPhaseFlow } from '../features/groupPhase/GroupPhaseFlow'
import { WorldCupCalendar } from '../features/calendar/WorldCupCalendar'
import { FantasyDraft } from '../features/fantasy/FantasyDraft'
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
  const adminUnlocked = useStoreSubscription(
    subscribeAdminAccess,
    isAdminUnlocked,
  )

  const showTopBar = !(activeTab === 'pronosticos' && pronosticosInDetail)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 })
  }, [activeTab])

  const navigateToTab = useCallback(
    (tab: AppTab) => {
      if (tab === 'admin' && !adminUnlocked) return
      setActiveTab(tab)
      const path = pathFromTab(tab)
      if (window.location.pathname !== path) {
        window.history.pushState({ tab }, '', path)
      }
      updatePageMeta(tab)
    },
    [adminUnlocked],
  )

  useEffect(() => {
    const tab = resolveTabFromLocation(adminUnlocked)
    const path = pathFromTab(tab)
    if (window.location.pathname !== path) {
      window.history.replaceState({ tab }, '', path)
    }
    setActiveTab(tab)
    updatePageMeta(tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, [])

  useEffect(() => {
    const onPopState = () => {
      const tab = resolveTabFromLocation(adminUnlocked)
      const path = pathFromTab(tab)
      if (window.location.pathname !== path) {
        window.history.replaceState({ tab }, '', path)
      }
      setActiveTab(tab)
      updatePageMeta(tab)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [adminUnlocked])

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
      {showTopBar && <TopBar onAdminUnlocked={handleAdminUnlocked} />}

      <main ref={mainRef} className={appMain} tabIndex={-1}>
        {activeTab === 'quiniela' && <GroupPhaseFlow />}
        {activeTab === 'pronosticos' && (
          <PronosticosFlow onDetailOpenChange={setPronosticosInDetail} />
        )}
        {activeTab === 'bingo' && <BingoPlaceholder />}
        {activeTab === 'estampa' && (
          <StickerErrorBoundary>
            <StickerGenerator />
          </StickerErrorBoundary>
        )}
        {activeTab === 'calendario' && <WorldCupCalendar />}
        {activeTab === 'fantasy' && <FantasyDraft />}
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
