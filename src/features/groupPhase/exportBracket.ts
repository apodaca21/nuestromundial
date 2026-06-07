import { toPng } from 'html-to-image'
import { bracketShareMessage } from '../../lib/appRoutes'
import { dataUrlToPngBlob, exportPixelRatio, savePngBlob } from '../../lib/exportImage'

function slugify(value: string): string {
  return value.trim().replace(/\s+/g, '-').toLowerCase() || 'campeon'
}

export async function downloadBracketImage(
  element: HTMLElement,
  championName: string,
): Promise<void> {
  const rect = element.getBoundingClientRect()
  if (rect.width < 2 || rect.height < 2) {
    throw new Error('El bracket no está visible. Espera a que cargue.')
  }

  element.querySelectorAll('img').forEach((img) => {
    img.crossOrigin = 'anonymous'
  })

  await document.fonts.ready
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

  const dataUrl = await toPng(element, {
    pixelRatio: exportPixelRatio(),
    cacheBust: true,
    backgroundColor: '#f5f4f2',
    skipAutoScale: true,
  })

  const blob = await dataUrlToPngBlob(dataUrl)
  const filename = `bracket-${slugify(championName)}-nuestromundial.png`
  await savePngBlob(blob, filename, bracketShareMessage(championName))
}
