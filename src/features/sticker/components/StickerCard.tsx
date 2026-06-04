import { forwardRef, useImperativeHandle, useRef } from 'react'
import type { StickerCountry, StickerTextBlockLayout } from '../stickerCountries'
import type { PhotoTransform } from '../photoTransform'
import { clampPhotoTransform } from '../photoTransform'
import {
  STICKER_NAME_FONT_MD,
  STICKER_NAME_FONT_SM,
} from '../stickerLayout'

export interface StickerCardProps {
  country: StickerCountry
  name: string
  photoUrl: string | null
  photoTransform: PhotoTransform
  onPhotoTransformChange?: (next: PhotoTransform) => void
}

function TextOnBar({
  layout,
  children,
  className = '',
}: {
  layout: StickerTextBlockLayout
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`absolute z-20 flex items-center justify-center overflow-hidden text-center ${className}`}
      style={{
        bottom: layout.bottom,
        left: layout.left,
        width: layout.width,
        height: layout.height,
      }}
    >
      <div
        className="w-full px-0.5"
        style={{
          transform: `translate(${layout.nudgeX ?? '0'}, ${layout.nudgeY ?? '0'})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export const StickerCard = forwardRef<HTMLDivElement, StickerCardProps>(
  function StickerCard(
    { country, name, photoUrl, photoTransform, onPhotoTransformChange },
    ref,
  ) {
    const displayName = name.trim() || 'TU NOMBRE'
    const { photo, name: nameLayout, watermarkApo, watermarkDomain } = country
    const cardRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => cardRef.current as HTMLDivElement)

    const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
      null,
    )

    const len = displayName.length
    const nameFontSize =
      len > 22
        ? STICKER_NAME_FONT_SM
        : len > 14
          ? STICKER_NAME_FONT_MD
          : nameLayout.fontSize

    const endDrag = () => {
      dragRef.current = null
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current || !onPhotoTransformChange) return
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const dx = ((e.clientX - dragRef.current.x) / rect.width) * 100
      const dy = ((e.clientY - dragRef.current.y) / rect.height) * 100
      onPhotoTransformChange(
        clampPhotoTransform({
          ...photoTransform,
          offsetX: dragRef.current.ox + dx,
          offsetY: dragRef.current.oy + dy,
        }),
      )
    }

    const onPhotoPointerDown = (e: React.PointerEvent) => {
      if (!photoUrl || !onPhotoTransformChange) return
      e.preventDefault()
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        ox: photoTransform.offsetX,
        oy: photoTransform.offsetY,
      }
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', endDrag)
      window.addEventListener('pointercancel', endDrag)
    }

    return (
      <div
        ref={cardRef}
        className="@container relative mx-auto w-full max-w-[min(100%,320px)] overflow-hidden bg-white shadow-[0_6px_28px_rgba(0,0,0,0.22)] sm:max-w-[300px]"
        style={{ aspectRatio: '2.5 / 3.5', containerType: 'inline-size' }}
      >
        <img
          src={country.templateSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        <div
          className="absolute z-10 overflow-visible"
          style={{
            top: photo.top,
            right: photo.right,
            bottom: photo.bottom,
            left: photo.left,
          }}
        >
          {photoUrl ? (
            <div
              className={`flex h-full w-full items-end justify-center ${
                onPhotoTransformChange
                  ? 'cursor-grab touch-none active:cursor-grabbing'
                  : ''
              }`}
              style={{
                transform: `translate(${photoTransform.offsetX}%, ${photoTransform.offsetY}%) scale(${photoTransform.scale})`,
                transformOrigin: '50% 100%',
              }}
              onPointerDown={onPhotoPointerDown}
            >
              <img
                src={photoUrl}
                alt=""
                className="max-h-full w-auto max-w-full select-none object-contain object-bottom drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]"
                draggable={false}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-white/30 bg-black/10">
              <p className="px-2 text-center text-[9px] font-bold uppercase tracking-wide text-white/60">
                Sube tu foto
              </p>
            </div>
          )}
        </div>

        {/* Nombre — solo barra superior de la plantilla */}
        <TextOnBar layout={nameLayout}>
          <p
            className="w-full text-center font-display font-black uppercase leading-[0.9] tracking-[0.03em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{
              fontSize: nameFontSize,
              color: nameLayout.color,
            }}
          >
            {displayName}
          </p>
        </TextOnBar>

        {/* @apo.webs — franja entre barras */}
        <TextOnBar layout={watermarkApo} className="z-[21]">
          <p
            className="w-full text-center font-bold uppercase leading-none tracking-[0.12em]"
            style={{
              fontSize: watermarkApo.fontSize,
              color: watermarkApo.color,
              textShadow:
                '0 1px 2px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.5)',
            }}
          >
            @apo.webs
          </p>
        </TextOnBar>

        {/* nuestromundial.com — barra inferior */}
        <TextOnBar layout={watermarkDomain} className="z-[21]">
          <p
            className="w-full text-center font-bold uppercase leading-none tracking-[0.06em]"
            style={{
              fontSize: watermarkDomain.fontSize,
              color: watermarkDomain.color,
              textShadow:
                '0 1px 2px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.5)',
            }}
          >
            nuestromundial.com
          </p>
        </TextOnBar>
      </div>
    )
  },
)
