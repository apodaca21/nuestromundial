import type { Config } from '@imgly/background-removal'

const MAX_FILE_BYTES = 12 * 1024 * 1024

const BG_REMOVAL_CONFIG: Config = {
  model: 'isnet_quint8',
  device: 'cpu',
  output: { format: 'image/png', quality: 0.85 },
}

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return true
  return navigator.maxTouchPoints > 1 && window.innerWidth < 1024
}

function maxEdgeForDevice(): number {
  return isMobileDevice() ? 640 : 1024
}

type RemoveBackgroundFn = (
  image: Parameters<
    Awaited<typeof import('@imgly/background-removal')>['removeBackground']
  >[0],
  config?: Config,
) => Promise<Blob>

let removeBackgroundFn: RemoveBackgroundFn | null = null
let preloadPromise: Promise<void> | null = null

async function getRemoveBackground(): Promise<RemoveBackgroundFn> {
  if (!removeBackgroundFn) {
    const { removeBackground } = await import('@imgly/background-removal')
    removeBackgroundFn = removeBackground
  }
  return removeBackgroundFn
}

/** Descarga el modelo WASM en segundo plano (llamar al abrir Mi Estampa). */
export function preloadStickerBackgroundModel(
  onProgress?: (message: string) => void,
): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = (async () => {
      onProgress?.('Preparando IA en segundo plano...')
      const { preload } = await import('@imgly/background-removal')
      await preload(BG_REMOVAL_CONFIG)
      await getRemoveBackground()
    })().catch((err) => {
      preloadPromise = null
      throw err
    })
  }
  return preloadPromise
}

export function validateStickerPhoto(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Usa una foto JPG, PNG o WebP'
  }
  if (file.size > MAX_FILE_BYTES) {
    return 'La imagen debe pesar menos de 12 MB'
  }
  return null
}

async function resizePhotoForAI(file: File): Promise<Blob> {
  const maxEdge = maxEdgeForDevice()
  const bitmap = await createImageBitmap(file)
  const longest = Math.max(bitmap.width, bitmap.height)
  const scale = longest > maxEdge ? maxEdge / longest : 1
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('No se pudo preparar la imagen')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.82),
  )
  if (!blob) throw new Error('No se pudo comprimir la imagen')
  return blob
}

export async function removeStickerBackground(
  file: File,
  onProgress?: (message: string) => void,
): Promise<string> {
  const validationError = validateStickerPhoto(file)
  if (validationError) throw new Error(validationError)

  await preloadStickerBackgroundModel(onProgress).catch(() => {
    /* si falla preload, removeBackground intentará cargar igual */
  })

  onProgress?.('Preparando foto...')
  const resized = await resizePhotoForAI(file)

  onProgress?.('Quitando fondo...')
  const removeBackground = await getRemoveBackground()
  const sourceUrl = URL.createObjectURL(resized)

  try {
    const blob = await removeBackground(sourceUrl, {
      ...BG_REMOVAL_CONFIG,
      progress: (_key, current, total) => {
        if (total > 0) {
          const pct = Math.round((current / total) * 100)
          onProgress?.(`IA ${pct}%`)
        }
      },
    })
    return URL.createObjectURL(blob)
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

export async function handleImageUpload(
  file: File,
  onProgress?: (message: string) => void,
): Promise<string> {
  const cutoutUrl = await removeStickerBackground(file, onProgress)
  onProgress?.('Listo')
  return cutoutUrl
}
