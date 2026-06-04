import type { LucideIcon } from 'lucide-react'
import { ClipboardList, Grid3x3, Settings, TrendingUp } from 'lucide-react'
import type { AppTab } from '../types/match'
import { navBar, navInner } from '../lib/layout'

interface BottomNavigationProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  showAdmin?: boolean
}

const publicTabs: { id: AppTab; label: string; icon: LucideIcon }[] = [
  { id: 'quiniela', label: 'Quiniela', icon: ClipboardList },
  { id: 'pronosticos', label: 'Pronósticos', icon: TrendingUp },
  { id: 'bingo', label: 'Bingo', icon: Grid3x3 },
]

const adminTab = { id: 'admin' as const, label: 'Admin', icon: Settings }

function NavTab({
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string
  icon: LucideIcon
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all duration-200 active:scale-[0.97] sm:min-h-[4rem] sm:gap-1.5 sm:px-2 sm:py-2.5 ${
        isActive
          ? 'bg-[#6b00ff] text-white shadow-lg shadow-[#6b00ff]/30'
          : 'text-stone-500 hover:bg-stone-100/90'
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors sm:h-10 sm:w-10 ${
          isActive ? 'bg-white/15' : 'bg-stone-200/70'
        }`}
      >
        <Icon
          className={`h-[1.35rem] w-[1.35rem] sm:h-6 sm:w-6 ${
            isActive ? 'text-white' : 'text-stone-600'
          }`}
          strokeWidth={isActive ? 2.5 : 2}
          aria-hidden
        />
      </span>
      <span
        className={`max-w-full truncate text-[9px] font-bold uppercase leading-none tracking-wide sm:text-[10px] ${
          isActive ? 'text-white' : 'text-stone-500'
        }`}
      >
        {label}
      </span>
    </button>
  )
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  showAdmin = false,
}: BottomNavigationProps) {
  const tabs = showAdmin ? [...publicTabs, adminTab] : publicTabs

  return (
    <nav
      className={`${navBar} shadow-[0_-6px_20px_rgba(15,15,15,0.06)]`}
      aria-label="Navegación principal"
    >
      <div className={`${navInner} gap-1.5 px-2.5 pt-2 sm:gap-2 sm:px-4 sm:pt-2.5`}>
        {tabs.map(({ id, label, icon }) => (
          <NavTab
            key={id}
            label={label}
            icon={icon}
            isActive={activeTab === id}
            onClick={() => onTabChange(id)}
          />
        ))}
      </div>
    </nav>
  )
}
