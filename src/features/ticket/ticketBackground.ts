import { getTeamColors } from '../../lib/teamVisuals'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '')
  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0] + normalized[0], 16),
      g: parseInt(normalized[1] + normalized[1], 16),
      b: parseInt(normalized[2] + normalized[2], 16),
    }
  }
  if (normalized.length !== 6) return null
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  }
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
}

export function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(255,255,255,${alpha})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

function pickGradientColors(primary: string, secondary: string) {
  let p = primary
  let s = secondary

  if (luminance(p) < 0.12) {
    p = luminance(s) > 0.12 ? s : '#64748b'
  }
  if (luminance(s) > 0.88) {
    s = p
  }
  if (luminance(s) < 0.12) {
    s = p
  }

  return { primary: p, secondary: s }
}

export interface TicketBackgroundTheme {
  base: string
  backgroundImage: string
  ring: string
  accentLine: string
  photoRing: string
  playerBorder: string
  panelBg: string
}

export function getTicketBackgroundTheme(countryCode: string): TicketBackgroundTheme {
  const { primary, secondary } = getTeamColors(countryCode)
  const { primary: p, secondary: s } = pickGradientColors(primary, secondary)

  const base = '#0c0c0e'

  const backgroundImage = [
    `radial-gradient(ellipse 130% 70% at 50% -5%, ${rgba(p, 0.42)} 0%, transparent 58%)`,
    `radial-gradient(ellipse 90% 55% at 0% 62%, ${rgba(s, 0.28)} 0%, transparent 52%)`,
    `radial-gradient(ellipse 85% 50% at 100% 78%, ${rgba(p, 0.22)} 0%, transparent 48%)`,
    `radial-gradient(ellipse 70% 40% at 50% 42%, ${rgba(s, 0.12)} 0%, transparent 55%)`,
    `linear-gradient(180deg, ${rgba(p, 0.08)} 0%, ${base} 38%, #08080a 100%)`,
  ].join(', ')

  return {
    base,
    backgroundImage,
    ring: rgba(p, 0.45),
    accentLine: rgba(p, 0.55),
    photoRing: rgba(s, 0.55),
    playerBorder: rgba(p, 0.35),
    panelBg: rgba(p, 0.08),
  }
}
