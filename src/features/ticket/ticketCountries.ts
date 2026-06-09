export interface TicketCountry {
  code: string
  label: string
  flag: string
}

export const TICKET_COUNTRIES: TicketCountry[] = [
  { code: 'MEX', label: 'México', flag: '🇲🇽' },
  { code: 'ARG', label: 'Argentina', flag: '🇦🇷' },
  { code: 'BRA', label: 'Brasil', flag: '🇧🇷' },
  { code: 'ESP', label: 'España', flag: '🇪🇸' },
  { code: 'ENG', label: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'FRA', label: 'Francia', flag: '🇫🇷' },
  { code: 'USA', label: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'GER', label: 'Alemania', flag: '🇩🇪' },
  { code: 'POR', label: 'Portugal', flag: '🇵🇹' },
  { code: 'COL', label: 'Colombia', flag: '🇨🇴' },
  { code: 'URU', label: 'Uruguay', flag: '🇺🇾' },
  { code: 'NED', label: 'Países Bajos', flag: '🇳🇱' },
  { code: 'ITA', label: 'Italia', flag: '🇮🇹' },
  { code: 'JPN', label: 'Japón', flag: '🇯🇵' },
]

export function getTicketCountry(code: string): TicketCountry {
  return TICKET_COUNTRIES.find((c) => c.code === code) ?? TICKET_COUNTRIES[0]
}
