import type { DraftPlayer, SelectedPlayer } from './types'

const MAX_STARS = 5
const OPTIONS_COUNT = 3

const MEXICAN_PLAYERS = new Set([
  'Guillermo Ochoa',
  'Jorge Sánchez',
  'Johan Vásquez',
  'César Montes',
  'Mateo Chávez',
  'Edson Álvarez',
  'Luis Chávez',
  'Gilberto Mora',
  'Roberto Alvarado',
  'Armando González',
  'César Huerta',
])

/** Curva suave: estrellas altas salen menos, pero no tanto como antes */
function pickWeight(stars: number, name: string): number {
  const gap = MAX_STARS + 1 - stars
  let weight = Math.pow(gap, 1.35)

  if (stars >= 4) weight = Math.max(weight, 2.8)
  if (stars === 3) weight = Math.max(weight, 4.5)
  if (MEXICAN_PLAYERS.has(name)) weight *= 1.28

  return weight
}

function weightedPickOne(pool: DraftPlayer[]): { player: DraftPlayer; index: number } {
  const weights = pool.map((p) => pickWeight(p.stars, p.name))
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = Math.random() * total

  for (let i = 0; i < pool.length; i++) {
    if (roll < weights[i]) {
      return { player: pool[i], index: i }
    }
    roll -= weights[i]
  }

  return { player: pool[pool.length - 1], index: pool.length - 1 }
}

export function pickRandomOptions(
  players: DraftPlayer[],
  count = OPTIONS_COUNT,
): DraftPlayer[] {
  const target = Math.min(count, players.length)
  const pool = [...players]
  const picked: DraftPlayer[] = []
  const seen = new Set<string>()

  while (picked.length < target && pool.length > 0) {
    const { player, index } = weightedPickOne(pool)
    pool.splice(index, 1)
    if (seen.has(player.name)) continue
    seen.add(player.name)
    picked.push(player)
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

export { MEXICAN_PLAYERS }
