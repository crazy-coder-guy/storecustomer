// Generates public/sitemap.xml from live product/category data before the
// Vite build runs (see package.json's "build" script) — Vite copies
// everything in public/ into dist/ verbatim, so this file ends up served at
// https://kaiira.in/sitemap.xml with no extra server/runtime needed.
//
// IMPORTANT: this needs a real, reachable backend URL at build time — set
// SITEMAP_API_BASE_URL (preferred) or VITE_API_BASE_URL in the environment
// this script runs in (e.g. Render's build environment), pointing at the
// *production* API, not localhost/a LAN IP. If neither is set, or the
// request fails, the script still writes a sitemap with just the static
// pages rather than failing the whole build.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SITE_URL = 'https://kaiira.in'
const API_BASE_URL =
  process.env.SITEMAP_API_BASE_URL || process.env.VITE_API_BASE_URL || ''

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.4' },
  { path: '/shipping-info', changefreq: 'monthly', priority: '0.3' },
  { path: '/returns-exchanges', changefreq: 'monthly', priority: '0.3' },
  { path: '/size-guide', changefreq: 'monthly', priority: '0.3' },
  { path: '/track-order', changefreq: 'monthly', priority: '0.3' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms-of-service', changefreq: 'yearly', priority: '0.2' },
  { path: '/security', changefreq: 'yearly', priority: '0.2' },
]

async function fetchAllPages(path, params = {}) {
  const items = []
  let page = 1
  const limit = 100
  for (;;) {
    const query = new URLSearchParams({ ...params, page: String(page), limit: String(limit) })
    const res = await fetch(`${API_BASE_URL}${path}?${query}`)
    if (!res.ok) throw new Error(`${path} returned ${res.status}`)
    const body = await res.json()
    const data = body.data ?? body
    items.push(...data.items)
    if (page >= (data.meta?.totalPages ?? 1)) break
    page += 1
  }
  return items
}

async function fetchProducts() {
  return fetchAllPages('/products', { status: 'ACTIVE' })
}

async function fetchCategories() {
  return fetchAllPages('/categories', { status: 'ACTIVE' })
}

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function urlEntry({ path, changefreq, priority, lastmod }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(SITE_URL + path)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
}

async function main() {
  const entries = [...STATIC_PAGES]

  if (!API_BASE_URL) {
    console.warn(
      '[sitemap] SITEMAP_API_BASE_URL / VITE_API_BASE_URL not set — generating a sitemap with only static pages.'
    )
  } else {
    try {
      const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()])
      for (const category of categories) {
        entries.push({
          path: `/category/${category.slug}`,
          changefreq: 'weekly',
          priority: '0.7',
          lastmod: category.updatedAt?.slice(0, 10),
        })
      }
      for (const product of products) {
        entries.push({
          path: `/products/${product.slug}`,
          changefreq: 'weekly',
          priority: '0.8',
          lastmod: product.updatedAt?.slice(0, 10),
        })
      }
      console.log(`[sitemap] Included ${products.length} products and ${categories.length} categories.`)
    } catch (err) {
      console.warn(
        `[sitemap] Failed to fetch live product/category data (${err.message}) — writing a sitemap with only static pages.`
      )
    }
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.map(urlEntry).join('\n') +
    '\n</urlset>\n'

  const __dirname = dirname(fileURLToPath(import.meta.url))
  const outPath = join(__dirname, '..', 'public', 'sitemap.xml')
  writeFileSync(outPath, xml, 'utf8')
  console.log(`[sitemap] Wrote ${entries.length} URLs to ${outPath}`)
}

main().catch((err) => {
  console.error('[sitemap] Fatal error:', err)
  process.exit(1)
})
