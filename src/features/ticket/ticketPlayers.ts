import { POSITIONS } from '../fantasy/draftData'
import type { DraftPosition } from '../fantasy/types'

/** Posiciones excluidas del boleto (defensas). */
const TICKET_EXCLUDED_POSITION_IDS = new Set(['RB', 'CB1', 'CB2', 'LB'])

/** Jugadores excluidos del boleto. */
const TICKET_EXCLUDED_PLAYER_NAMES = new Set([
  'Alisson Becker',
  'Gianluigi Donnarumma',
  'Mike Maignan',
  'Ederson Moraes',
  'Jan Oblak',
  'Unai Simón',
])

export const TICKET_POSITIONS: DraftPosition[] = POSITIONS.filter(
  (p) => !TICKET_EXCLUDED_POSITION_IDS.has(p.id),
)
  .map((position) => ({
    ...position,
    players: position.players.filter(
      (player) => !TICKET_EXCLUDED_PLAYER_NAMES.has(player.name),
    ),
  }))
  .filter((position) => position.players.length > 0)

export interface TicketPlayerOption {
  name: string
  positionName: string
  stars: number
}

export const TICKET_PLAYERS: TicketPlayerOption[] = TICKET_POSITIONS.flatMap(
  (position) =>
    position.players.map((player) => ({
      name: player.name,
      positionName: position.name,
      stars: player.stars,
    })),
).sort((a, b) => a.name.localeCompare(b.name, 'es'))

export function ticketPlayerKey(player: TicketPlayerOption): string {
  return `${player.positionName}::${player.name}`
}

export function findTicketPlayer(key: string): TicketPlayerOption | undefined {
  return TICKET_PLAYERS.find((p) => ticketPlayerKey(p) === key)
}
