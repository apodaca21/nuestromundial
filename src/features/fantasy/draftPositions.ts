import type { DraftPosition } from './types'
import { POSITIONS } from './draftData'

export function getPositionById(positionId: string): DraftPosition | undefined {
  return POSITIONS.find((p) => p.id === positionId)
}
