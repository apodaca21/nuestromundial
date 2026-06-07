import { bracketShareMessage } from '../../lib/appRoutes'
import {
  canvasToPngBlob,
  exportPixelRatio,
  flagCache,
  prepareFlagsForExport,
  savePngBlob,
} from '../../lib/exportImage'
import {
  getBracketColumns,
  getChampion,
  resolveBracketMatch,
  type BracketPickState,
} from './bracketEngine'
import type { ClassifiedTeam } from './types'

function slugify(v: string) {
  return v.trim().replace(/\s+/g, '-').toLowerCase() || 'campeon'
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`img error: ${src.slice(0, 40)}`))
    img.src = src
  })
}

function rrect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawImageFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ir = img.naturalWidth / img.naturalHeight
  const dr = w / h
  let sx = 0,
    sy = 0,
    sw = img.naturalWidth,
    sh = img.naturalHeight
  if (ir > dr) {
    sw = sh * dr
    sx = (img.naturalWidth - sw) / 2
  } else {
    sh = sw / dr
    sy = (img.naturalHeight - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

// ─── layout constants (logical px, scale applied at draw time) ──────────────
const SLOT_W = 82
const SLOT_H = 27
const SLOT_GAP = 5
const ROW_H = 62
const NUM_ROWS = 8
const BRACKET_H = NUM_ROWS * ROW_H
const COL_GAP = 16
const MARGIN = 14
const HEADER_H = 22
const BRACKET_Y0 = HEADER_H + 6
const FLAG_W = 26
const FLAG_H = 17
const FLAG_PAD_L = 4

// 9 columns (L16 L8 L4 LS FIN RS R4 R8 R16)
const COLS = Array.from({ length: 9 }, (_, i) => MARGIN + i * (SLOT_W + COL_GAP))
const [COL_L16, COL_L8, COL_L4, COL_LS, COL_FIN, COL_RS, COL_R4, COL_R8, COL_R16] = COLS
const CANVAS_W = MARGIN + 9 * (SLOT_W + COL_GAP) - COL_GAP + MARGIN

const CHAMP_Y0 = BRACKET_Y0 + BRACKET_H + 10
const CHAMP_H = 74
const CANVAS_H = CHAMP_Y0 + CHAMP_H + 22

// ─── helpers ─────────────────────────────────────────────────────────────────

function matchCenterY(matchIdx: number, round: number): number {
  return BRACKET_Y0 + (matchIdx + 0.5) * Math.pow(2, round) * ROW_H
}

function slotCenterY(matchIdx: number, round: number, isAway: boolean): number {
  const mc = matchCenterY(matchIdx, round)
  const offset = (SLOT_H + SLOT_GAP) / 2
  return isAway ? mc + offset : mc - offset
}

type Variant = 'winner' | 'loser' | 'pickable' | 'waiting' | 'ghost'

function resolveVariant(
  team: ClassifiedTeam | null,
  winner: ClassifiedTeam | null,
): Variant {
  if (!team) return 'ghost'
  if (!winner) return 'pickable'
  return winner.team.code === team.team.code ? 'winner' : 'loser'
}

function drawSlot(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  team: ClassifiedTeam | null,
  variant: Variant,
  flagImages: Map<string, HTMLImageElement>,
  sc: number,
) {
  const y = centerY - SLOT_H / 2

  if (variant === 'ghost') {
    ctx.save()
    ctx.setLineDash([3 * sc, 3 * sc])
    ctx.strokeStyle = 'rgba(214,211,209,0.5)'
    ctx.lineWidth = sc
    rrect(ctx, x * sc, y * sc, SLOT_W * sc, SLOT_H * sc, 3 * sc)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
    return
  }

  const bg =
    variant === 'winner'
      ? '#f0fdf4'
      : variant === 'loser'
        ? '#f4f3f1'
        : variant === 'waiting'
          ? '#f9f8f7'
          : '#ffffff'
  const border =
    variant === 'winner' ? '#34d399' : variant === 'loser' ? '#e2e0de' : '#d4d0cc'
  const borderW = variant === 'winner' ? 1.5 : 1

  ctx.save()
  if (variant === 'loser') ctx.globalAlpha = 0.75

  rrect(ctx, x * sc, y * sc, SLOT_W * sc, SLOT_H * sc, 3 * sc)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.strokeStyle = border
  ctx.lineWidth = borderW * sc
  ctx.stroke()

  if (!team) {
    ctx.restore()
    return
  }

  const flagImg = flagImages.get(team.team.code)
  if (flagImg) {
    const fx = (x + FLAG_PAD_L) * sc
    const fy = (y + (SLOT_H - FLAG_H) / 2) * sc
    const fw = FLAG_W * sc
    const fh = FLAG_H * sc

    if (variant === 'loser') ctx.globalAlpha = 0.45
    ctx.save()
    rrect(ctx, fx, fy, fw, fh, 2 * sc)
    ctx.clip()
    drawImageFit(ctx, flagImg, fx, fy, fw, fh)
    ctx.restore()
    ctx.globalAlpha = variant === 'loser' ? 0.75 : 1
  }

  const textColor =
    variant === 'winner' ? '#065f46' : variant === 'loser' ? '#a8a29e' : '#1c1917'
  const fs = 7 * sc
  ctx.fillStyle = textColor
  ctx.font = `800 ${fs}px system-ui,-apple-system,sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(
    team.team.code,
    (x + FLAG_PAD_L + FLAG_W + 5) * sc,
    (y + SLOT_H / 2) * sc,
    (SLOT_W - FLAG_PAD_L - FLAG_W - 9) * sc,
  )

  ctx.restore()
}

function drawColumnLabel(
  ctx: CanvasRenderingContext2D,
  colX: number,
  label: string,
  color: string,
  sc: number,
) {
  ctx.save()
  ctx.fillStyle = color
  ctx.font = `900 ${5.5 * sc}px system-ui,-apple-system,sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label.toUpperCase(), (colX + SLOT_W / 2) * sc, (HEADER_H / 2) * sc)
  ctx.restore()
}

function drawConnector(
  ctx: CanvasRenderingContext2D,
  leftColX: number,
  rightColX: number,
  feedYPairs: number[],
  targetY: number,
  sc: number,
) {
  const lx = (leftColX + SLOT_W) * sc
  const rx = rightColX * sc
  const midX = (lx + rx) / 2

  ctx.save()
  ctx.strokeStyle = 'rgba(212,208,204,0.7)'
  ctx.lineWidth = sc

  feedYPairs.forEach((fy) => {
    ctx.beginPath()
    ctx.moveTo(lx, fy * sc)
    ctx.lineTo(midX, fy * sc)
    ctx.stroke()
  })

  if (feedYPairs.length >= 2) {
    ctx.beginPath()
    ctx.moveTo(midX, feedYPairs[0] * sc)
    ctx.lineTo(midX, feedYPairs[feedYPairs.length - 1] * sc)
    ctx.stroke()
  }

  ctx.beginPath()
  ctx.moveTo(midX, targetY * sc)
  ctx.lineTo(rx, targetY * sc)
  ctx.stroke()
  ctx.restore()
}

// ─── main export ──────────────────────────────────────────────────────────────

export async function downloadBracketImageCanvas(
  state: BracketPickState,
  teamCodes: string[],
): Promise<void> {
  const champion = getChampion(state)
  if (!champion) throw new Error('Elige un campeón en la final antes de generar la imagen.')

  await document.fonts.ready
  await prepareFlagsForExport(teamCodes)

  const flagImages = new Map<string, HTMLImageElement>()
  await Promise.all(
    teamCodes.map(async (code) => {
      const dataUrl = flagCache.get(code)
      if (!dataUrl) return
      try {
        flagImages.set(code, await loadImg(dataUrl))
      } catch {
        /* skip */
      }
    }),
  )

  const sc = exportPixelRatio()
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(CANVAS_W * sc)
  canvas.height = Math.round(CANVAS_H * sc)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas no disponible.')

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  bg.addColorStop(0, '#f5f4f2')
  bg.addColorStop(0.5, '#fafaf9')
  bg.addColorStop(1, '#f5f4f2')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const columns = getBracketColumns(state)

  type ColCfg = { matchIds: string[]; colX: number; round: number; label: string }

  const leftCols: ColCfg[] = [
    { matchIds: columns.left[0], colX: COL_L16, round: 0, label: '16avos' },
    { matchIds: columns.left[1], colX: COL_L8, round: 1, label: '8avos' },
    { matchIds: columns.left[2], colX: COL_L4, round: 2, label: '4tos' },
    { matchIds: columns.left[3], colX: COL_LS, round: 3, label: 'Semis' },
  ]
  const rightCols: ColCfg[] = [
    { matchIds: columns.right[3], colX: COL_RS, round: 3, label: 'Semis' },
    { matchIds: columns.right[2], colX: COL_R4, round: 2, label: '4tos' },
    { matchIds: columns.right[1], colX: COL_R8, round: 1, label: '8avos' },
    { matchIds: columns.right[0], colX: COL_R16, round: 0, label: '16avos' },
  ]

  // ── round labels ────────────────────────────────────────────────────────────
  const LABEL_GRAY = '#b5b0ab'
  leftCols.forEach((c) => drawColumnLabel(ctx, c.colX, c.label, LABEL_GRAY, sc))
  rightCols.forEach((c) => drawColumnLabel(ctx, c.colX, c.label, LABEL_GRAY, sc))
  drawColumnLabel(ctx, COL_FIN, 'Final', '#d97706', sc)

  // ── connectors (left side) ──────────────────────────────────────────────────
  for (let r = 0; r < leftCols.length - 1; r++) {
    const feedCol = leftCols[r]
    const nextCol = leftCols[r + 1]
    nextCol.matchIds.forEach((_, ni) => {
      const feedY0 = matchCenterY(ni * 2, feedCol.round)
      const feedY1 = matchCenterY(ni * 2 + 1, feedCol.round)
      const targetY = matchCenterY(ni, nextCol.round)
      drawConnector(ctx, feedCol.colX, nextCol.colX, [feedY0, feedY1], targetY, sc)
    })
  }

  // left semis → final
  const lSemiY = matchCenterY(0, 3)
  drawConnector(ctx, COL_LS, COL_FIN, [lSemiY], lSemiY, sc)

  // ── connectors (right side, mirrored) ──────────────────────────────────────
  // draw from rightmost outward (R16→R8→R4→RS→FIN)
  for (let r = rightCols.length - 1; r > 0; r--) {
    const feedCol = rightCols[r]
    const nextCol = rightCols[r - 1]
    nextCol.matchIds.forEach((_, ni) => {
      const feedY0 = matchCenterY(ni * 2, feedCol.round)
      const feedY1 = matchCenterY(ni * 2 + 1, feedCol.round)
      const targetY = matchCenterY(ni, nextCol.round)
      // right-side connector goes right→left
      const lx = (nextCol.colX + SLOT_W) * sc
      const rx = (feedCol.colX) * sc
      const midX = (lx + rx) / 2
      ctx.save()
      ctx.strokeStyle = 'rgba(212,208,204,0.7)'
      ctx.lineWidth = sc
      ;[feedY0, feedY1].forEach((fy) => {
        ctx.beginPath()
        ctx.moveTo(rx, fy * sc)
        ctx.lineTo(midX, fy * sc)
        ctx.stroke()
      })
      ctx.beginPath()
      ctx.moveTo(midX, feedY0 * sc)
      ctx.lineTo(midX, feedY1 * sc)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(midX, targetY * sc)
      ctx.lineTo(lx, targetY * sc)
      ctx.stroke()
      ctx.restore()
    })
  }

  // right semis → final
  const rSemiY = matchCenterY(0, 3)
  const finRx = (COL_RS) * sc
  const finLx = (COL_FIN + SLOT_W) * sc
  ctx.save()
  ctx.strokeStyle = 'rgba(212,208,204,0.7)'
  ctx.lineWidth = sc
  ctx.beginPath()
  ctx.moveTo(finRx, rSemiY * sc)
  ctx.lineTo(finLx, rSemiY * sc)
  ctx.stroke()
  ctx.restore()

  // ── draw all match slots ────────────────────────────────────────────────────
  const drawCol = (col: ColCfg) => {
    col.matchIds.forEach((matchId, i) => {
      const m = resolveBracketMatch(state, matchId)
      const homeV = resolveVariant(m.home, m.winner)
      const awayV = resolveVariant(m.away, m.winner)
      drawSlot(ctx, col.colX, slotCenterY(i, col.round, false), m.home, homeV, flagImages, sc)
      drawSlot(ctx, col.colX, slotCenterY(i, col.round, true), m.away, awayV, flagImages, sc)
    })
  }

  leftCols.forEach(drawCol)
  rightCols.forEach(drawCol)

  // final match (centered vertically in full bracket)
  const finalM = resolveBracketMatch(state, columns.finalId)
  const finalMC = matchCenterY(0, 3)
  const finalHomeY = finalMC - (SLOT_H + SLOT_GAP) / 2
  const finalAwayY = finalMC + (SLOT_H + SLOT_GAP) / 2
  const finalHomeV = resolveVariant(finalM.home, finalM.winner)
  const finalAwayV = resolveVariant(finalM.away, finalM.winner)

  // final box border
  const fBoxX = (COL_FIN - 3) * sc
  const fBoxY = (finalMC - SLOT_H - SLOT_GAP / 2 - 5) * sc
  const fBoxW = (SLOT_W + 6) * sc
  const fBoxH = (SLOT_H * 2 + SLOT_GAP + 10) * sc
  ctx.save()
  rrect(ctx, fBoxX, fBoxY, fBoxW, fBoxH, 7 * sc)
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 1.5 * sc
  ctx.stroke()
  ctx.restore()

  drawSlot(ctx, COL_FIN, finalHomeY, finalM.home, finalHomeV, flagImages, sc)
  drawSlot(ctx, COL_FIN, finalAwayY, finalM.away, finalAwayV, flagImages, sc)

  // ── champion section ────────────────────────────────────────────────────────
  const champBoxW = 210
  const champBoxX = CANVAS_W / 2 - champBoxW / 2

  // divider
  ctx.save()
  ctx.strokeStyle = 'rgba(214,211,209,0.6)'
  ctx.lineWidth = sc
  ctx.beginPath()
  ctx.moveTo(MARGIN * sc, (CHAMP_Y0 - 4) * sc)
  ctx.lineTo((CANVAS_W - MARGIN) * sc, (CHAMP_Y0 - 4) * sc)
  ctx.stroke()
  ctx.restore()

  // "Campeón Mundial 2026" label
  ctx.save()
  ctx.fillStyle = '#b5b0ab'
  ctx.font = `900 ${5.5 * sc}px system-ui,-apple-system,sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('CAMPEÓN MUNDIAL 2026', (CANVAS_W / 2) * sc, (CHAMP_Y0 + 7) * sc)
  ctx.restore()

  // champion card
  const cardY = CHAMP_Y0 + 14
  ctx.save()
  rrect(ctx, champBoxX * sc, cardY * sc, champBoxW * sc, (CHAMP_H - 14) * sc, 10 * sc)
  const champGrad = ctx.createLinearGradient(champBoxX * sc, 0, (champBoxX + champBoxW) * sc, 0)
  champGrad.addColorStop(0, '#fffbeb')
  champGrad.addColorStop(1, '#fef3c7')
  ctx.fillStyle = champGrad
  ctx.fill()
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 2 * sc
  ctx.stroke()
  ctx.restore()

  // champion flag (big)
  const champFlagImg = flagImages.get(champion.team.code)
  const cfx = (champBoxX + 8) * sc
  const cfy = (cardY + (CHAMP_H - 14 - 48) / 2) * sc
  const cfw = 72 * sc
  const cfh = 48 * sc
  if (champFlagImg) {
    ctx.save()
    rrect(ctx, cfx, cfy, cfw, cfh, 4 * sc)
    ctx.clip()
    drawImageFit(ctx, champFlagImg, cfx, cfy, cfw, cfh)
    ctx.restore()
  }

  // vertical divider in card
  const dvX = (champBoxX + 8 + 72 + 8) * sc
  ctx.save()
  ctx.strokeStyle = 'rgba(251,191,36,0.45)'
  ctx.lineWidth = sc
  ctx.beginPath()
  ctx.moveTo(dvX, (cardY + 5) * sc)
  ctx.lineTo(dvX, (cardY + CHAMP_H - 19) * sc)
  ctx.stroke()
  ctx.restore()

  // champion code + name
  const textX = champBoxX + 8 + 72 + 16
  const textMaxW = champBoxW - 8 - 72 - 24
  ctx.save()
  ctx.fillStyle = '#92400e'
  ctx.font = `900 ${8.5 * sc}px system-ui,-apple-system,sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(
    champion.team.code,
    textX * sc,
    (cardY + (CHAMP_H - 14) / 2 - 7) * sc,
  )
  ctx.fillStyle = '#78350f'
  ctx.font = `700 ${7 * sc}px system-ui,-apple-system,sans-serif`
  ctx.fillText(
    champion.team.name.toUpperCase(),
    textX * sc,
    (cardY + (CHAMP_H - 14) / 2 + 7) * sc,
    textMaxW * sc,
  )
  ctx.restore()

  // watermark
  ctx.save()
  ctx.fillStyle = '#b5b0ab'
  ctx.font = `900 ${5.5 * sc}px system-ui,-apple-system,sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(
    '@APO.WEBS',
    (CANVAS_W / 2) * sc,
    (CHAMP_Y0 + CHAMP_H + 10) * sc,
  )
  ctx.restore()

  const blob = await canvasToPngBlob(canvas)
  const filename = `bracket-${slugify(champion.team.name)}-nuestromundial.png`
  await savePngBlob(blob, filename, bracketShareMessage(champion.team.name))
}
