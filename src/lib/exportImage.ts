import { getFlagUrl } from './teamVisuals'

export function exportPixelRatio(): number {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  return isMobile ? 2 : Math.min(2.5, window.devicePixelRatio || 2)
}

// Caché global: teamCode → data URL
const flagCache = new Map<string, string>()
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
        await navigator.share({ files: [file], text: shareText, title: 'Nuestro Mundial 2026' })
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

async function imageElementToDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || 160
        canvas.height = img.naturalHeight || 120
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('no ctx')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error(`img load failed: ${src}`))
    img.src = `${src}${src.includes('?') ? '&' : '?'}cb=${Date.now()}`
  })
}

/**
 * Descarga una bandera como data URL.
 * Usa fetch() como método principal (sin problemas de CORS taint en canvas).
 */
async function fetchOneFlag(teamCode: string): Promise<string> {
  const cached = flagCache.get(teamCode)
  if (cached) return cached

  const src = getFlagUrl(teamCode, FLAG_EXPORT_WIDTH)

  // Intento 1: fetch() — el más confiable, sin canvas taint
  try {
    const res = await fetch(src, { mode: 'cors', credentials: 'omit' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const dataUrl = await blobToDataUrl(await res.blob())
    flagCache.set(teamCode, dataUrl)
    return dataUrl
  } catch {
    // intento 2: Image + canvas con cache-buster
  }

  try {
    const dataUrl = await imageElementToDataUrl(src)
    flagCache.set(teamCode, dataUrl)
    return dataUrl
  } catch {
    throw new Error(`No se pudo cargar la bandera de ${teamCode}`)
  }
}

/** Devuelve el data URL cacheado, o undefined si aún no se cargó. */
export function getCachedFlagDataUrl(teamCode: string): string | undefined {
  return flagCache.get(teamCode)
}

/** Precarga en background (no bloquea, no lanza). Útil para warm-up. */
export function preloadTeamFlags(teamCodes: string[]): void {
  const unique = [...new Set(teamCodes)]
  const batchSize = 4

  const runBatch = (start: number) => {
    if (start >= unique.length) return
    const batch = unique.slice(start, start + batchSize)
    void Promise.all(batch.map((code) => fetchOneFlag(code).catch(() => undefined))).then(() => {
      runBatch(start + batchSize)
    })
  }
  runBatch(0)
}

/**
 * Descarga TODAS las banderas indicadas como data URLs.
 * Debe completarse antes de activar el modo captura.
 * Lanza error si no pudo cargar alguna.
 */
export async function prepareFlagsForExport(teamCodes: string[]): Promise<void> {
  const unique = [...new Set(teamCodes)]
  const batchSize = 6

  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize)
    await Promise.all(batch.map((code) => fetchOneFlag(code)))
  }

  const missing = unique.filter((code) => !flagCache.has(code))
  if (missing.length > 0) {
    throw new Error(
      `No se pudieron cargar ${missing.length} bandera(s). Revisa tu conexión e intenta de nuevo.`,
    )
  }
}

/**
 * Reemplaza los src de todas las <img data-team-code> dentro de root por data URLs.
 * Retorna una función para revertir los cambios.
 */
export async function inlineImagesForExport(
  root: HTMLElement,
  teamCodes: string[],
): Promise<() => void> {
  // Asegurar que la caché esté lista (ya debería estarlo, pero por si acaso)
  await prepareFlagsForExport(teamCodes)

  const restores: Array<{ img: HTMLImageElement; src: string; crossOrigin: string | null }> = []

  for (const img of root.querySelectorAll<HTMLImageElement>('img[data-team-code]')) {
    const teamCode = img.getAttribute('data-team-code')
    const dataUrl = teamCode ? flagCache.get(teamCode) : undefined

    restores.push({
      img,
      src: img.currentSrc || img.src,
      crossOrigin: img.getAttribute('crossorigin'),
    })

    if (dataUrl) {
      img.removeAttribute('crossorigin')
      img.removeAttribute('srcset')
      img.src = dataUrl
    }
  }

  // Esperar a que el navegador refleje los cambios
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

  return () => {
    for (const entry of restores) {
      entry.img.removeAttribute('srcset')
      entry.img.src = entry.src
      if (entry.crossOrigin) entry.img.setAttribute('crossorigin', entry.crossOrigin)
      else entry.img.removeAttribute('crossorigin')
    }
  }
}
