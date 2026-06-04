import html2canvas from 'html2canvas'

async function urlToDataUrl(src: string): Promise<string> {
  if (src.startsWith('data:')) return src

  const response = await fetch(src)
  if (!response.ok) throw new Error(`No se pudo cargar imagen: ${src}`)

  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Error leyendo imagen'))
    reader.readAsDataURL(blob)
  })
}

/** Convierte imágenes a data URL para exportar sin canvas contaminado. */
async function inlineImages(root: HTMLElement): Promise<() => void> {
  const images = [...root.querySelectorAll('img')]
  const restores: Array<() => void> = []

  await Promise.all(
    images.map(async (img) => {
      const original = img.src
      if (!original) return
      try {
        const dataUrl = await urlToDataUrl(original)
        img.src = dataUrl
        restores.push(() => {
          img.src = original
        })
      } catch (err) {
        console.warn('[exportSticker] imagen omitida', original, err)
      }
    }),
  )

  return () => restores.forEach((fn) => fn())
}

function waitForImages(element: HTMLElement): Promise<void> {
  const images = [...element.querySelectorAll('img')]
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
    ),
  ).then(() => undefined)
}

function exportScale(): number {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  return isMobile ? 2 : Math.min(3, window.devicePixelRatio || 2)
}

async function savePngBlob(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: 'image/png' })

  if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
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
  await waitForImages(element)
  const restoreImages = await inlineImages(element)

  try {
    const canvas = await html2canvas(element, {
      scale: exportScale(),
      useCORS: false,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
    })

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('No se pudo crear el PNG'))),
        'image/png',
        1,
      )
    })

    await savePngBlob(blob, filename)
  } finally {
    restoreImages()
  }
}
