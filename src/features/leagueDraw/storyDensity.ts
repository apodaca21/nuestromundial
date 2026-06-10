export type StoryDensity = 'normal' | 'compact' | 'dense' | 'ultra'

/** Ajusta tipografía y layout para que quepa en 9:16 */
export function getStoryDensity(
  participantCount: number,
  teamsPerPlayer: number,
): StoryDensity {
  if (teamsPerPlayer >= 12 || participantCount * teamsPerPlayer > 40) {
    return 'ultra'
  }
  if (teamsPerPlayer >= 8 || participantCount >= 7) {
    return 'dense'
  }
  if (teamsPerPlayer >= 6 || participantCount >= 5) {
    return 'compact'
  }
  return 'normal'
}

export function storyParticipantColumns(
  participantCount: number,
  teamsPerPlayer: number,
): 1 | 2 {
  if (participantCount <= 1) return 1
  if (teamsPerPlayer >= 10) return 1
  if (participantCount <= 3 && teamsPerPlayer >= 8) return 1
  return 2
}

export const STORY_FRAME_WIDTH = 360
export const STORY_FRAME_HEIGHT = 640
