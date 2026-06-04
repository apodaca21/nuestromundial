import { useEffect, useState } from 'react'
import type { AppTab } from '../types/match'
import { isAdminUnlocked, subscribeAdminAccess } from '../lib/adminAccess'
import { appMain, appShell } from '../lib/layout'
import { useStoreSubscription } from '../hooks/useStoreSubscription'
import { AdminScreen } from '../features/admin/AdminScreen'
import { BingoPlaceholder } from '../features/bingo/BingoPlaceholder'
import { PronosticosFlow } from '../features/pronosticos/PronosticosFlow'
import { QuinielaPlaceholder } from '../features/quiniela/QuinielaPlaceholder'
import { BottomNavigation } from './BottomNavigation'
import { TopBar } from './TopBar'

export function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>('pronosticos')
  const [pronosticosInDetail, setPronosticosInDetail] = useState(false)
  const adminUnlocked = useStoreSubscription(
    subscribeAdminAccess,
    isAdminUnlocked,
  )

  const showTopBar = !(activeTab === 'pronosticos' && pronosticosInDetail)

  const handleAdminUnlocked = () => {
    setActiveTab('admin')
  }

  useEffect(() => {
    if (activeTab === 'admin' && !adminUnlocked) {
      setActiveTab('pronosticos')
    }
  }, [activeTab, adminUnlocked])

  return (
    <div className={appShell}>
      {showTopBar && <TopBar onAdminUnlocked={handleAdminUnlocked} />}

      <main className={appMain}>
        {activeTab === 'quiniela' && <QuinielaPlaceholder />}
        {activeTab === 'pronosticos' && (
          <PronosticosFlow onDetailOpenChange={setPronosticosInDetail} />
        )}
        {activeTab === 'bingo' && <BingoPlaceholder />}
        {adminUnlocked && activeTab === 'admin' && (
          <AdminScreen onExit={() => setActiveTab('pronosticos')} />
        )}
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showAdmin={adminUnlocked}
      />
    </div>
  )
}
