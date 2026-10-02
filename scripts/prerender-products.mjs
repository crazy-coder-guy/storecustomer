// Generates a static HTML "shell" per product at dist/products/<slug>/index.html
// after `vite build` — each one is the exact same built index.html (same JS
// bundle, so the SPA boots and hydrates normally for a real visitor) but
// with that product's actual title/description/canonical/OG/Twitter tags and
// Product + BreadcrumbList JSON-LD swapped in, plus a small visible content
// block inside #root as a no-JS fallback.
//
// Why this exists: this app is a client-side-rendered SPA. A crawler that
// doesn't execute JavaScript (most link-preview bots — WhatsApp, Slack,
// older/other search engines — and Google Merchant Center's crawler, which
// is unreliable about JS) only ever sees the one static index.html Vite
// outputs, with the SAME generic homepage meta for every URL. Prerendering a
// shell per product is the smallest fix for that which doesn't require
// migrating the app to a server-rendered framework.
//
// Requires: Render (or whatever static host serves dist/) to serve an exact
// static file match before falling back to the SPA's catch-all rewrite —
// this is the default behavior for a rewrite rule like `/* -> /index.html`,
// but confirm it in the hosting dashboard; see the SEO notes handed back
// alongside this script.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SITE_URL = 'https://kaiira.in'
const SITE_NAME = 'KAIIRA'
const DEFAULT_OG_IMAGE = `${SITE_URL}/icon-512.png`
const API_BASE_URL = process.env.SITEMAP_API_BASE_URL || process.env.VITE_API_BASE_URL || ''

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = join(__dirname, '..', 'dist')
const TEMPLATE_PATH = join(DIST_DIR, 'index.html')

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function fetchAllActiveProducts() {
  const items = []
  let page = 1
  const limit = 100
  for (;;) {
    const query = new URLSearchParams({ status: 'ACTIVE', page: String(page), limit: String(limit) })
    const res = await fetch(`${API_BASE_URL}/products?${query}`)
    if (!res.ok) throw new Error(`/products returned ${res.status}`)
    const body = await res.json()
    const data = body.data ?? body
    items.push(...data.items)
    if (page >= (data.meta?.totalPages ?? 1)) break
    page += 1
  }
  return items
}

async function fetchProductDetail(slug, attempt = 1) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/slug/${slug}`)
    if (!res.ok) return null
    const body = await res.json()
    return body.data ?? body
  } catch (err) {
    // A single transient network hiccup (seen locally as ECONNRESET under
    // rapid-fire requests) shouldn't lose the whole run — retry once.
    if (attempt < 3) return fetchProductDetail(slug, attempt + 1)
    console.warn(`[prerender] "${slug}" failed after ${attempt} attempts: ${err.message}`)
    return null
  }
}

// Small bounded concurrency rather than fully sequential (hundreds of
// products would otherwise take a very long time) or fully parallel
// (hammers the API with hundreds of simultaneous connections at once).
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length)
  let nextIndex = 0
  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex++
      results[current] = await fn(items[current], current)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

function buildProductJsonLd(product) {
  const images = [...(product.images || [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => img.imageUrl)
  const activeVariants = (product.variants || []).filter((v) => v.status === 'ACTIVE')
  const totalStock = activeVariants.reduce((sum, v) => sum + v.stockQuantity, 0)
  const price = activeVariants.find((v) => v.price != null)?.price ?? product.basePrice
  const sku = activeVariants[0]?.sku

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} by ${SITE_NAME}.`,
    image: images.length > 0 ? images : undefined,
    url: `${SITE_URL}/products/${product.slug}`,
    brand: { '@type': 'Brand', name: SITE_NAME },
    category: product.category?.name,
    ...(sku ? { sku } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: Number(price).toFixed(2),
      availability: totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }
}

