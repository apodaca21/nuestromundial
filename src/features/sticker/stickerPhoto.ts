import type { Config } from '@imgly/background-removal'

const MAX_FILE_BYTES = 12 * 1024 * 1024

export interface StickerPhotoProgress {
  percent: number
  label: string
}

type ProgressFn = (progress: StickerPhotoProgress) => void

let removeBackgroundFn: RemoveBackgroundFn | null = null
let preloadPromise: Promise<void> | null = null
let backgroundModelReady = false

type RemoveBackgroundFn = (
  image: Parameters<
    Awaited<typeof import('@imgly/background-removal')>['removeBackground']
  >[0],
  config?: Config,
) => Promise<Blob>

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return true
  return navigator.maxTouchPoints > 1 && window.innerWidth < 1024
}

function maxEdgeForDevice(): number {
  return isMobileDevice() ? 480 : 768
}

function mapPhaseProgress(
  start: number,
  end: number,
  current: number,
  total: number,
): number {
  if (total <= 0) return start
  return Math.round(start + (current / total) * (end - start))
}

function report(onProgress: ProgressFn | undefined, percent: number, label: string): void {
  onProgress?.({
    percent: Math.min(100, Math.max(0, percent)),
    label,
  })
}

async function pickDevice(): Promise<'cpu' | 'gpu'> {
  if (isMobileDevice()) return 'cpu'
  if (!('gpu' in navigator)) return 'cpu'
  try {
    const gpu = (navigator as Navigator & { gpu: GPU }).gpu
    const adapter = await gpu.requestAdapter()
    return adapter ? 'gpu' : 'cpu'
  } catch {
    return 'cpu'
  }
}

async function buildBgRemovalConfig(
  onDownloadProgress?: (key: string, current: number, total: number) => void,
): Promise<Config> {
  const device = await pickDevice()
  return {
    model: 'isnet_quint8',
    device,
    output: { format: 'image/png', quality: 0.82 },
    progress: onDownloadProgress,
  }
}

async function getRemoveBackground(): Promise<RemoveBackgroundFn> {
  if (!removeBackgroundFn) {
    const { removeBackground } = await import('@imgly/background-removal')
    removeBackgroundFn = removeBackground
  }
  return removeBackgroundFn
}

export function isStickerBackgroundModelReady(): boolean {
  return backgroundModelReady
}

/** Descarga el modelo WASM en segundo plano (llamar al abrir Mi Estampa). */
export function preloadStickerBackgroundModel(
  onProgress?: ProgressFn,
): Promise<void> {
  if (backgroundModelReady) {
    report(onProgress, 100, 'IA lista')
    return Promise.resolve()
  }

  if (!preloadPromise) {
    preloadPromise = (async () => {
      report(onProgress, 2, 'Descargando IA…')
      const config = await buildBgRemovalConfig((_key, current, total) => {
        if (total > 0) {
          report(
            onProgress,
            mapPhaseProgress(2, 18, current, total),
            'Descargando IA…',
          )
        }
      })
      const { preload } = await import('@imgly/background-removal')
      await preload(config)
      await getRemoveBackground()
      backgroundModelReady = true
      report(onProgress, 100, 'IA lista')
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

async function resizePhotoForAI(
  file: File,
  onProgress?: ProgressFn,
): Promise<Blob> {
  report(onProgress, 20, 'Preparando foto…')
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

  report(onProgress, 24, 'Optimizando imagen…')
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.75),
  )
  if (!blob) throw new Error('No se pudo comprimir la imagen')
  return blob
}

export async function prepareStickerPhotoFull(
  file: File,
  onProgress?: ProgressFn,
): Promise<string> {
  const validationError = validateStickerPhoto(file)
  if (validationError) throw new Error(validationError)

  report(onProgress, 1, 'Iniciando…')
  const resized = await resizePhotoForAI(file, onProgress)
  report(onProgress, 100, '¡Listo!')
  return URL.createObjectURL(resized)
}

export async function removeStickerBackground(
  file: File,
  onProgress?: ProgressFn,
): Promise<string> {
  const validationError = validateStickerPhoto(file)
  if (validationError) throw new Error(validationError)

  report(onProgress, 1, 'Iniciando…')

  if (!backgroundModelReady) {
    await preloadStickerBackgroundModel(onProgress).catch(() => {
      /* removeBackground intentará cargar igual */
    })
  } else {
    report(onProgress, 19, 'Preparando foto…')
  }

  const resized = await resizePhotoForAI(file, onProgress)

  report(onProgress, 28, 'Quitando fondo…')
  const removeBackground = await getRemoveBackground()
  const config = await buildBgRemovalConfig()
  const sourceUrl = URL.createObjectURL(resized)

  try {
    const blob = await removeBackground(sourceUrl, {
      ...config,
      progress: (_key, current, total) => {
        if (total > 0) {
          const pct = mapPhaseProgress(28, 97, current, total)
          report(onProgress, pct, `Quitando fondo… ${pct}%`)
        }
      },
    })
    report(onProgress, 100, '¡Listo!')
    return URL.createObjectURL(blob)
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

export async function handleImageUpload(
  file: File,
  onProgress?: ProgressFn,
  options?: { removeBackground?: boolean },
): Promise<string> {
  if (options?.removeBackground === false) {
    return prepareStickerPhotoFull(file, onProgress)
  }
  return removeStickerBackground(file, onProgress)
}
