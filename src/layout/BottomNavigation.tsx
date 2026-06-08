import type { LucideIcon } from 'lucide-react'
import { ClipboardList, CalendarDays, Grid3x3, Image, Settings, TrendingUp, Trophy } from 'lucide-react'
import type { AppTab } from '../types/match'
import { isTabEnabled } from '../lib/featureFlags'
import { navBar, navInner } from '../lib/layout'

interface BottomNavigationProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  showAdmin?: boolean
}

const allPublicTabs: { id: AppTab; label: string; icon: LucideIcon }[] = [
  { id: 'pronosticos', label: 'Pronósticos', icon: TrendingUp },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  { id: 'fantasy', label: 'Fantasy', icon: Trophy },
  { id: 'quiniela', label: 'Bracket', icon: ClipboardList },
  { id: 'bingo', label: 'Bingo', icon: Grid3x3 },
  { id: 'estampa', label: 'Mi Estampa', icon: Image },
]

const publicTabs = allPublicTabs.filter((tab) => isTabEnabled(tab.id))

const adminTab = { id: 'admin' as const, label: 'Admin', icon: Settings }

type TabItem = (typeof publicTabs)[number] | typeof adminTab

/** Móvil: pastilla morada activa */
function NavTabMobile({
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
      className={`flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-all duration-200 active:scale-[0.97] ${
        isActive
          ? 'bg-[#6b00ff] text-white shadow-lg shadow-[#6b00ff]/30'
          : 'text-stone-500 active:bg-stone-100'
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          isActive ? 'bg-white/15' : 'bg-stone-200/70'
        }`}
      >
        <Icon
          className={`h-[1.35rem] w-[1.35rem] ${isActive ? 'text-white' : 'text-stone-600'}`}
          strokeWidth={isActive ? 2.5 : 2}
          aria-hidden
        />
      </span>
      <span
        className={`max-w-full truncate text-[8px] font-bold uppercase leading-none tracking-wide ${
          isActive ? 'text-white' : 'text-stone-500'
        }`}
      >
        {label}
      </span>
    </button>
  )
}

/** PC: estilo clásico (línea arriba + icono) */
function NavTabDesktop({
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
      className={`relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 transition-colors ${
        isActive ? 'text-[#6b00ff]' : 'text-stone-400 hover:text-stone-600'
      }`}
    >
      {isActive && (
        <span className="absolute top-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-[#6b00ff]" />
      )}
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <span className="max-w-full truncate text-[9px] font-black uppercase tracking-tight">
        {label}
      </span>
    </button>
  )
}

function renderTabs(
  tabs: TabItem[],
  activeTab: AppTab,
  onTabChange: (tab: AppTab) => void,
  Variant: typeof NavTabMobile,
) {
  return tabs.map(({ id, label, icon }) => (
    <Variant
      key={id}
      label={label}
      icon={icon}
      isActive={activeTab === id}
      onClick={() => onTabChange(id)}
    />
  ))
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  showAdmin = false,
}: BottomNavigationProps) {
  const tabs = showAdmin ? [...publicTabs, adminTab] : publicTabs

  return (
    <nav
      className={`${navBar} shadow-[0_-6px_20px_rgba(15,15,15,0.06)] sm:shadow-none`}
      aria-label="Navegación principal"
    >
      {/* Móvil */}
      <div className={`${navInner} gap-1.5 px-2.5 pt-2 sm:hidden`}>
        {renderTabs(tabs, activeTab, onTabChange, NavTabMobile)}
      </div>

      {/* PC / tablet */}
      <div className={`${navInner} hidden sm:flex`}>
        {renderTabs(tabs, activeTab, onTabChange, NavTabDesktop)}
      </div>
    </nav>
  )
}
