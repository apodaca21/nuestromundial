/**
 * Descarga fotos de jugadores en contexto de selección desde Wikimedia / Wikipedia.
 * Uso: node scripts/fetch-ticket-player-photos.mjs
 */
import fs from 'fs'
import path from 'path'

const OUT_DIR = 'public/ticket-players'
const MANIFEST_PATH = 'src/features/ticket/ticketPlayerPhotoManifest.ts'
const DELAY_MS = 1500
const USER_AGENT = 'NuestroMundial/1.0 (ticket-player-photos; contact@nuestromundial.com)'

const PLAYERS = {
  'Thibaut Courtois': 'Belgium',
  'Alisson Becker': 'Brazil',
  'Emiliano Martínez': 'Argentina',
  'Gianluigi Donnarumma': 'Italy',
  'Mike Maignan': 'France',
  'Ederson Moraes': 'Brazil',
  'Jan Oblak': 'Slovenia',
  'Giorgi Mamardashvili': 'Georgia',
  'Unai Simón': 'Spain',
  'Guillermo Ochoa': 'Mexico',
  'Achraf Hakimi': 'Morocco',
  'Trent Alexander-Arnold': 'England',
  'Jeremie Frimpong': 'Netherlands',
  'Jules Koundé': 'France',
  'Diogo Dalot': 'Portugal',
  'Josip Stanišić': 'Croatia',
  'Jorge Sánchez': 'Mexico',
  'Rúben Dias': 'Portugal',
  'William Saliba': 'France',
  'Antonio Rüdiger': 'Germany',
  'Ronald Araújo': 'Uruguay',
  'Johan Vásquez': 'Mexico',
  'Éder Militão': 'Brazil',
  'Joško Gvardiol': 'Croatia',
  'Matthijs de Ligt': 'Netherlands',
  'Cristian Romero': 'Argentina',
  'Gleison Bremer': 'Brazil',
  'Gonçalo Inácio': 'Portugal',
  'César Montes': 'Mexico',
  'Theo Hernández': 'France',
  'Alphonso Davies': 'Canada',
  'Alejandro Grimaldo': 'Spain',
  'Nuno Mendes': 'Portugal',
  'Mateo Chávez': 'Mexico',
  'Rodri Hernández': 'Spain',
  'Declan Rice': 'England',
  'Aurélien Tchouaméni': 'France',
  'Eduardo Camavinga': 'France',
  'Bruno Guimarães': 'Brazil',
  'Manuel Ugarte': 'Uruguay',
  'Edson Álvarez': 'Mexico',
  'Jude Bellingham': 'England',
  'Federico Valverde': 'Uruguay',
  Pedri: 'Spain',
  'Enzo Fernández': 'Argentina',
  Vitinha: 'Portugal',
  'Luis Chávez': 'Mexico',
  'Florian Wirtz': 'Germany',
  'Jamal Musiala': 'Germany',
  'Martin Ødegaard': 'Norway',
  'Gilberto Mora': 'Mexico',
  'Lionel Messi': 'Argentina',
  'Lamine Yamal': 'Spain',
  'Bukayo Saka': 'England',
  'Ousmane Dembélé': 'France',
  'Johan Bakayoko': 'Belgium',
  'Roberto Alvarado': 'Mexico',
  'Erling Haaland': 'Norway',
  'Kylian Mbappé': 'France',
  'Harry Kane': 'England',
  'Cristiano Ronaldo': 'Portugal',
  'Armando González': 'Mexico',
  'Vinícius Júnior': 'Brazil',
  'Neymar Jr.': 'Brazil',
  'Rafael Leão': 'Portugal',
  'Luis Díaz': 'Colombia',
  'Nico Williams': 'Spain',
  'César Huerta': 'Mexico',
}

