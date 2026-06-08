export interface DraftPlayer {
  name: string
  stars: number
}

export interface DraftPosition {
  id: string
  name: string
  players: DraftPlayer[]
}

export type PackState = 'IDLE' | 'OPENING' | 'REVEALED'

export interface SelectedPlayer extends DraftPlayer {
  positionId: string
  positionName: string
}
