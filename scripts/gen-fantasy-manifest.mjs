import fs from 'fs'
import path from 'path'

const draft = fs.readFileSync('src/features/fantasy/draftData.ts', 'utf8')
const players = [...draft.matchAll(/\{ name: '([^']+)', stars: \d+ \}/g)].map(
  (m) => m[1],
)

const root = 'public/fantasy'
const files = []
for (const dir of fs
  .readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'SOBRES')) {
  for (const f of fs
    .readdirSync(path.join(root, dir.name))
    .filter((x) => x.endsWith('.png'))) {
    files.push({ base: f.slice(0, -4), rel: `${dir.name}/${f}` })
  }
}

const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const aliasNormToFileBaseNorm = new Map([
  ['emiliano martinez', norm('Dibu Martínez')],
  ['cristian romero', norm('Cuti Romero')],
])

const fileByNorm = new Map(files.map((f) => [norm(f.base), f.rel]))

const map = {}
for (const player of players) {
  const key = norm(player)
  let rel = fileByNorm.get(key)
  if (!rel && aliasNormToFileBaseNorm.has(key)) {
    rel = fileByNorm.get(aliasNormToFileBaseNorm.get(key))
  }
  if (!rel) throw new Error(`missing image for ${player}`)
  map[player] = rel
}

const lines = Object.entries(map)
  .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  .join('\n')

fs.writeFileSync(
  'src/features/fantasy/fantasyImageManifest.ts',
  `export const PLAYER_IMAGE_PATHS: Record<string, string> = {\n${lines}\n}\n`,
)

console.log(`Wrote ${Object.keys(map).length} player image paths`)