const WIKI_TITLES = {
  'Thibaut Courtois': 'Thibaut_Courtois',
  'Alisson Becker': 'Alisson_Becker',
  'Emiliano Martínez': 'Emiliano_Martínez',
  'Gianluigi Donnarumma': 'Gianluigi_Donnarumma',
  'Mike Maignan': 'Mike_Maignan',
  'Ederson Moraes': 'Ederson_(footballer,_born_1993)',
  'Jan Oblak': 'Jan_Oblak',
  'Giorgi Mamardashvili': 'Giorgi_Mamardashvili',
  'Unai Simón': 'Unai_Simón',
  'Guillermo Ochoa': 'Guillermo_Ochoa',
  'Achraf Hakimi': 'Achraf_Hakimi',
  'Trent Alexander-Arnold': 'Trent_Alexander-Arnold',
  'Jeremie Frimpong': 'Jeremie_Frimpong',
  'Jules Koundé': 'Jules_Koundé',
  'Diogo Dalot': 'Diogo_Dalot',
  'Josip Stanišić': 'Josip_Stanišić',
  'Jorge Sánchez': 'Jorge_Sánchez_(footballer)',
  'Rúben Dias': 'Rúben_Dias',
  'William Saliba': 'William_Saliba',
  'Antonio Rüdiger': 'Antonio_Rüdiger',
  'Ronald Araújo': 'Ronald_Araújo',
  'Johan Vásquez': 'Johan_Vásquez',
  'Éder Militão': 'Éder_Militão',
  'Joško Gvardiol': 'Joško_Gvardiol',
  'Matthijs de Ligt': 'Matthijs_de_Ligt',
  'Cristian Romero': 'Cristian_Romero',
  'Gleison Bremer': 'Gleison_Bremer',
  'Gonçalo Inácio': 'Gonçalo_Inácio',
  'César Montes': 'César_Montes',
  'Theo Hernández': 'Theo_Hernández',
  'Alphonso Davies': 'Alphonso_Davies',
  'Alejandro Grimaldo': 'Alejandro_Grimaldo',
  'Nuno Mendes': 'Nuno_Mendes_(footballer,_born_2002)',
  'Mateo Chávez': 'Mateo_Chávez',
  'Rodri Hernández': 'Rodri_(footballer,_born_1996)',
  'Declan Rice': 'Declan_Rice',
  'Aurélien Tchouaméni': 'Aurélien_Tchouaméni',
  'Eduardo Camavinga': 'Eduardo_Camavinga',
  'Bruno Guimarães': 'Bruno_Guimarães_(footballer,_born_1997)',
  'Manuel Ugarte': 'Manuel_Ugarte_(footballer)',
  'Edson Álvarez': 'Edson_Álvarez',
  'Jude Bellingham': 'Jude_Bellingham',
  'Federico Valverde': 'Federico_Valverde',
  Pedri: 'Pedri',
  'Enzo Fernández': 'Enzo_Fernández',
  Vitinha: 'Vitinha_(footballer,_born_July_2000)',
  'Luis Chávez': 'Luis_Chávez',
  'Florian Wirtz': 'Florian_Wirtz',
  'Jamal Musiala': 'Jamal_Musiala',
  'Martin Ødegaard': 'Martin_Ødegaard',
  'Gilberto Mora': 'Gilberto_Mora',
  'Lionel Messi': 'Lionel_Messi',
  'Lamine Yamal': 'Lamine_Yamal',
  'Bukayo Saka': 'Bukayo_Saka',
  'Ousmane Dembélé': 'Ousmane_Dembélé',
  'Johan Bakayoko': 'Johan_Bakayoko',
  'Roberto Alvarado': 'Roberto_Alvarado',
  'Erling Haaland': 'Erling_Haaland',
  'Kylian Mbappé': 'Kylian_Mbappé',
  'Harry Kane': 'Harry_Kane',
  'Cristiano Ronaldo': 'Cristiano_Ronaldo',
  'Armando González': 'Armando_González_(footballer)',
  'Vinícius Júnior': 'Vinícius_Júnior',
  'Neymar Jr.': 'Neymar',
  'Rafael Leão': 'Rafael_Leão',
  'Luis Díaz': 'Luis_Díaz_(footballer)',
  'Nico Williams': 'Nico_Williams',
  'César Huerta': 'César_Huerta',
}

function slug(name) {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchJson(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (res.status === 429) {
      await sleep(2000 * (i + 1))
      continue
    }
    if (!res.ok) return null
    return res.json()
  }
  return null
}

