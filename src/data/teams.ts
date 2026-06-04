import type { Team } from '../types/match'

export const TEAMS: Record<string, Team> = {
  MEX: { id: 'mex', name: 'México', code: 'MEX', flagEmoji: '🇲🇽' },
  RSA: { id: 'rsa', name: 'Sudáfrica', code: 'RSA', flagEmoji: '🇿🇦' },
  KOR: { id: 'kor', name: 'Corea del Sur', code: 'KOR', flagEmoji: '🇰🇷' },
  CZE: { id: 'cze', name: 'Chequia', code: 'CZE', flagEmoji: '🇨🇿' },
  CAN: { id: 'can', name: 'Canadá', code: 'CAN', flagEmoji: '🇨🇦' },
  BIH: { id: 'bih', name: 'Bosnia y Herzegovina', code: 'BIH', flagEmoji: '🇧🇦' },
  QAT: { id: 'qat', name: 'Qatar', code: 'QAT', flagEmoji: '🇶🇦' },
  SUI: { id: 'sui', name: 'Suiza', code: 'SUI', flagEmoji: '🇨🇭' },
  HAI: { id: 'hai', name: 'Haití', code: 'HAI', flagEmoji: '🇭🇹' },
  SCO: { id: 'sco', name: 'Escocia', code: 'SCO', flagEmoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  BRA: { id: 'bra', name: 'Brasil', code: 'BRA', flagEmoji: '🇧🇷' },
  MAR: { id: 'mar', name: 'Marruecos', code: 'MAR', flagEmoji: '🇲🇦' },
  AUS: { id: 'aus', name: 'Australia', code: 'AUS', flagEmoji: '🇦🇺' },
  TUR: { id: 'tur', name: 'Turquía', code: 'TUR', flagEmoji: '🇹🇷' },
  USA: { id: 'usa', name: 'Estados Unidos', code: 'USA', flagEmoji: '🇺🇸' },
  PAR: { id: 'par', name: 'Paraguay', code: 'PAR', flagEmoji: '🇵🇾' },
  CIV: { id: 'civ', name: 'Côte d\'Ivoire', code: 'CIV', flagEmoji: '🇨🇮' },
  ECU: { id: 'ecu', name: 'Ecuador', code: 'ECU', flagEmoji: '🇪🇨' },
  GER: { id: 'ger', name: 'Alemania', code: 'GER', flagEmoji: '🇩🇪' },
  CUW: { id: 'cuw', name: 'Curaçao', code: 'CUW', flagEmoji: '🇨🇼' },
  NED: { id: 'ned', name: 'Países Bajos', code: 'NED', flagEmoji: '🇳🇱' },
  JPN: { id: 'jpn', name: 'Japón', code: 'JPN', flagEmoji: '🇯🇵' },
  SWE: { id: 'swe', name: 'Suecia', code: 'SWE', flagEmoji: '🇸🇪' },
  TUN: { id: 'tun', name: 'Túnez', code: 'TUN', flagEmoji: '🇹🇳' },
  KSA: { id: 'ksa', name: 'Arabia Saudita', code: 'KSA', flagEmoji: '🇸🇦' },
  URU: { id: 'uru', name: 'Uruguay', code: 'URU', flagEmoji: '🇺🇾' },
  ESP: { id: 'esp', name: 'España', code: 'ESP', flagEmoji: '🇪🇸' },
  CPV: { id: 'cpv', name: 'Cabo Verde', code: 'CPV', flagEmoji: '🇨🇻' },
  IRN: { id: 'irn', name: 'Irán', code: 'IRN', flagEmoji: '🇮🇷' },
  NZL: { id: 'nzl', name: 'Nueva Zelanda', code: 'NZL', flagEmoji: '🇳🇿' },
  BEL: { id: 'bel', name: 'Bélgica', code: 'BEL', flagEmoji: '🇧🇪' },
  EGY: { id: 'egy', name: 'Egipto', code: 'EGY', flagEmoji: '🇪🇬' },
  FRA: { id: 'fra', name: 'Francia', code: 'FRA', flagEmoji: '🇫🇷' },
  SEN: { id: 'sen', name: 'Senegal', code: 'SEN', flagEmoji: '🇸🇳' },
  IRQ: { id: 'irq', name: 'Irak', code: 'IRQ', flagEmoji: '🇮🇶' },
  NOR: { id: 'nor', name: 'Noruega', code: 'NOR', flagEmoji: '🇳🇴' },
  ARG: { id: 'arg', name: 'Argentina', code: 'ARG', flagEmoji: '🇦🇷' },
  ALG: { id: 'alg', name: 'Argelia', code: 'ALG', flagEmoji: '🇩🇿' },
  AUT: { id: 'aut', name: 'Austria', code: 'AUT', flagEmoji: '🇦🇹' },
  JOR: { id: 'jor', name: 'Jordania', code: 'JOR', flagEmoji: '🇯🇴' },
  GHA: { id: 'gha', name: 'Ghana', code: 'GHA', flagEmoji: '🇬🇭' },
  PAN: { id: 'pan', name: 'Panamá', code: 'PAN', flagEmoji: '🇵🇦' },
  ENG: { id: 'eng', name: 'Inglaterra', code: 'ENG', flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  CRO: { id: 'cro', name: 'Croacia', code: 'CRO', flagEmoji: '🇭🇷' },
  POR: { id: 'por', name: 'Portugal', code: 'POR', flagEmoji: '🇵🇹' },
  COD: { id: 'cod', name: 'Congo DR', code: 'COD', flagEmoji: '🇨🇩' },
  UZB: { id: 'uzb', name: 'Uzbekistán', code: 'UZB', flagEmoji: '🇺🇿' },
  COL: { id: 'col', name: 'Colombia', code: 'COL', flagEmoji: '🇨🇴' },
}

export function getAllTeamsSorted(): Team[] {
  return Object.values(TEAMS).sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export function getTeam(code: string): Team {
  return TEAMS[code] ?? {
    id: code.toLowerCase(),
    name: code,
    code,
    flagEmoji: '🏳️',
  }
}
