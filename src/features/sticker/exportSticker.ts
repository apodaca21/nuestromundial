async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar una imagen de la estampa'))
    img.src = src
  })
}

function exportScale(): number {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  return isMobile ? 2 : Math.min(2.5, window.devicePixelRatio || 2)
}

function relativeRect(el: Element, root: DOMRect, scale: number) {
  const r = el.getBoundingClientRect()
  return {
    x: (r.left - root.left) * scale,
    y: (r.top - root.top) * scale,
    w: r.width * scale,
    h: r.height * scale,
  }
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ir = img.naturalWidth / img.naturalHeight
  const dr = w / h
  let sx = 0
  let sy = 0
  let sw = img.naturalWidth
  let sh = img.naturalHeight

  if (ir > dr) {
    sw = img.naturalHeight * dr
    sx = (img.naturalWidth - sw) / 2
  } else {
    sh = img.naturalWidth / dr
    sy = (img.naturalHeight - sh) / 2
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

function safeColor(cssColor: string, fallback: string): string {
  if (!cssColor || /oklch|oklab|color-mix|lch\(/i.test(cssColor)) return fallback
  return cssColor
}

function drawDomText(
  ctx: CanvasRenderingContext2D,
  el: HTMLElement,
  cardRect: DOMRect,
  scale: number,
) {
  const text = el.textContent?.trim()
  if (!text) return

  const r = el.getBoundingClientRect()
  const cs = window.getComputedStyle(el)
  const fontSize = parseFloat(cs.fontSize)
  if (!fontSize) return

  ctx.save()
  ctx.font = `${cs.fontWeight} ${fontSize * scale}px ${cs.fontFamily}`
  ctx.fillStyle = safeColor(cs.color, '#ffffff')
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (cs.textShadow && cs.textShadow !== 'none') {
    ctx.shadowColor = 'rgba(0,0,0,0.85)'
    ctx.shadowBlur = 4 * scale
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2 * scale
  }

  const x = (r.left - cardRect.left + r.width / 2) * scale
  const y = (r.top - cardRect.top + r.height / 2) * scale
  ctx.fillText(text, x, y)
  ctx.restore()
}

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png', 1)
  })
  if (blob) return blob

  try {
    const dataUrl = canvas.toDataURL('image/png')
    const base64 = dataUrl.split(',')[1]
    if (!base64) throw new Error('PNG vacío')
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new Blob([bytes], { type: 'image/png' })
  } catch {
    throw new Error('No se pudo crear el PNG')
  }
}

async function savePngBlob(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: 'image/png' })
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (
    isIOS &&
    typeof navigator.share === 'function' &&
    navigator.canShare?.({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: 'Mi estampa — Nuestro Mundial',
      })
      return
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

export async function downloadStickerCard(
  element: HTMLElement,
  filename = 'mi-estampa-nuestromundial.png',
): Promise<void> {
  const cardRect = element.getBoundingClientRect()
  if (cardRect.width < 2 || cardRect.height < 2) {
    throw new Error('La vista previa no está visible. Espera a que cargue.')
  }

  const templateEl = element.querySelector<HTMLImageElement>('[data-sticker-template]')
  const photoEl = element.querySelector<HTMLImageElement>('[data-sticker-photo]')
  if (!templateEl?.src) throw new Error('Falta la plantilla')
  if (!photoEl?.src) throw new Error('Sube una foto antes de descargar')

  await document.fonts.ready

  const scale = exportScale()
  const w = Math.max(1, Math.round(cardRect.width * scale))
  const h = Math.max(1, Math.round(cardRect.height * scale))

  const [template, photo] = await Promise.all([
    loadImage(templateEl.src),
    loadImage(photoEl.src),
  ])

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo preparar la exportación')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  drawImageCover(ctx, template, 0, 0, w, h)

  const photoRect = relativeRect(photoEl, cardRect, scale)
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 14 * scale
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 6 * scale
  ctx.drawImage(photo, photoRect.x, photoRect.y, photoRect.w, photoRect.h)
  ctx.restore()

  element.querySelectorAll<HTMLElement>('[data-sticker-text]').forEach((el) => {
    drawDomText(ctx, el, cardRect, scale)
  })

  const pngBlob = await canvasToPngBlob(canvas)
  await savePngBlob(pngBlob, filename)
}
