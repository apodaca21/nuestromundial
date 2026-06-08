import { getAllFantasyAssetUrls, getPlayerImageSrc } from './fantasyImages'

const preloaded = new Set<string>()
let preloadPromise: Promise<void> | null = null

function preloadUrl(url: string): Promise<void> {
  if (preloaded.has(url)) return Promise.resolve()
  preloaded.add(url)

  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = url
  })
}

/** Precarga cartas, sobres y cancha en segundo plano */
export function preloadFantasyAssets(): Promise<void> {
  if (preloadPromise) return preloadPromise

  preloadPromise = (async () => {
    const urls = getAllFantasyAssetUrls()
    const batchSize = 8
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      await Promise.all(batch.map(preloadUrl))
    }
  })()

  return preloadPromise
}

/** Prioriza las cartas de una posición antes de revelar el sobre */
export function preloadPositionCards(
  positionName: string,
  players: { name: string }[],
): void {
  for (const player of players) {
    void preloadUrl(getPlayerImageSrc(positionName, player.name))
  }
}
