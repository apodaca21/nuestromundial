export interface PhotoTransform {
  offsetX: number
  offsetY: number
  scale: number
}

export const DEFAULT_PHOTO_TRANSFORM: PhotoTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
}

export function clampPhotoTransform(t: PhotoTransform): PhotoTransform {
  return {
    offsetX: Math.min(50, Math.max(-50, t.offsetX)),
    offsetY: Math.min(40, Math.max(-40, t.offsetY)),
    scale: Math.min(2.2, Math.max(0.55, t.scale)),
  }
}
