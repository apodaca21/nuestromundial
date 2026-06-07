import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const text = fs.readFileSync(
  'C:/Users/migue/.cursor/projects/c-Users-migue-nuestromundial/agent-tools/334fb506-4e96-4824-93f7-6149f8406986.txt',
  'utf8',
)

const slots = ['A', 'B', 'D', 'E', 'G', 'I', 'K', 'L']
const byOption = {}
const comboToOption = {}
const re =
  /\b(\d{1,3})\s+(3[A-L])\s+(3[A-L])\s+(3[A-L])\s+(3[A-L])\s+(3[A-L])\s+(3[A-L])\s+(3[A-L])\s+(3[A-L])/g

let match
while ((match = re.exec(text)) !== null) {
  const option = Number(match[1])
  if (option < 1 || option > 495) continue
  const mapping = {}
  const groups = []
  for (let i = 0; i < 8; i += 1) {
    const group = match[i + 2].slice(1)
    mapping[slots[i]] = group
    groups.push(group)
  }
  byOption[option] = mapping
  comboToOption[groups.sort().join('')] = option
}

const out = path.join(__dirname, '../src/features/groupPhase/thirdPlaceAnnexC.ts')
const content = `import type { GroupLetter } from './groupData'

/** Slots de ganadores de grupo que reciben un tercero (Annex C FIFA). */
export const WINNER_THIRD_SLOTS = ${JSON.stringify(slots)} as const
export type WinnerThirdSlot = (typeof WINNER_THIRD_SLOTS)[number]

type Mapping = Record<WinnerThirdSlot, GroupLetter>

const COMBO_TO_OPTION: Record<string, number> = ${JSON.stringify(comboToOption)}

const BY_OPTION: Record<number, Mapping> = ${JSON.stringify(byOption)}

export function getAnnexOption(qualifyingThirdGroups: GroupLetter[]): number | null {
  if (qualifyingThirdGroups.length !== 8) return null
  const key = [...qualifyingThirdGroups].sort().join('')
  return COMBO_TO_OPTION[key] ?? null
}

export function mapThirdPlacesToWinnerSlots(
  qualifyingThirdGroups: GroupLetter[],
): Record<WinnerThirdSlot, GroupLetter> | null {
  const option = getAnnexOption(qualifyingThirdGroups)
  if (!option) return null
  return BY_OPTION[option]
}
`

fs.writeFileSync(out, content)
console.log('written', out, 'options', Object.keys(byOption).length)
