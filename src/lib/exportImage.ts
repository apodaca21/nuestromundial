import { getFlagUrl } from './teamVisuals'

export function exportPixelRatio(): number {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  return isMobile ? 2 : Math.min(2.5, window.devicePixelRatio || 2)
}

const flagDataUrlByTeam = new Map<string, string>()
const FLAG_EXPORT_WIDTH = 160

export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png', 1)
  })
  if (blob) return blob

  const dataUrl = canvas.toDataURL('image/png')
  const base64 = dataUrl.split(',')[1]
  if (!base64) throw new Error('PNG vacío')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: 'image/png' })
}

export async function savePngBlob(
  blob: Blob,
  filename: string,
  shareText: string,
): Promise<void> {
  const file = new File([blob], filename, { type: 'image/png' })

  if (typeof navigator.share === 'function') {
    const withText: ShareData = {
      files: [file],
      text: shareText,
      title: 'Nuestro Mundial 2026',
    }
    try {
      if (!navigator.canShare || navigator.canShare(withText)) {
        await navigator.share(withText)
        return
      }
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: shareText,
          title: 'Nuestro Mundial 2026',
        })
        return
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 3000)
  }
}

export async function dataUrlToPngBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('No se pudo leer la imagen'))
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function rasterizeLoadedImage(img: HTMLImageElement): string | null {
  if (!img.complete || img.naturalWidth === 0) return null

  try {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0)
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

function findLoadedFlagImg(teamCode: string, root?: ParentNode | null): HTMLImageElement | null {
  const scope = root ?? document
  for (const img of scope.querySelectorAll<HTMLImageElement>(
    `img[data-team-code="${teamCode}"]`,
  )) {
    if (img.complete && img.naturalWidth > 0) return img
  }
  return null
}

async function loadCrossOriginImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const dataUrl = rasterizeLoadedImage(image)
      if (dataUrl) resolve(dataUrl)
      else reject(new Error(`No se pudo rasterizar ${src}`))
    }
    image.onerror = () => reject(new Error(`No se pudo cargar ${src}`))
    image.src = src
  })
}

async function fetchFlagDataUrl(teamCode: string, root?: ParentNode | null): Promise<string> {
  const cached = flagDataUrlByTeam.get(teamCode)
  if (cached) return cached

  const domImg = findLoadedFlagImg(teamCode, root)
  if (domImg) {
    const fromDom = rasterizeLoadedImage(domImg)
    if (fromDom) {
      flagDataUrlByTeam.set(teamCode, fromDom)
      return fromDom
    }
  }

  const src = getFlagUrl(teamCode, FLAG_EXPORT_WIDTH)
  let dataUrl: string

  try {
    dataUrl = await loadCrossOriginImageAsDataUrl(src)
  } catch {
    try {
      const response = await fetch(src, { mode: 'cors', credentials: 'omit' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      dataUrl = await blobToDataUrl(await response.blob())
    } catch {
      throw new Error(`No se pudo cargar bandera ${teamCode}`)
    }
  }

  flagDataUrlByTeam.set(teamCode, dataUrl)
  return dataUrl
}

export function getCachedTeamFlagSrc(teamCode: string): string | undefined {
  return flagDataUrlByTeam.get(teamCode)
}

/** Copia banderas ya visibles en pantalla a la caché (mismo origen en canvas). */
export function seedFlagCacheFromDom(root: ParentNode, teamCodes: string[]): void {
  const needed = new Set(teamCodes)

  for (const img of root.querySelectorAll<HTMLImageElement>('img[data-team-code]')) {
    const teamCode = img.getAttribute('data-team-code')
    if (!teamCode || !needed.has(teamCode) || flagDataUrlByTeam.has(teamCode)) continue

    const dataUrl = rasterizeLoadedImage(img)
    if (dataUrl) flagDataUrlByTeam.set(teamCode, dataUrl)
  }
}

/** Precarga banderas por código ISO (w160) en caché. */
export async function preloadTeamFlags(
  teamCodes: string[],
  root?: ParentNode | null,
): Promise<void> {
  const unique = [...new Set(teamCodes)]
  const batchSize = 4

  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize)
    await Promise.all(
      batch.map((code) => fetchFlagDataUrl(code, root).catch(() => undefined)),
    )
  }
}

