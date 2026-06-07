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

async function loadCrossOriginImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas no disponible'))
        return
      }
      ctx.drawImage(image, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => reject(new Error(`No se pudo cargar ${src}`))
    image.src = src
  })
}

async function fetchFlagDataUrl(teamCode: string): Promise<string> {
  const cached = flagDataUrlByTeam.get(teamCode)
  if (cached) return cached

  const src = getFlagUrl(teamCode, FLAG_EXPORT_WIDTH)
  let dataUrl: string
  try {
    const response = await fetch(src, { mode: 'cors', credentials: 'omit' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    dataUrl = await blobToDataUrl(await response.blob())
  } catch {
    dataUrl = await loadCrossOriginImageAsDataUrl(src)
  }

  flagDataUrlByTeam.set(teamCode, dataUrl)
  return dataUrl
}

export function getCachedTeamFlagSrc(teamCode: string): string | undefined {
  return flagDataUrlByTeam.get(teamCode)
}

/** Precarga banderas por código ISO (w160) en caché. */
export async function preloadTeamFlags(teamCodes: string[]): Promise<void> {
  const unique = [...new Set(teamCodes)]
  const batchSize = 6

  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize)
    await Promise.all(batch.map((code) => fetchFlagDataUrl(code).catch(() => undefined)))
  }
}

/** Espera a que todas las banderas estén en caché (reintentos). */
export async function ensureTeamFlagsCached(teamCodes: string[]): Promise<void> {
  const unique = [...new Set(teamCodes)]

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await preloadTeamFlags(unique.filter((code) => !flagDataUrlByTeam.has(code)))
    if (unique.every((code) => flagDataUrlByTeam.has(code))) return
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 150 * (attempt + 1))
    })
  }
}

async function ensureTeamFlagsReady(teamCodes: string[]): Promise<void> {
  await ensureTeamFlagsCached(teamCodes)
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

function applyTeamFlagsFromCache(root: HTMLElement): HTMLImageElement[] {
  const touched: HTMLImageElement[] = []

  for (const img of root.querySelectorAll<HTMLImageElement>('img[data-team-code]')) {
    const teamCode = img.getAttribute('data-team-code')
    if (!teamCode) continue

    const dataUrl = flagDataUrlByTeam.get(teamCode)
    if (!dataUrl) continue

    img.src = dataUrl
    img.removeAttribute('crossorigin')
    touched.push(img)
  }

  return touched
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

  await ensureTeamFlagsReady(teamCodes)

  for (const img of root.querySelectorAll<HTMLImageElement>('img[data-team-code]')) {
    restores.push({
      img,
      src: img.currentSrc || img.src,
      crossOrigin: img.getAttribute('crossorigin'),
    })
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    applyTeamFlagsFromCache(root)
    await waitForImagesReady(Array.from(root.querySelectorAll('img')))

    const broken = brokenFlagImages(root)
    if (broken.length === 0) break

    const missingCodes = [
      ...new Set(
        broken
          .map((img) => img.getAttribute('data-team-code'))
          .filter((code): code is string => Boolean(code)),
      ),
    ]
    await preloadTeamFlags(missingCodes)
  }

  return () => {
    for (const entry of restores) {
      entry.img.src = entry.src
      if (entry.crossOrigin) entry.img.setAttribute('crossorigin', entry.crossOrigin)
      else entry.img.removeAttribute('crossorigin')
    }
  }
}
