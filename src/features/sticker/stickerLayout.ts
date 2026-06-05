/** Tipografía escalada al ancho de la tarjeta (usa container-type en StickerCard) */
export const STICKER_NAME_FONT = 'clamp(15px, 6.85cqw, 22px)'
export const STICKER_NAME_FONT_MD = 'clamp(13px, 6.1cqw, 19px)'
export const STICKER_NAME_FONT_SM = 'clamp(12px, 5.25cqw, 17px)'

export const STICKER_WM_FONT = 'clamp(8px, 3.2cqw, 11px)'

/** Sombra dura sin blur, como en estampas Panini originales */
export const STICKER_NAME_TEXT_SHADOW = '1px 2px 0 rgba(0,0,0,0.75)'

/** Barra superior: nombre del jugador */
export const STICKER_NAME_BAR = {
  bottom: '7%',
  left: '4%',
  width: '61%',
  height: '10%',
  fontSize: STICKER_NAME_FONT,
  color: '#ffffff',
  nudgeX: '3ch',
  nudgeY: '0px',
} as const

/** @apo.webs — entre las dos barras rojas de la plantilla */
export const STICKER_WM_APO_BAR = {
  bottom: '5.2%',
  left: '5%',
  width: '57%',
  height: '3%',
  fontSize: STICKER_WM_FONT,
  color: 'rgba(255,255,255,0.95)',
} as const

/** nuestromundial.com — barra inferior delgada */
export const STICKER_WM_DOMAIN_BAR = {
  bottom: '1.2%',
  left: '5%',
  width: '57%',
  height: '3.6%',
  fontSize: STICKER_WM_FONT,
  color: 'rgba(255,255,255,0.95)',
} as const

/** @deprecated usar STICKER_WM_APO_BAR + STICKER_WM_DOMAIN_BAR */
export const STICKER_WM_BAR = STICKER_WM_APO_BAR
