export const PITCH_SLOTS: { positionId: string; top: string; left: string }[] = [
  // Delanteros y extremos
  { positionId: 'LW', top: '14%', left: '12%' },
  { positionId: 'ST', top: '14%', left: '50%' },
  { positionId: 'RW', top: '14%', left: '88%' },
  // Medios — más separados de la línea de arriba
  { positionId: 'CAM', top: '31%', left: '50%' },
  { positionId: 'CM', top: '47%', left: '16%' },
  { positionId: 'CDM', top: '47%', left: '84%' },
  // Defensa
  { positionId: 'LB', top: '68%', left: '10%' },
  { positionId: 'CB1', top: '66%', left: '36%' },
  { positionId: 'CB2', top: '66%', left: '64%' },
  { positionId: 'RB', top: '68%', left: '90%' },
  { positionId: 'GK', top: '86%', left: '50%' },
]

/** Etiquetas cortas legibles en móvil y PC */
export const POSITION_SHORT_LABELS: Record<string, string> = {
  GK: 'POR',
  RB: 'LD',
  CB1: 'DC1',
  CB2: 'DC2',
  LB: 'LI',
  CDM: 'MCD',
  CM: 'MC',
  CAM: 'MCO',
  RW: 'ED',
  ST: 'DEL',
  LW: 'EI',
}

export function getPositionShortLabel(positionId: string): string {
  return POSITION_SHORT_LABELS[positionId] ?? positionId
}