function buildBreadcrumbJsonLd(product) {
  const items = [{ name: 'Home', path: '/' }]
  if (product.category) {
    items.push({ name: 'Shop', path: '/products' }, { name: product.category.name, path: `/category/${product.category.slug}` })
  } else {
    items.push({ name: 'Shop', path: '/products' })
  }
  items.push({ name: product.name, path: `/products/${product.slug}` })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

function renderProductHtml(template, product) {
  const title = `${product.name} | Premium Streetwear | ${SITE_NAME}`
  const description = (product.description || `Shop the ${product.name} by ${SITE_NAME} — premium streetwear, oversized fit.`).slice(0, 300)
  const canonicalUrl = `${SITE_URL}/products/${product.slug}`
  const image =
    [...(product.images || [])].sort((a, b) => a.sortOrder - b.sortOrder).find((i) => i.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    DEFAULT_OG_IMAGE
  const jsonLd = [buildProductJsonLd(product), buildBreadcrumbJsonLd(product)]

  let html = template

  // <title>
  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)

  // Upsert-by-replace for each tag the base template already declares.
  const replacements = [
    [/<meta\s+name="description"\s+content=".*?"\s*\/?>/s, `<meta name="description" content="${escapeHtml(description)}" />`],
    [/<meta\s+name="robots"\s+content=".*?"\s*\/?>/s, `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`],
    [/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/s, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`],
    [/<meta property="og:type" content=".*?" \/>/s, `<meta property="og:type" content="product" />`],
    [/<meta property="og:title" content=".*?" \/>/s, `<meta property="og:title" content="${escapeHtml(title)}" />`],
    [/<meta property="og:description" content=".*?" \/>/s, `<meta property="og:description" content="${escapeHtml(description)}" />`],
    [/<meta property="og:url" content=".*?" \/>/s, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`],
    [/<meta property="og:image" content=".*?" \/>/s, `<meta property="og:image" content="${escapeHtml(image)}" />`],
    [/<meta name="twitter:title" content=".*?" \/>/s, `<meta name="twitter:title" content="${escapeHtml(title)}" />`],
    [/<meta name="twitter:description" content=".*?" \/>/s, `<meta name="twitter:description" content="${escapeHtml(description)}" />`],
    [/<meta name="twitter:image" content=".*?" \/>/s, `<meta name="twitter:image" content="${escapeHtml(image)}" />`],
  ]
  for (const [pattern, replacement] of replacements) {
    html = html.replace(pattern, replacement)
  }

  // Append this product's Product + BreadcrumbList JSON-LD right before </head>
  // (additive — doesn't disturb the global Organization/WebSite blocks).
  const jsonLdScripts = jsonLd.map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`).join('\n    ')
  html = html.replace('</head>', `    ${jsonLdScripts}\n  </head>`)

  // No-JS-visible fallback content inside #root — React overwrites this on
  // hydration for a real browser; a crawler that never runs JS still sees it.
  const fallback = `
    <h1>${escapeHtml(product.name)}</h1>
    <p>${escapeHtml(description)}</p>
    <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" />
    <p>Price: ₹${escapeHtml(Number(product.basePrice).toFixed(2))}</p>
  `.trim()
  html = html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`)

  return html
}

async function main() {
  if (!existsSync(TEMPLATE_PATH)) {
    console.error(`[prerender] ${TEMPLATE_PATH} not found — run \`vite build\` first.`)
    process.exit(1)
  }
  if (!API_BASE_URL) {
    console.warn('[prerender] SITEMAP_API_BASE_URL / VITE_API_BASE_URL not set — skipping product prerendering.')
    return
  }

  const template = readFileSync(TEMPLATE_PATH, 'utf8')
  const products = await fetchAllActiveProducts()
  console.log(`[prerender] Found ${products.length} active products.`)

  let written = 0
  let failed = 0
  await mapWithConcurrency(products, 8, async (summary) => {
    const product = await fetchProductDetail(summary.slug)
    if (!product) {
      failed += 1
      console.warn(`[prerender] Skipping "${summary.slug}" — detail fetch failed.`)
      return
    }
    const outDir = join(DIST_DIR, 'products', product.slug)
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'index.html'), renderProductHtml(template, product), 'utf8')
    written += 1
  })
  console.log(`[prerender] Wrote ${written} product page shells to dist/products/<slug>/index.html${failed ? ` (${failed} skipped)` : ''}`)
}

main().catch((err) => {
  console.error('[prerender] Fatal error:', err)
  process.exit(1)
})
