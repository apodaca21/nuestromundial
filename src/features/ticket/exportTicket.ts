import { toPng } from 'html-to-image'
import { BOLETO_SHARE_MESSAGE } from '../../lib/appRoutes'
import {
  dataUrlToPngBlob,
  inlineImagesForExport,
  savePngBlob,
} from '../../lib/exportImage'

const TICKET_SHARE_TEXT = BOLETO_SHARE_MESSAGE
/** Resolución IG Story 9:16 */
const TICKET_EXPORT_WIDTH = 1080
const TICKET_EXPORT_HEIGHT = 1920

const playerPhotoCache = new Map<string, string>()

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

async function fetchPlayerPhotoDataUrl(src: string): Promise<string | null> {
  const cached = playerPhotoCache.get(src)
  if (cached) return cached

  try {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const dataUrl = await blobToDataUrl(await res.blob())
    playerPhotoCache.set(src, dataUrl)
    return dataUrl
  } catch {
    return null
  }
}

/** Precarga la foto del jugador en caché (llamar al elegir jugador). */
export function preloadTicketPlayerPhoto(src: string | null | undefined): void {
  if (!src) return
  void fetchPlayerPhotoDataUrl(src)
}

async function waitForPaint(ms = 80): Promise<void> {
  await new Promise<void>((resolve) => {
    window.setTimeout(
      () => requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ms,
    )
  })
}

async function inlinePlayerPhoto(root: HTMLElement): Promise<() => void> {
  const img = root.querySelector<HTMLImageElement>('[data-ticket-player]')
  if (!img?.src) return () => {}

  const restore = {
    src: img.currentSrc || img.src,
    crossOrigin: img.getAttribute('crossorigin'),
  }

  const dataUrl = await fetchPlayerPhotoDataUrl(restore.src)
  if (dataUrl) {
    img.removeAttribute('crossorigin')
    img.removeAttribute('srcset')
    img.src = dataUrl
    await img.decode().catch(() => undefined)
  }

  return () => {
    img.removeAttribute('srcset')
    img.src = restore.src
    if (restore.crossOrigin) img.setAttribute('crossorigin', restore.crossOrigin)
    else img.removeAttribute('crossorigin')
  }
}

async function captureTicketPng(
  ticketEl: HTMLElement,
  width: number,
  height: number,
): Promise<string> {
  return toPng(ticketEl, {
    width,
    height,
    canvasWidth: TICKET_EXPORT_WIDTH,
    canvasHeight: TICKET_EXPORT_HEIGHT,
    pixelRatio: 1,
    cacheBust: false,
    backgroundColor: '#0c0c0e',
    skipAutoScale: true,
    style: {
      borderRadius: '0',
      overflow: 'hidden',
      width: `${width}px`,
      height: `${height}px`,
    },
  })
}

export async function downloadWorldCupTicket(
  element: HTMLElement,
): Promise<void> {
  const ticketEl =
    element.matches('[data-ticket-export]')
      ? element
      : element.querySelector<HTMLElement>('[data-ticket-export]')

  if (!ticketEl) {
    throw new Error('No se encontró el boleto para exportar.')
  }

  const countryCode = ticketEl.getAttribute('data-country-code')
  if (!countryCode) {
    throw new Error('Falta el país del boleto.')
  }

  await document.fonts.ready

  let restoreFlags = () => {}
  let restorePlayer = () => {}

  try {
    restoreFlags = await inlineImagesForExport(ticketEl, [countryCode])
    restorePlayer = await inlinePlayerPhoto(ticketEl)
    await waitForPaint()

    const rect = ticketEl.getBoundingClientRect()
    const width = Math.ceil(rect.width)
    const height = Math.ceil(rect.height)
    if (width < 2 || height < 2) {
      throw new Error('La vista previa no está visible.')
    }

    // 1ª pasada: calienta fuentes/imágenes en el motor de captura (descartar)
    await captureTicketPng(ticketEl, width, height).catch(() => undefined)
    await waitForPaint(120)

    const playerImg = ticketEl.querySelector<HTMLImageElement>('[data-ticket-player]')
    if (playerImg) {
      await playerImg.decode().catch(() => undefined)
    }

    // 2ª pasada: imagen final que se comparte con el mensaje
    const dataUrl = await captureTicketPng(ticketEl, width, height)
    const blob = await dataUrlToPngBlob(dataUrl)
    await savePngBlob(blob, 'boleto-mundial-2026.png', TICKET_SHARE_TEXT)
  } finally {
    restorePlayer()
    restoreFlags()
  }
}