async function wikipediaPageImage(title) {
  const data = await fetchJson(
    `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'pageimages',
      piprop: 'thumbnail|original',
      pithumbsize: '640',
      format: 'json',
      origin: '*',
    })}`,
  )
  const pages = data?.query?.pages
  if (!pages) return null
  const page = Object.values(pages)[0]
  return page?.thumbnail?.source || page?.original?.source || null
}

async function wikiSummaryImage(title) {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { 'User-Agent': USER_AGENT } },
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.thumbnail?.source || data.originalimage?.source || null
}

async function searchCommonsImage(query) {
  const data = await fetchJson(
    `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: query,
      gsrlimit: '6',
      prop: 'imageinfo',
      iiprop: 'url|mime|size',
      iiurlwidth: '640',
      format: 'json',
      origin: '*',
    })}`,
  )
  const pages = data?.query?.pages
  if (!pages) return null

  const candidates = Object.values(pages)
    .map((page) => page.imageinfo?.[0])
    .filter(Boolean)
    .filter((info) => ['image/jpeg', 'image/png', 'image/webp'].includes(info.mime))
    .filter((info) => info.width >= 220 && info.height >= 220)
    .sort((a, b) => b.width * b.height - a.width * a.height)

  return candidates[0]?.thumburl || candidates[0]?.url || null
}

async function resolveImage(name, nation) {
  const wikiTitle = WIKI_TITLES[name] || name.replace(/\s+/g, '_')

  const strategies = [
    () => searchCommonsImage(`${name} ${nation} national team`),
    () => searchCommonsImage(`${name} ${nation} World Cup`),
    () => wikipediaPageImage(wikiTitle),
    () => wikiSummaryImage(wikiTitle),
    () => searchCommonsImage(`${name} footballer`),
  ]

  for (const strategy of strategies) {
    const url = await strategy()
    if (url) return url
    await sleep(400)
  }

  return null
}

async function download(url, dest) {
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (res.status === 429) {
      await sleep(2500 * (i + 1))
      continue
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(dest, buf)
    return
  }
  throw new Error('HTTP 429')
}

function extFromUrl(url) {
  const clean = url.split('?')[0].toLowerCase()
  if (clean.endsWith('.png')) return '.png'
  if (clean.endsWith('.webp')) return '.webp'
  return '.jpg'
}

function rebuildManifestFromDisk() {
  const manifest = {}
  for (const name of Object.keys(PLAYERS)) {
    const fileBase = slug(name)
    const existing = fs
      .readdirSync(OUT_DIR)
      .find((f) => f.startsWith(`${fileBase}.`))
    if (existing) manifest[name] = existing
  }
  return manifest
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const manifest = rebuildManifestFromDisk()
  const missing = []

  for (const [name, nation] of Object.entries(PLAYERS)) {
    if (manifest[name]) {
      console.log(`skip ${name} -> ${manifest[name]}`)
      continue
    }

    process.stdout.write(`fetch ${name} (${nation})… `)
    try {
      const imageUrl = await resolveImage(name, nation)
      if (!imageUrl) {
        missing.push(name)
        console.log('NOT FOUND')
        await sleep(DELAY_MS)
        continue
      }

      const ext = extFromUrl(imageUrl)
      const filename = `${slug(name)}${ext}`
      await download(imageUrl, path.join(OUT_DIR, filename))
      manifest[name] = filename
      console.log(`ok -> ${filename}`)
    } catch (err) {
      missing.push(name)
      console.log(`FAIL (${err.message})`)
    }

    await sleep(DELAY_MS)
  }

  const lines = Object.entries(manifest)
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([name, file]) => `  ${JSON.stringify(name)}: ${JSON.stringify(file)},`)
    .join('\n')

  fs.writeFileSync(
    MANIFEST_PATH,
    `/** Generado por scripts/fetch-ticket-player-photos.mjs — no editar a mano */\nexport const TICKET_PLAYER_PHOTO_FILES: Record<string, string> = {\n${lines}\n}\n`,
  )

  console.log(`\nManifest: ${Object.keys(manifest).length}/${Object.keys(PLAYERS).length} fotos`)
  if (missing.length) {
    console.log('Sin foto:', missing.join(', '))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
