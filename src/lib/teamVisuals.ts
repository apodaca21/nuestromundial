/** ISO 3166-1 alpha-2 para imágenes en flagcdn.com */
export const TEAM_FLAG_ISO: Record<string, string> = {
  MEX: 'mx',
  RSA: 'za',
  KOR: 'kr',
  CZE: 'cz',
  CAN: 'ca',
  BIH: 'ba',
  QAT: 'qa',
  SUI: 'ch',
  HAI: 'ht',
  SCO: 'gb-sct',
  BRA: 'br',
  MAR: 'ma',
  AUS: 'au',
  TUR: 'tr',
  USA: 'us',
  PAR: 'py',
  CIV: 'ci',
  ECU: 'ec',
  GER: 'de',
  CUW: 'cw',
  NED: 'nl',
  JPN: 'jp',
  SWE: 'se',
  TUN: 'tn',
  KSA: 'sa',
  URU: 'uy',
  ESP: 'es',
  CPV: 'cv',
  IRN: 'ir',
  NZL: 'nz',
  BEL: 'be',
  EGY: 'eg',
  FRA: 'fr',
  SEN: 'sn',
  IRQ: 'iq',
  NOR: 'no',
  ARG: 'ar',
  ALG: 'dz',
  AUT: 'at',
  JOR: 'jo',
  GHA: 'gh',
  PAN: 'pa',
  ENG: 'gb-eng',
  CRO: 'hr',
  POR: 'pt',
  COD: 'cd',
  UZB: 'uz',
  COL: 'co',
  POL: 'pl',
  WAL: 'gb-wls',
}

/** Colores representativos de cada selección */
export const TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {
  MEX: { primary: '#006847', secondary: '#CE1126' },
  RSA: { primary: '#007749', secondary: '#FFB81C' },
  KOR: { primary: '#CD2E3A', secondary: '#0047A0' },
  CZE: { primary: '#11457E', secondary: '#D7141A' },
  CAN: { primary: '#FF0000', secondary: '#FFFFFF' },
  BIH: { primary: '#002395', secondary: '#FECB00' },
  QAT: { primary: '#8D1B3D', secondary: '#FFFFFF' },
  SUI: { primary: '#FF0000', secondary: '#FFFFFF' },
  HAI: { primary: '#00209F', secondary: '#D21034' },
  SCO: { primary: '#005EB8', secondary: '#FFFFFF' },
  BRA: { primary: '#009C3B', secondary: '#FFDF00' },
  MAR: { primary: '#C1272D', secondary: '#006233' },
  AUS: { primary: '#00008B', secondary: '#FF0000' },
  TUR: { primary: '#E30A17', secondary: '#FFFFFF' },
  USA: { primary: '#3C3B6E', secondary: '#B22234' },
  PAR: { primary: '#D52B1E', secondary: '#0038A8' },
  CIV: { primary: '#F77F00', secondary: '#009E60' },
  ECU: { primary: '#FFD100', secondary: '#034EA2' },
  GER: { primary: '#000000', secondary: '#DD0000' },
  CUW: { primary: '#002B7F', secondary: '#F9E814' },
  NED: { primary: '#FF6600', secondary: '#21468B' },
  JPN: { primary: '#BC002D', secondary: '#FFFFFF' },
  SWE: { primary: '#006AA7', secondary: '#FECC00' },
  TUN: { primary: '#E70013', secondary: '#FFFFFF' },
  KSA: { primary: '#006C35', secondary: '#FFFFFF' },
  URU: { primary: '#0038A8', secondary: '#FFFFFF' },
  ESP: { primary: '#AA151B', secondary: '#F1BF00' },
  CPV: { primary: '#003893', secondary: '#CF2027' },
  IRN: { primary: '#239F40', secondary: '#FFFFFF' },
  NZL: { primary: '#00247D', secondary: '#CC142B' },
  BEL: { primary: '#EF3340', secondary: '#FAE042' },
  EGY: { primary: '#CE1126', secondary: '#000000' },
  FRA: { primary: '#0055A4', secondary: '#EF4135' },
  SEN: { primary: '#00853F', secondary: '#FDEF42' },
  IRQ: { primary: '#CE1126', secondary: '#000000' },
  NOR: { primary: '#BA0C2F', secondary: '#00205B' },
  ARG: { primary: '#74ACDF', secondary: '#FFFFFF' },
  ALG: { primary: '#006233', secondary: '#D21034' },
  AUT: { primary: '#ED2939', secondary: '#FFFFFF' },
  JOR: { primary: '#007A3D', secondary: '#CE1126' },
  GHA: { primary: '#EF3340', secondary: '#FCD116' },
  PAN: { primary: '#005293', secondary: '#D21034' },
  ENG: { primary: '#CE1126', secondary: '#FFFFFF' },
  CRO: { primary: '#171796', secondary: '#FF0000' },
  POR: { primary: '#006600', secondary: '#FF0000' },
  COD: { primary: '#007FFF', secondary: '#F7D618' },
  UZB: { primary: '#1EB53A', secondary: '#0099B5' },
  COL: { primary: '#FCD116', secondary: '#003893' },
  POL: { primary: '#DC143C', secondary: '#FFFFFF' },
  WAL: { primary: '#00AB39', secondary: '#FFFFFF' },
}

const DEFAULT_COLORS = { primary: '#6b00ff', secondary: '#ff004d' }

/** flagcdn.com solo sirve ciertos anchos (w56, w120, etc. responden 404). */
const FLAGCDN_WIDTHS = [20, 40, 80, 160, 320, 640, 1280, 2560] as const

function snapFlagCdnWidth(requested: number): number {
  const match = FLAGCDN_WIDTHS.find((width) => width >= requested)
  return match ?? FLAGCDN_WIDTHS[FLAGCDN_WIDTHS.length - 1]
}

export function getFlagUrl(teamCode: string, width = 80): string {
  const iso = TEAM_FLAG_ISO[teamCode] ?? teamCode.slice(0, 2).toLowerCase()
  const w = snapFlagCdnWidth(width)
  return `https://flagcdn.com/w${w}/${iso}.png`
}

export function getTeamColors(teamCode: string) {
  return TEAM_COLORS[teamCode] ?? DEFAULT_COLORS
}
