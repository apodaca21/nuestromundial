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

async function inlinePlayerPhoto(root: HTMLElement): Promise<() => void> {
  const img = root.querySelector<HTMLImageElement>('[data-ticket-player]')
  if (!img?.src) return () => {}

  const restore = {
    src: img.currentSrc || img.src,
    crossOrigin: img.getAttribute('crossorigin'),
  }

  try {
    const res = await fetch(img.src)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const dataUrl = await blobToDataUrl(await res.blob())
    img.removeAttribute('crossorigin')
    img.removeAttribute('srcset')
    img.src = dataUrl
    await img.decode()
  } catch {
    // Mantener src original si falla la incrustación
  }

  return () => {
    img.removeAttribute('srcset')
    img.src = restore.src
    if (restore.crossOrigin) img.setAttribute('crossorigin', restore.crossOrigin)
    else img.removeAttribute('crossorigin')
  }
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

    await new Promise<void>((resolve) => {
      window.setTimeout(
        () => requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        80,
      )
    })

    const rect = ticketEl.getBoundingClientRect()
    const width = Math.ceil(rect.width)
    const height = Math.ceil(rect.height)
    if (width < 2 || height < 2) {
      throw new Error('La vista previa no está visible.')
    }

    const dataUrl = await toPng(ticketEl, {
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

    const blob = await dataUrlToPngBlob(dataUrl)
    await savePngBlob(blob, 'boleto-mundial-2026.png', TICKET_SHARE_TEXT)
  } finally {
    restorePlayer()
    restoreFlags()
  }
}
