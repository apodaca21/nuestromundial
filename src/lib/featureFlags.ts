import type { AppTab } from '../types/match'

/** Activar mañana cuando estén listos */
export const SHOW_QUINIELA_TAB = false
export const SHOW_BINGO_TAB = false

export function isTabEnabled(tab: AppTab): boolean {
  if (tab === 'quiniela') return SHOW_QUINIELA_TAB
  if (tab === 'bingo') return SHOW_BINGO_TAB
  return true
}
