import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, Download, Images, Loader2, Sparkles } from 'lucide-react'
import { ApoWatermark } from '../../components/ApoWatermark'
import { pageX } from '../../lib/layout'
import { CountryFlagBadge } from './components/CountryFlagBadge'
import { PhotoAdjustControls } from './components/PhotoAdjustControls'
import { StickerCard } from './components/StickerCard'
import { downloadStickerCard } from './exportSticker'
import {
  clampPhotoTransform,
  DEFAULT_PHOTO_TRANSFORM,
  type PhotoTransform,
} from './photoTransform'
import {
  getStickerCountry,
  STICKER_COUNTRIES,
  type StickerCountryId,
} from './stickerCountries'
import { handleImageUpload, preloadStickerBackgroundModel } from './stickerPhoto'

export function StickerGenerator() {
  const cardRef = useRef<HTMLDivElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [modelReady, setModelReady] = useState(false)

  const [countryId, setCountryId] = useState<StickerCountryId>('mex')
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoTransform, setPhotoTransform] =
    useState<PhotoTransform>(DEFAULT_PHOTO_TRANSFORM)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingLabel, setProcessingLabel] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const country = getStickerCountry(countryId)

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  useEffect(() => {
    let cancelled = false
    preloadStickerBackgroundModel()
      .then(() => {
        if (!cancelled) setModelReady(true)
      })
      .catch(() => {
        if (!cancelled) setModelReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const onPhotoSelected = useCallback(async (file: File | undefined) => {
    if (!file) return
    setUploadError(null)
    setIsProcessing(true)
    setProcessingLabel('Cargando IA...')

    try {
      const cutout = await handleImageUpload(file, setProcessingLabel)
      setPhotoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return cutout
      })
      setPhotoTransform(DEFAULT_PHOTO_TRANSFORM)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No se pudo procesar la foto. Prueba otra imagen o usa Wi‑Fi.'
      setUploadError(msg)
      console.error('[StickerGenerator] removeBackground', err)
    } finally {
      setIsProcessing(false)
      setProcessingLabel('')
      if (galleryInputRef.current) galleryInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }, [])

  const handleDownload = async () => {
    const el = cardRef.current
    if (!el) return
    if (!photoUrl) {
      setExportError('Sube una foto antes de descargar')
      return
    }

    setExportError(null)
    setIsExporting(true)
    try {
      const slug = name.trim().replace(/\s+/g, '-').toLowerCase() || 'fan'
      await downloadStickerCard(el, `estampa-${slug}-nuestromundial.png`)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No se pudo generar la imagen. Intenta de nuevo.'
      setExportError(msg)
      console.error('[StickerGenerator] download', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <ApoWatermark />

      <div className={`${pageX} py-3 pb-6 sm:py-5`}>
        <header className="mb-4 text-center sm:mb-6">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#6b00ff]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#6b00ff]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Fase 2
          </div>
          <h1 className="font-display text-3xl tracking-wide text-stone-900 sm:text-4xl">
            MI ESTAMPA
          </h1>
          <p className="mt-1 px-2 text-sm text-stone-500">
            Tu Estampa Panini 2026 con plantilla oficial
          </p>
        </header>

        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm sm:p-5">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-stone-500">
                Selecciona plantilla
              </p>
              <div className="-mx-0.5 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-7 sm:gap-2 sm:overflow-visible sm:pb-0">
                {STICKER_COUNTRIES.map((c) => {
                  const active = countryId === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCountryId(c.id)}
                      className={`flex w-[3.4rem] shrink-0 snap-start flex-col items-center gap-0.5 rounded-xl border-2 px-1 py-2 transition-all active:scale-95 sm:w-auto ${
                        active
                          ? 'border-[#6b00ff] bg-[#6b00ff]/8 shadow-md shadow-[#6b00ff]/15'
                          : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                      }`}
                      aria-pressed={active}
                    >
                      <CountryFlagBadge countryId={c.id} className="h-6 w-8" />
                      <span
                        className={`text-[8px] font-black uppercase leading-tight ${
                          active ? 'text-[#6b00ff]' : 'text-stone-500'
                        }`}
                      >
                        {c.code}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                Nombre
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre en la Estampa"
                maxLength={28}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-bold text-stone-900 outline-none transition focus:border-[#6b00ff]/40 focus:ring-2 focus:ring-[#6b00ff]/20"
              />
            </label>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                Tu foto
              </span>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
                className="sr-only"
                disabled={isProcessing}
                onChange={(e) => onPhotoSelected(e.target.files?.[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                disabled={isProcessing}
                onChange={(e) => onPhotoSelected(e.target.files?.[0])}
              />
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#6b00ff]/35 bg-[#6b00ff]/5 px-2 py-2.5 text-[11px] font-black uppercase tracking-wide text-[#6b00ff] transition active:scale-[0.98] disabled:opacity-60"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  ) : (
                    <Images className="h-5 w-5" aria-hidden />
                  )}
                  Galería
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl border-2 border-stone-200 bg-stone-50 px-2 py-2.5 text-[11px] font-black uppercase tracking-wide text-stone-600 transition active:scale-[0.98] disabled:opacity-60"
                >
                  <Camera className="h-5 w-5" aria-hidden />
                  Cámara
                </button>
              </div>
              {isProcessing ? (
                <p className="mt-2 text-center text-xs font-bold text-[#6b00ff]">
                  {processingLabel || 'Procesando...'}
                </p>
              ) : null}
              {uploadError ? (
                <p className="mt-2 text-center text-xs font-bold text-red-600">
                  {uploadError}
                </p>
              ) : null}
              <p className="mt-2 text-center text-[10px] leading-snug text-stone-400">
                {modelReady
                  ? 'IA lista. En iPhone usa Galería; el fondo se quita en tu teléfono.'
                  : 'La 1ª vez descarga la IA (~40 MB, Wi‑Fi). Luego es más rápido.'}
              </p>
            </div>

            {photoUrl ? (
              <PhotoAdjustControls
                value={photoTransform}
                onChange={(next) =>
                  setPhotoTransform(clampPhotoTransform(next))
                }
                onReset={() => setPhotoTransform(DEFAULT_PHOTO_TRANSFORM)}
              />
            ) : null}
          </section>

          <section className="flex w-full flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none lg:sticky lg:top-4">
            <p className="w-full text-center text-[10px] font-black uppercase tracking-widest text-stone-500 sm:text-left lg:text-center">
              Vista previa
            </p>
            <div className="flex w-full justify-center">
              <StickerCard
                ref={cardRef}
                country={country}
                name={name}
                photoUrl={photoUrl}
                photoTransform={photoTransform}
                onPhotoTransformChange={(next) =>
                  setPhotoTransform(clampPhotoTransform(next))
                }
              />
            </div>

            <button
              type="button"
              disabled={isExporting || isProcessing || !photoUrl}
              onClick={handleDownload}
              className="flex min-h-14 w-full max-w-none items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 text-sm font-black uppercase tracking-wide text-amber-950 shadow-lg shadow-amber-500/35 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-[300px] sm:px-6 sm:text-base"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Generando PNG...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" aria-hidden />
                  Descargar mi Estampa
                </>
              )}
            </button>
            <p className="max-w-[300px] text-center text-[10px] leading-snug text-stone-400">
              En iPhone usa «Compartir» → «Guardar imagen» si no se descarga solo.
            </p>
            {exportError ? (
              <p className="text-center text-xs font-bold text-red-600">
                {exportError}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