/** Espera a que todas las banderas estén en caché (reintentos). */
export async function ensureTeamFlagsCached(
  teamCodes: string[],
  root?: ParentNode | null,
): Promise<void> {
  const unique = [...new Set(teamCodes)]

  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (root) seedFlagCacheFromDom(root, unique)
    await preloadTeamFlags(
      unique.filter((code) => !flagDataUrlByTeam.has(code)),
      root,
    )
    if (unique.every((code) => flagDataUrlByTeam.has(code))) return
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 200 * (attempt + 1))
    })
  }
}

/**
 * Prepara caché ANTES de cambiar el layout de captura.
 * Usa las banderas ya pintadas en pantalla para evitar CORS en el primer intento.
 */
export async function prepareFlagsForExport(
  root: HTMLElement,
  teamCodes: string[],
): Promise<void> {
  const unique = [...new Set(teamCodes)]
  const deadline = Date.now() + 18000

  while (Date.now() < deadline) {
    seedFlagCacheFromDom(root, unique)
    await preloadTeamFlags(
      unique.filter((code) => !flagDataUrlByTeam.has(code)),
      root,
    )

    if (unique.every((code) => flagDataUrlByTeam.has(code))) return

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 300)
    })
  }

  const missing = unique.filter((code) => !flagDataUrlByTeam.has(code))
  throw new Error(
    `No se pudieron cargar ${missing.length} bandera(s). Revisa tu conexión e intenta de nuevo.`,
  )
}

async function waitForImagesReady(images: HTMLImageElement[]): Promise<void> {
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          const done = () => resolve()
          img.addEventListener('load', done, { once: true })
          img.addEventListener('error', done, { once: true })
        }),
    ),
  )
  await Promise.all(images.map((img) => img.decode().catch(() => undefined)))
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

function applyTeamFlagsFromCache(root: HTMLElement): void {
  for (const img of root.querySelectorAll<HTMLImageElement>('img[data-team-code]')) {
    const teamCode = img.getAttribute('data-team-code')
    if (!teamCode) continue

    const dataUrl = flagDataUrlByTeam.get(teamCode)
    if (!dataUrl) continue

    if (img.src !== dataUrl) {
      img.srcset = ''
      img.src = dataUrl
    }
    img.removeAttribute('crossorigin')
  }
}

function brokenFlagImages(root: HTMLElement): HTMLImageElement[] {
  return Array.from(root.querySelectorAll<HTMLImageElement>('img[data-team-code]')).filter(
    (img) => !img.src.startsWith('data:') || img.naturalWidth === 0,
  )
}

/** Incrusta banderas como data URL antes de html-to-image. */
export async function inlineImagesForExport(
  root: HTMLElement,
  teamCodes: string[],
): Promise<() => void> {
  const restores: Array<{
    img: HTMLImageElement
    src: string
    crossOrigin: string | null
  }> = []

  await ensureTeamFlagsCached(teamCodes, root)

  for (const img of root.querySelectorAll<HTMLImageElement>('img[data-team-code]')) {
    restores.push({
      img,
      src: img.currentSrc || img.src,
      crossOrigin: img.getAttribute('crossorigin'),
    })
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    applyTeamFlagsFromCache(root)
    await waitForImagesReady(
      Array.from(root.querySelectorAll<HTMLImageElement>('img[data-team-code]')),
    )

    const broken = brokenFlagImages(root)
    if (broken.length === 0) break

    seedFlagCacheFromDom(root, teamCodes)
    const missingCodes = [
      ...new Set(
        broken
          .map((img) => img.getAttribute('data-team-code'))
          .filter((code): code is string => Boolean(code)),
      ),
    ]
    await preloadTeamFlags(missingCodes, root)
  }

  if (brokenFlagImages(root).length > 0) {
    throw new Error('Las banderas aún no están listas. Intenta de nuevo.')
  }

  return () => {
    for (const entry of restores) {
      entry.img.srcset = ''
      entry.img.src = entry.src
      if (entry.crossOrigin) entry.img.setAttribute('crossorigin', entry.crossOrigin)
      else entry.img.removeAttribute('crossorigin')
    }
  }
}
