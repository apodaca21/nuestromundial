import {
  STICKER_NAME_BAR,
  STICKER_WM_APO_BAR,
  STICKER_WM_DOMAIN_BAR,
} from './stickerLayout'

export type StickerCountryId =
  | 'mex'
  | 'bra'
  | 'arg'
  | 'esp'
  | 'deu'
  | 'eng'
  | 'fra'
  | 'por'
  | 'usa'

/** Recorte de la foto del jugador (% del lienzo) */
export interface StickerPhotoLayout {
  top: string
  right: string
  bottom: string
  left: string
}

/** Bloque de texto sobre las barras de la plantilla Panini */
export interface StickerTextBlockLayout {
  bottom: string
  left: string
  width: string
  height: string
  fontSize: string
  color: string
  nudgeX?: string
  nudgeY?: string
}

export interface StickerCountry {
  id: StickerCountryId
  label: string
  flag: string
  code: string
  templateSrc: string
  photo: StickerPhotoLayout
  name: StickerTextBlockLayout
  watermarkApo: StickerTextBlockLayout
  watermarkDomain: StickerTextBlockLayout
}

export const STICKER_COUNTRIES: StickerCountry[] = [
  {
    id: 'mex',
    label: 'México',
    flag: '🇲🇽',
    code: 'MEX',
    templateSrc: '/estampas/mexico.jpeg',
    photo: { top: '11%', right: '20%', bottom: '24%', left: '6%' },
    name: { ...STICKER_NAME_BAR },
    watermarkApo: { ...STICKER_WM_APO_BAR },
    watermarkDomain: { ...STICKER_WM_DOMAIN_BAR },
  },
  {
    id: 'bra',
    label: 'Brasil',
    flag: '🇧🇷',
    code: 'BRA',
    templateSrc: '/estampas/brazil.jpg',
    photo: { top: '10%', right: '22%', bottom: '25%', left: '5%' },
    name: { ...STICKER_NAME_BAR, width: '58%' },
    watermarkApo: { ...STICKER_WM_APO_BAR, width: '54%' },
    watermarkDomain: { ...STICKER_WM_DOMAIN_BAR, width: '54%' },
  },
  {
    id: 'arg',
    label: 'Argentina',
    flag: '🇦🇷',
    code: 'ARG',
    templateSrc: '/estampas/argentina.jpg',
    photo: { top: '10%', right: '24%', bottom: '26%', left: '4%' },
    name: { ...STICKER_NAME_BAR, width: '56%', left: '4.5%' },
    watermarkApo: { ...STICKER_WM_APO_BAR, width: '52%', left: '5.5%' },
    watermarkDomain: { ...STICKER_WM_DOMAIN_BAR, width: '52%', left: '5.5%' },
  },
  {
    id: 'esp',
    label: 'España',
    flag: '🇪🇸',
    code: 'ESP',
    templateSrc: '/estampas/espana.jpg',
    photo: { top: '10%', right: '22%', bottom: '25%', left: '5%' },
    name: { ...STICKER_NAME_BAR, width: '58%' },
    watermarkApo: { ...STICKER_WM_APO_BAR, width: '54%' },
    watermarkDomain: { ...STICKER_WM_DOMAIN_BAR, width: '54%' },
  },
  {
    id: 'deu',
    label: 'Alemania',
    flag: '🇩🇪',
    code: 'DEU',
    templateSrc: '/estampas/alemania.jpg',
    photo: { top: '10%', right: '22%', bottom: '25%', left: '5%' },
    name: { ...STICKER_NAME_BAR, width: '58%' },
    watermarkApo: { ...STICKER_WM_APO_BAR, width: '54%' },
    watermarkDomain: { ...STICKER_WM_DOMAIN_BAR, width: '54%' },
  },
  {
    id: 'eng',
    label: 'Inglaterra',
    flag: 'ENG',
    code: 'ENG',
    templateSrc: '/estampas/inglaterra.jpg',
    photo: { top: '10%', right: '22%', bottom: '25%', left: '5%' },
    name: { ...STICKER_NAME_BAR, width: '58%' },
    watermarkApo: { ...STICKER_WM_APO_BAR, width: '54%' },
    watermarkDomain: { ...STICKER_WM_DOMAIN_BAR, width: '54%' },
  },
  {
    id: 'fra',
    label: 'Francia',
    flag: '🇫🇷',
    code: 'FRA',
    templateSrc: '/estampas/francia.jpg',
    photo: { top: '10%', right: '22%', bottom: '25%', left: '5%' },
    name: { ...STICKER_NAME_BAR, width: '58%' },
    watermarkApo: { ...STICKER_WM_APO_BAR, width: '54%' },
    watermarkDomain: { ...STICKER_WM_DOMAIN_BAR, width: '54%' },
  },
  {
    id: 'por',
    label: 'Portugal',
    flag: '🇵🇹',
    code: 'POR',
    templateSrc: '/estampas/portugal.jpg',
    photo: { top: '10%', right: '22%', bottom: '25%', left: '5%' },
    name: { ...STICKER_NAME_BAR, width: '58%' },
    watermarkApo: { ...STICKER_WM_APO_BAR, width: '54%' },
    watermarkDomain: { ...STICKER_WM_DOMAIN_BAR, width: '54%' },
  },
  {
    id: 'usa',
    label: 'Estados Unidos',
    flag: '🇺🇸',
    code: 'USA',
    templateSrc: '/estampas/usa.jpg',
    photo: { top: '10%', right: '22%', bottom: '25%', left: '5%' },
    name: { ...STICKER_NAME_BAR, width: '58%' },
    watermarkApo: { ...STICKER_WM_APO_BAR, width: '54%' },
    watermarkDomain: { ...STICKER_WM_DOMAIN_BAR, width: '54%' },
  },
]

export function getStickerCountry(id: StickerCountryId): StickerCountry {
  return STICKER_COUNTRIES.find((c) => c.id === id) ?? STICKER_COUNTRIES[0]
}
