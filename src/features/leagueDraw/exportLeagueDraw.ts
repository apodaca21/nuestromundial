import { toPng } from 'html-to-image'
import {
  dataUrlToPngBlob,
  inlineImagesForExport,
  savePngBlob,
} from '../../lib/exportImage'
import type { ParticipantAssignment } from './distributeTeams'
import { ORPHAN_PARTICIPANT } from './distributeTeams'

/** Resolución IG Story 9:16 */
const STORY_EXPORT_WIDTH = 1080
const STORY_EXPORT_HEIGHT = 1920

function collectTeamCodes(assignments: ParticipantAssignment[]): string[] {
  return assignments.flatMap((entry) => entry.teams.map((team) => team.code))
}

async function waitForPaint(ms = 80): Promise<void> {
  await new Promise<void>((resolve) => {
    window.setTimeout(
      () => requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ms,
    )
  })
}

async function captureStoryPng(
  root: HTMLElement,
  width: number,
  height: number,
): Promise<string> {
  return toPng(root, {
    width,
    height,
    canvasWidth: STORY_EXPORT_WIDTH,
    canvasHeight: STORY_EXPORT_HEIGHT,
    pixelRatio: 1,
    cacheBust: false,
    backgroundColor: '#faf9f7',
    skipAutoScale: true,
    style: {
      borderRadius: '0',
      overflow: 'hidden',
      width: `${width}px`,
      height: `${height}px`,
    },
  })
}

export async function downloadLeagueResults(
  element: HTMLElement,
  assignments: ParticipantAssignment[],
  leagueName: string,
  shareUrl?: string | null,
): Promise<void> {
  const exportRoot =
    element.matches('[data-league-export]')
      ? element
      : element.querySelector<HTMLElement>('[data-league-export]')

  if (!exportRoot) {
    throw new Error('No se encontró la quiniela para exportar.')
  }

  await document.fonts.ready

  const teamCodes = collectTeamCodes(assignments)
  const slug = leagueName.trim().replace(/\s+/g, '-').toLowerCase() || 'quiniela'
  const shareText = shareUrl
    ? `Quiniela de liga: ${leagueName.trim()} — ${shareUrl}`
    : `Quiniela de liga: ${leagueName.trim()}`

  let restoreFlags = () => {}

  try {
    restoreFlags = await inlineImagesForExport(exportRoot, teamCodes)
    await waitForPaint()

    const rect = exportRoot.getBoundingClientRect()
    const width = Math.ceil(rect.width)
    const height = Math.ceil(rect.height)
    if (width < 2 || height < 2) {
      throw new Error('La vista previa no está visible.')
    }

    // 1ª pasada — calienta fuentes/banderas (descartar)
    await captureStoryPng(exportRoot, width, height).catch(() => undefined)
    await waitForPaint(120)

    // 2ª pasada — imagen final para compartir
    const dataUrl = await captureStoryPng(exportRoot, width, height)
    const blob = await dataUrlToPngBlob(dataUrl)
    await savePngBlob(blob, `quiniela-${slug}-story.png`, shareText)
  } finally {
    restoreFlags()
  }
}

export async function shareLeagueLink(
  shareUrl: string,
  leagueName: string,
): Promise<'shared' | 'copied'> {
  const text = `¡Mira la quiniela "${leagueName.trim()}" del Mundial 2026! 👉 ${shareUrl}`

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: `${leagueName.trim()} — Nuestro Mundial`,
        text,
        url: shareUrl,
      })
      return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err
      }
    }
  }

  await navigator.clipboard.writeText(shareUrl)
  return 'copied'
}

export function leagueResultsStats(assignments: ParticipantAssignment[]) {
  const participantCount = assignments.filter(
    (entry) => entry.participant !== ORPHAN_PARTICIPANT,
  ).length
  const teamsPerPlayer = Math.floor(48 / Math.max(1, participantCount))
  return { participantCount, teamsPerPlayer }
}
