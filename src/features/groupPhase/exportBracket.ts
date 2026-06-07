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
  element.querySelectorAll('img').forEach((img) => {
    img.crossOrigin = 'anonymous'
  })

  await document.fonts.ready
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })

  const scrollContainer = element.querySelector(
    '[data-bracket-scroll]',
  ) as HTMLElement | null

  const saved: Array<{ node: HTMLElement; overflow: string; height: string }> = []
  const stashStyle = (node: HTMLElement | null) => {
    if (!node) return
    saved.push({
      node,
      overflow: node.style.overflow,
      height: node.style.height,
    })
    node.style.overflow = 'visible'
    if (node.hasAttribute('data-bracket-scroll')) {
      node.style.height = 'auto'
      node.scrollTop = 0
      node.scrollLeft = 0
    }
  }

  stashStyle(element)
  stashStyle(scrollContainer)
  scrollContainer?.querySelectorAll<HTMLElement>('[data-bracket-capture]').forEach(stashStyle)

  const width = Math.ceil(element.scrollWidth)
  const height = Math.ceil(element.scrollHeight)
  if (width < 2 || height < 2) {
    for (const entry of saved) {
      entry.node.style.overflow = entry.overflow
      entry.node.style.height = entry.height
    }
    throw new Error('El bracket no está visible. Espera a que cargue.')
  }

  try {
    const dataUrl = await toPng(element, {
      width,
      height,
      pixelRatio: exportPixelRatio(),
      cacheBust: true,
      backgroundColor: '#f5f4f2',
      skipAutoScale: true,
      style: {
        overflow: 'visible',
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: 'none',
      },
    })

    const blob = await dataUrlToPngBlob(dataUrl)
    const filename = `bracket-${slugify(championName)}-nuestromundial.png`
    await savePngBlob(blob, filename, bracketShareMessage(championName))
  } finally {
    for (const entry of saved) {
      entry.node.style.overflow = entry.overflow
      entry.node.style.height = entry.height
    }
  }
}
