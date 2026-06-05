import type { AppTab } from '../types/match'
import { isTabEnabled } from './featureFlags'

export const SITE_ORIGIN = 'https://nuestromundial.com'

const PATH_TO_TAB: Record<string, AppTab> = {
  '/': 'pronosticos',
  '/pronosticos': 'pronosticos',
  '/quiniela': 'quiniela',
  '/bingo': 'bingo',
  '/estampa': 'estampa',
  '/admin': 'admin',
}

const TAB_TO_PATH: Record<AppTab, string> = {
  pronosticos: '/pronosticos',
  quiniela: '/quiniela',
  bingo: '/bingo',
  estampa: '/estampa',
  admin: '/admin',
}

export interface SectionMeta {
  title: string
  description: string
  shareText: string
}

export const SECTION_META: Record<AppTab, SectionMeta> = {
  pronosticos: {
    title: 'Pronósticos — Nuestro Mundial 2026',
    description: 'Pronósticos en vivo, probabilidades y termómetro de la comunidad del Mundial 2026.',
    shareText: 'Mira los pronósticos del Mundial 2026',
  },
  quiniela: {
    title: 'Quiniela — Nuestro Mundial 2026',
    description: 'Quiniela del Mundial 2026 con tu comunidad.',
    shareText: 'Únete a la quiniela del Mundial 2026',
  },
  bingo: {
    title: 'Bingo — Nuestro Mundial 2026',
    description: 'Bingo del Mundial 2026 para jugar con amigos.',
    shareText: 'Juega el bingo del Mundial 2026',
  },
  estampa: {
    title: 'Mi Estampa — Nuestro Mundial 2026',
    description: 'Crea tu estampa Panini del Mundial 2026 con tu foto y plantilla oficial.',
    shareText: '¡Crea tu carta aquí!',
  },
  admin: {
    title: 'Admin — Nuestro Mundial 2026',
    description: 'Panel de administración.',
    shareText: 'Nuestro Mundial 2026',
  },
}

export function tabFromPathname(pathname: string): AppTab {
  const normalized = pathname.replace(/\/$/, '') || '/'
  const tab = PATH_TO_TAB[normalized] ?? 'pronosticos'
  return isTabEnabled(tab) ? tab : 'pronosticos'
}

export function pathFromTab(tab: AppTab): string {
  return TAB_TO_PATH[tab]
}

export function absoluteTabUrl(tab: AppTab): string {
  return `${SITE_ORIGIN}${pathFromTab(tab)}`
}

export function shareMessageForTab(tab: AppTab): string {
  const meta = SECTION_META[tab]
  return `${meta.shareText} 👉 ${absoluteTabUrl(tab)}`
}

export const ESTAMPA_SHARE_MESSAGE = shareMessageForTab('estampa')
