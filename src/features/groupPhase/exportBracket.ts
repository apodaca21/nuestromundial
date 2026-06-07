import { toPng } from 'html-to-image'
import { bracketShareMessage } from '../../lib/appRoutes'
import {
  dataUrlToPngBlob,
  exportPixelRatio,
  inlineImagesForExport,
  savePngBlob,
} from '../../lib/exportImage'
import { getChampion, type BracketPickState } from './bracketEngine'

function slugify(value: string): string {
  return value.trim().replace(/\s+/g, '-').toLowerCase() || 'campeon'
}

export function collectBracketTeamCodes(state: BracketPickState): string[] {
  const codes = new Set<string>()
  for (const match of state.r32Matches) {
    codes.add(match.home.team.code)
    codes.add(match.away.team.code)
  }
  const champion = getChampion(state)
  if (champion) codes.add(champion.team.code)
  return [...codes]
}

export async function downloadBracketImage(
  element: HTMLElement,
  championName: string,
  teamCodes: string[],
): Promise<void> {
  await document.fonts.ready

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

  let restoreImages = () => {}

  try {
    restoreImages = await inlineImagesForExport(element, teamCodes)

    await new Promise<void>((resolve) => {
      window.setTimeout(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      }, 80)
    })

    const width = Math.ceil(element.scrollWidth)
    const height = Math.ceil(element.scrollHeight)
    if (width < 2 || height < 2) {
      throw new Error('El bracket no está visible. Espera a que cargue.')
    }

    const dataUrl = await toPng(element, {
      width,
      height,
      pixelRatio: exportPixelRatio(),
      cacheBust: false,
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
    restoreImages()
    for (const entry of saved) {
      entry.node.style.overflow = entry.overflow
      entry.node.style.height = entry.height
    }
  }
}
