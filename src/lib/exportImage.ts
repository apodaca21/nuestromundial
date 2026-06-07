export function exportPixelRatio(): number {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  return isMobile ? 2 : Math.min(2.5, window.devicePixelRatio || 2)
}

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
  try {
    const response = await fetch(src, { mode: 'cors', credentials: 'omit' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return blobToDataUrl(await response.blob())
  } catch {
    return loadCrossOriginImageAsDataUrl(src)
  }
}

/** Convierte imágenes externas a data URL para que html-to-image las incluya en el PNG. */
export async function inlineImagesForExport(root: HTMLElement): Promise<() => void> {
  const restores: Array<{
    img: HTMLImageElement
    src: string
    crossOrigin: string | null
  }> = []

  await Promise.all(
    Array.from(root.querySelectorAll('img')).map(async (img) => {
      const original = img.currentSrc || img.src
      if (!original || original.startsWith('data:')) return

      try {
        const dataUrl = await imageSrcToDataUrl(original)
        restores.push({
          img,
          src: original,
          crossOrigin: img.getAttribute('crossorigin'),
        })
        img.src = dataUrl
        img.removeAttribute('crossorigin')
        await img.decode().catch(() => undefined)
      } catch {
        // TeamFlag muestra fallback con código ISO si falla la carga
      }
    }),
  )

  return () => {
    for (const entry of restores) {
      entry.img.src = entry.src
      if (entry.crossOrigin) entry.img.setAttribute('crossorigin', entry.crossOrigin)
      else entry.img.removeAttribute('crossorigin')
    }
  }
}
