import type { Config } from '@imgly/background-removal'

const MAX_FILE_BYTES = 12 * 1024 * 1024
const MAX_EDGE_PX = 1024

const BG_REMOVAL_CONFIG: Config = {
  model: 'isnet_quint8',
  device: 'cpu',
  output: { format: 'image/png', quality: 0.9 },
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

/** Reduce tamaño para evitar crash por memoria en móvil. */
async function resizePhotoForAI(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const longest = Math.max(bitmap.width, bitmap.height)
  const scale = longest > MAX_EDGE_PX ? MAX_EDGE_PX / longest : 1
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
    canvas.toBlob(resolve, 'image/jpeg', 0.9),
  )
  if (!blob) throw new Error('No se pudo comprimir la imagen')
  return blob
}

/** Quita el fondo en el cliente (WASM) y devuelve URL del PNG recortado. */
export async function removeStickerBackground(
  file: File,
  onProgress?: (message: string) => void,
): Promise<string> {
  const validationError = validateStickerPhoto(file)
  if (validationError) throw new Error(validationError)

  onProgress?.('Preparando foto...')
  const resized = await resizePhotoForAI(file)

  onProgress?.('Descargando IA (solo la 1ª vez)...')
  const { removeBackground } = await import('@imgly/background-removal')
  const sourceUrl = URL.createObjectURL(resized)

  try {
    const blob = await removeBackground(sourceUrl, {
      ...BG_REMOVAL_CONFIG,
      progress: (key, current, total) => {
        if (total > 0) {
          const pct = Math.round((current / total) * 100)
          onProgress?.(`IA: ${key} ${pct}%`)
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
  onProgress?.('Cargando IA...')
  const cutoutUrl = await removeStickerBackground(file, onProgress)
  onProgress?.('Listo')
  return cutoutUrl
}
