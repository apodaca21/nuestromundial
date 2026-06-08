import type { DraftPlayer, SelectedPlayer } from './types'

const MAX_STARS = 5

/** Más estrellas = menos peso → menos probable en los 3 sobres */
function pickWeight(stars: number): number {
  const gap = MAX_STARS + 1 - stars
  return gap * gap
}

function weightedPickOne(pool: DraftPlayer[]): { player: DraftPlayer; index: number } {
  const weights = pool.map((p) => pickWeight(p.stars))
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * total

  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return { player: pool[i], index: i }
  }

  return { player: pool[pool.length - 1], index: pool.length - 1 }
}

export function pickRandomOptions(
  players: DraftPlayer[],
  count = 3,
): DraftPlayer[] {
  const pool = [...players]
  const picked: DraftPlayer[] = []

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const { player, index } = weightedPickOne(pool)
    picked.push(player)
    pool.splice(index, 1)
  }

  return picked
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
