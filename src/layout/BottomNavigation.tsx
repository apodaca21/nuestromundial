import { ClipboardList, Grid3x3, Settings, TrendingUp } from 'lucide-react'
import type { AppTab } from '../types/match'
import { navBar, navInner } from '../lib/layout'

interface BottomNavigationProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  showAdmin?: boolean
}

const publicTabs: { id: AppTab; label: string; icon: typeof TrendingUp }[] = [
  { id: 'quiniela', label: 'Quiniela', icon: ClipboardList },
  { id: 'pronosticos', label: 'Pronósticos', icon: TrendingUp },
  { id: 'bingo', label: 'Bingo', icon: Grid3x3 },
]

const adminTab = { id: 'admin' as const, label: 'Admin', icon: Settings }

export function BottomNavigation({
  activeTab,
  onTabChange,
  showAdmin = false,
}: BottomNavigationProps) {
  const tabs = showAdmin ? [...publicTabs, adminTab] : publicTabs

  return (
    <nav className={navBar} aria-label="Navegación principal">
      <div className={navInner}>
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`relative flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-2 transition-colors sm:min-h-14 ${
                isActive ? 'text-[#6b00ff]' : 'text-stone-400 active:text-stone-600'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-[#6b00ff]" />
              )}
              <Icon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden />
              <span className="max-w-full truncate text-[9px] font-black uppercase tracking-tight sm:text-[10px]">
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
