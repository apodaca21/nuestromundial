import type { AppTab } from '../types/match'
import { isTabEnabled } from './featureFlags'

export const SITE_ORIGIN = 'https://nuestromundial.com'

const PATH_TO_TAB: Record<string, AppTab> = {
  '/': 'pronosticos',
  '/pronosticos': 'pronosticos',
  '/quiniela': 'quiniela',
  '/bracket': 'quiniela',
  '/bingo': 'bingo',
  '/estampa': 'estampa',
  '/calendario': 'calendario',
  '/fantasy': 'fantasy',
  '/boleto': 'boleto',
  '/admin': 'admin',
}

const TAB_TO_PATH: Record<AppTab, string> = {
  pronosticos: '/pronosticos',
  quiniela: '/bracket',
  bingo: '/bingo',
  estampa: '/estampa',
  calendario: '/calendario',
  fantasy: '/fantasy',
  boleto: '/boleto',
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
    title: 'Bracket — Nuestro Mundial 2026',
    description: 'Simula el cuadro eliminatorio del Mundial 2026 y elige quién avanza.',
    shareText: 'Arma tu bracket del Mundial 2026',
  },
  bingo: {
    title: 'Quiniela de Liga — Nuestro Mundial 2026',
    description: 'Reparte los 48 equipos del Mundial 2026 entre tus amigos con una quiniela justa.',
    shareText: 'Arma tu quiniela y reparte equipos del Mundial 2026',
  },
  estampa: {
    title: 'Mi Estampa — Nuestro Mundial 2026',
    description: 'Crea tu estampa Panini del Mundial 2026 con tu foto y plantilla oficial.',
    shareText: '¡Crea tu carta aquí!',
  },
  calendario: {
    title: 'Calendario — Nuestro Mundial 2026',
    description: 'Agrega los partidos del Mundial 2026 a Google Calendar o Apple Calendar.',
    shareText: 'No te pierdas ningún partido del Mundial 2026',
  },
  fantasy: {
    title: 'Fantasy Draft — Nuestro Mundial 2026',
    description: 'Arma tu 11 inicial abriendo sobres y elige un jugador por posición.',
    shareText: 'Arma tu equipo Fantasy del Mundial 2026',
  },
  boleto: {
    title: 'Boleto al Mundial — Nuestro Mundial 2026',
    description: 'Genera tu pase VIP al Mundial 2026 en formato Instagram Story.',
    shareText: '¡Crea tu boleto al Mundial 2026!',
  },
  admin: {
    title: 'Admin — Nuestro Mundial 2026',
    description: 'Panel de administración.',
    shareText: 'Nuestro Mundial 2026',
  },
}

export function tabFromPathname(pathname: string): AppTab {
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (normalized.startsWith('/liga/')) {
    return isTabEnabled('bingo') ? 'bingo' : 'pronosticos'
  }
  const tab = PATH_TO_TAB[normalized] ?? 'pronosticos'
  return isTabEnabled(tab) ? tab : 'pronosticos'
}

export function leagueShareCodeFromPathname(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, '') || '/'
  const match = normalized.match(/^\/liga\/([0-9]{5})$/)
  return match ? match[1] : null
}

export function leagueShareUrl(shareCode: string): string {
  return `${SITE_ORIGIN}/liga/${shareCode}`
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
export const BOLETO_SHARE_MESSAGE = shareMessageForTab('boleto')

export const BRACKET_SHARE_URL = `${SITE_ORIGIN}/bracket`

export function bracketShareMessage(championName: string): string {
  return `¡${championName} campeón en mi bracket del Mundial 2026! 👉 ${BRACKET_SHARE_URL}`
}

export const BRACKET_SHARE_MESSAGE = shareMessageForTab('quiniela')
