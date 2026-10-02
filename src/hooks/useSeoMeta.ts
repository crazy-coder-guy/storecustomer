import { useEffect } from 'react'
import { SITE_NAME, SITE_URL, absoluteUrl, type JsonLd } from '../utils/seo'

export interface SeoMetaInput {
  /** Rendered as `{title} | KAIIRA`. Pass the bare page/product title. */
  title: string
  description?: string
  /** Site-relative path, e.g. "/products/foo-tee". Defaults to the current location. */
  path?: string
  /** Defaults to "index, follow". Pass "noindex, nofollow" for cart/checkout/account/etc. */
  robots?: string
  image?: string
  /** og:type — "product" for product pages, "website" otherwise. */
  type?: 'website' | 'product'
  jsonLd?: JsonLd | JsonLd[]
}

const MANAGED_ATTR = 'data-seo-managed'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    el.setAttribute(MANAGED_ATTR, 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.setAttribute(MANAGED_ATTR, 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Syncs <title>, canonical/meta/OG/Twitter tags, and JSON-LD for the current
 * page. This is client-side only — Google's own crawler executes JS and will
 * see it, but bots that don't (link-preview unfurlers, some other search
 * engines) only see whatever index.html ships statically. See the project's
 * SEO notes for the prerendering piece that covers that gap for product pages.
 */
export function useSeoMeta({ title, description, path, robots = 'index, follow', image, type = 'website', jsonLd }: SeoMetaInput) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`
    document.title = fullTitle

    const canonicalPath = path ?? window.location.pathname
    const canonicalUrl = absoluteUrl(canonicalPath)
    const ogImage = image ?? absoluteUrl('/icon-512.png')

    const robotsContent =
      robots === 'index, follow'
        ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
        : robots

    upsertMeta('name', 'robots', robotsContent)
    upsertMeta('name', 'googlebot', robotsContent)
    if (description) upsertMeta('name', 'description', description)
    upsertLink('canonical', canonicalUrl)

    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:title', fullTitle)
    if (description) upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('property', 'og:image', ogImage)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    if (description) upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)

    // JSON-LD: remove this page's previous structured-data blocks before
    // writing the current ones, so navigating between pages doesn't pile up
    // stale <script> tags in the head.
    document.head.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove())
    const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
    for (const block of blocks) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-seo-jsonld', 'true')
      script.textContent = JSON.stringify(block)
      document.head.appendChild(script)
    }

    return () => {
      document.head.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove())
    }
  }, [title, description, path, robots, image, type, jsonLd])
}

export { SITE_URL }
