import { PLAYER_IMAGE_PATHS } from './fantasyImageManifest'

export function encodePublicPath(relativePath: string): string {
  return `/fantasy/${relativePath.split('/').map(encodeURIComponent).join('/')}`
}

export function getPlayerImageSrc(
  _positionName: string,
  playerName: string,
): string {
  const relativePath = PLAYER_IMAGE_PATHS[playerName]
  if (!relativePath) {
    return '/fantasy/SOBRES/sobre1.png'
  }
  return encodePublicPath(relativePath)
}

export const PACK_IMAGES = {
  closed: '/fantasy/SOBRES/sobre1.png',
  opening: '/fantasy/SOBRES/sobre2.png',
  open: '/fantasy/SOBRES/sobre3.png',
} as const

export const PITCH_BG = '/fantasy/cancha.jpg'

export function getAllFantasyAssetUrls(): string[] {
  const cardUrls = Object.values(PLAYER_IMAGE_PATHS).map(encodePublicPath)
  return [PITCH_BG, PACK_IMAGES.closed, PACK_IMAGES.opening, PACK_IMAGES.open, ...cardUrls]
}
