import { getPlayerImageSrc } from '../fantasy/fantasyImages'
import { TICKET_PLAYER_PHOTO_FILES } from './ticketPlayerPhotoManifest'

export function getTicketPlayerPhotoSrc(
  playerName: string,
  positionName?: string,
): string {
  const file = TICKET_PLAYER_PHOTO_FILES[playerName]
  if (file) return `/ticket-players/${file}`

  if (positionName) {
    return getPlayerImageSrc(positionName, playerName)
  }

  return '/fantasy/SOBRES/sobre1.png'
}

export function getAllTicketPlayerPhotoUrls(): string[] {
  return Object.values(TICKET_PLAYER_PHOTO_FILES).map(
    (file) => `/ticket-players/${encodeURIComponent(file)}`,
  )
}
