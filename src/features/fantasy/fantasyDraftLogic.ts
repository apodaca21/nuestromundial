import type { DraftPlayer, SelectedPlayer } from './types'

export function pickRandomOptions(
  players: DraftPlayer[],
  count = 3,
): DraftPlayer[] {
  const pool = [...players]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}

export function calcTeamRating(selectedTeam: SelectedPlayer[]): number {
  if (selectedTeam.length === 0) return 0
  const total = selectedTeam.reduce((sum, p) => sum + p.stars, 0)
  return Math.round((total / selectedTeam.length) * 10) / 10
}

export function getRatingMessage(avg: number): string {
  if (avg > 4.5) return '¡Equipazo Mundialista!'
  if (avg >= 4.0) return 'Gran equipo para la copa'
  if (avg >= 3.0) return 'Equipo competitivo'
  return 'Equipo de Ascenso'
}
