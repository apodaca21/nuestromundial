import { getFlagUrl } from './teamVisuals'

export function exportPixelRatio(): number {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  return isMobile ? 2 : Math.min(2.5, window.devicePixelRatio || 2)
}

const flagDataUrlCache = new Map<string, string>()
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

async function imageSrcToDataUrl(src: string): Promise<string> {
  const cached = flagDataUrlCache.get(src)
  if (cached) return cached

  let dataUrl: string
  try {
    const response = await fetch(src, { mode: 'cors', credentials: 'omit' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    dataUrl = await blobToDataUrl(await response.blob())
  } catch {
    dataUrl = await loadCrossOriginImageAsDataUrl(src)
  }

  flagDataUrlCache.set(src, dataUrl)
  return dataUrl
}

/** Precarga banderas en caché antes de exportar (evita PNG sin flags en el 1er intento). */
export async function preloadTeamFlags(teamCodes: string[]): Promise<void> {
  const urls = [...new Set(teamCodes.map((code) => getFlagUrl(code, FLAG_EXPORT_WIDTH)))]
  await Promise.all(urls.map((url) => imageSrcToDataUrl(url).catch(() => undefined)))
}

function resolveExportFlagUrl(img: HTMLImageElement): string | null {
  const src = img.currentSrc || img.src
  if (src && src.startsWith('data:')) return null
  if (src && src.includes('flagcdn.com')) return src

  const teamCode = img.getAttribute('data-team-code')
  if (teamCode) return getFlagUrl(teamCode, FLAG_EXPORT_WIDTH)

  return src && src.length > 8 ? src : null
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

/** Convierte imágenes externas a data URL para que html-to-image las incluya en el PNG. */
export async function inlineImagesForExport(root: HTMLElement): Promise<() => void> {
  const images = Array.from(root.querySelectorAll('img'))
  const restores: Array<{
    img: HTMLImageElement
    src: string
    crossOrigin: string | null
  }> = []

  const urlEntries = images
    .map((img) => ({ img, url: resolveExportFlagUrl(img) }))
    .filter((entry): entry is { img: HTMLImageElement; url: string } => Boolean(entry.url))

  const uniqueUrls = [...new Set(urlEntries.map((entry) => entry.url))]
  await Promise.all(uniqueUrls.map((url) => imageSrcToDataUrl(url).catch(() => undefined)))

  for (const { img, url } of urlEntries) {
    const dataUrl = flagDataUrlCache.get(url)
    if (!dataUrl) continue

    const original = img.currentSrc || img.src
    restores.push({
      img,
      src: original,
      crossOrigin: img.getAttribute('crossorigin'),
    })
    img.src = dataUrl
    img.removeAttribute('crossorigin')
  }

  await waitForImagesReady(images)

  return () => {
    for (const entry of restores) {
      entry.img.src = entry.src
      if (entry.crossOrigin) entry.img.setAttribute('crossorigin', entry.crossOrigin)
      else entry.img.removeAttribute('crossorigin')
    }
  }
}
