import {
  absoluteTabUrl,
  SECTION_META,
  SITE_ORIGIN,
  type SectionMeta,
} from './appRoutes'
import type { AppTab } from '../types/match'

const OG_IMAGE = `${SITE_ORIGIN}/icon-512.png`

function upsertMeta(
  selector: string,
  create: () => HTMLMetaElement,
  content: string,
): void {
  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.content = content
}

function applySectionMeta(tab: AppTab, meta: SectionMeta): void {
  const url = absoluteTabUrl(tab)

  document.title = meta.title

  upsertMeta(
    'meta[name="description"]',
    () => {
      const tag = document.createElement('meta')
      tag.name = 'description'
      return tag
    },
    meta.description,
  )

  const og = (property: string, content: string) =>
    upsertMeta(
      `meta[property="${property}"]`,
      () => {
        const tag = document.createElement('meta')
        tag.setAttribute('property', property)
        return tag
      },
      content,
    )

  og('og:type', 'website')
  og('og:site_name', 'Nuestro Mundial 2026')
  og('og:title', meta.title)
  og('og:description', meta.description)
  og('og:url', url)
  og('og:image', OG_IMAGE)

  upsertMeta(
    'meta[name="twitter:card"]',
    () => {
      const tag = document.createElement('meta')
      tag.name = 'twitter:card'
      return tag
    },
    'summary_large_image',
  )

  upsertMeta(
    'meta[name="twitter:title"]',
    () => {
      const tag = document.createElement('meta')
      tag.name = 'twitter:title'
      return tag
    },
    meta.title,
  )

  upsertMeta(
    'meta[name="twitter:description"]',
    () => {
      const tag = document.createElement('meta')
      tag.name = 'twitter:description'
      return tag
    },
    meta.description,
  )

  upsertMeta(
    'meta[name="twitter:image"]',
    () => {
      const tag = document.createElement('meta')
      tag.name = 'twitter:image'
      return tag
    },
    OG_IMAGE,
  )
}

export function updatePageMeta(tab: AppTab): void {
  applySectionMeta(tab, SECTION_META[tab])
}
