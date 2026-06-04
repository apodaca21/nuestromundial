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

/** Propiedades visuales que html2canvas necesita sin leer Tailwind (oklch). */
const EXPORT_STYLE_PROPS = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'width',
  'height',
  'max-width',
  'max-height',
  'min-width',
  'min-height',
  'margin',
  'padding',
  'box-sizing',
  'overflow',
  'overflow-x',
  'overflow-y',
  'flex-direction',
  'align-items',
  'justify-content',
  'flex',
  'flex-shrink',
  'flex-grow',
  'gap',
  'transform',
  'transform-origin',
  'opacity',
  'visibility',
  'color',
  'background-color',
  'background-image',
  'background-size',
  'background-position',
  'background-repeat',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'text-shadow',
  'white-space',
  'box-shadow',
  'filter',
  'border',
  'border-radius',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-color',
  'border-width',
  'border-style',
  'object-fit',
  'object-position',
  'aspect-ratio',
] as const

function isSafeCSSValue(value: string): boolean {
  if (!value || value === 'none' || value === 'auto' || value === 'normal') return false
  if (/oklch|oklab|color-mix|lch\(/i.test(value)) return false
  return true
}

function copyExportStyles(source: Element, target: HTMLElement): void {
  const computed = window.getComputedStyle(source)
  for (const prop of EXPORT_STYLE_PROPS) {
    const value = computed.getPropertyValue(prop).trim()
    if (!isSafeCSSValue(value)) continue
    target.style.setProperty(prop, value, computed.getPropertyPriority(prop))
  }
}

function walkElementPairs(
  source: Element,
  clone: Element,
  visit: (sourceEl: Element, cloneEl: HTMLElement) => void,
): void {
  if (clone instanceof HTMLElement) visit(source, clone)
  const sourceChildren = [...source.children]
  const cloneChildren = [...clone.children]
  for (let i = 0; i < sourceChildren.length; i++) {
    const cloneChild = cloneChildren[i]
    if (cloneChild) walkElementPairs(sourceChildren[i], cloneChild, visit)
  }
}

/** html2canvas no soporta oklch (Tailwind v4): quitamos CSS y usamos estilos calculados en rgb. */
function prepareCloneForExport(
  sourceRoot: HTMLElement,
  cloneRoot: HTMLElement,
  doc: Document,
): void {
  doc.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => node.remove())

  cloneRoot.removeAttribute('class')
  cloneRoot.style.containerType = 'normal'

  walkElementPairs(sourceRoot, cloneRoot, (sourceEl, cloneEl) => {
    cloneEl.removeAttribute('class')
    copyExportStyles(sourceEl, cloneEl)
  })
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
      onclone: (doc, clonedElement) => {
        prepareCloneForExport(element, clonedElement, doc)
      },
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
