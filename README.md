# becreativetx.com — static site

The production source of becreativetx.com. Nine flattened pages captured from
the former WordPress site, extended with a case-studies product gallery, a
site-wide gallery page, and accessibility fixes. The static build has replaced
the WordPress install as the site actually being served.

## Run it locally

From this folder:

```bash
npx vite .
```

Or any static server. The PHP form handlers in `forms/` only run on the host.

## Layout

| Path | What it is |
|---|---|
| `*.html` | The nine flattened pages (home, case studies, gallery, services, quote, art upload) |
| `assets/` | Every asset the pages use (Salient theme, plugins, uploads), local |
| `assets/gallery/` | Converted product images: `thumb/` (overlay grid), `full/` (zoom) |
| `css/` | Overlay, gallery, home, and accessibility styling |
| `js/` | Overlay and gallery behavior; `*-data.js` files are the build inputs |
| `forms/` | PHP handlers for the quote and art-upload forms |
| `product-images/` | **Drop real product photos here** — see its README |
| `scripts/` | Build tools (below) |
| `docs/` | Replication method notes |
| `public_html/` | Gitignored staging copy of exactly what ships — regenerate, never hand-edit |
| `public_html_prev/` | Previous upload copy, kept for rollback (also gitignored) |

## The gallery

The case-studies page keeps its four client logos (Unitron, Momentum, City of
Allen, Box Insurance). Each logo is a button: clicking it opens a full-screen
overlay of that client's products, and clicking a product opens a single-image
view with prev/next scoped to that client. Escape and arrow keys work; focus
is trapped and restored. With JavaScript off the page degrades to the plain
logo row. `gallery.html` offers the same photo set as a standalone page,
reachable from the header nav on every page.

### Adding work

See `product-images/README.md`. Short version: drop photos into the client
folder, run `scripts/build-gallery-images.mjs`, paste the printed entries into
that client's `products` array in `js/casestudies-data.js`.

## Scripts

| Script | Does |
|---|---|
| `flatten.mjs` | Rebuild the static pages from the saved crawl (source of the mirror) |
| `inject-casestudies.mjs` | Wire the overlay stylesheet + scripts into casestudies.html (idempotent) |
| `build-gallery-images.mjs` | Convert dropped photos to WebP, print per-client entries |
| `build-gallery-page.mjs` | Build gallery.html by cloning an existing page's chrome |
| `add-gallery-nav.mjs` | Insert the Gallery item into the header menu on every page |
| `contact-sheet.mjs` | Labelled contact sheet for reviewing photos before cataloguing |
| `stamp-logo-cache.mjs` | Content-hash cache busters on the client logos |
| `stamp-asset-cache.mjs` | Content-hash cache busters on the site's css/ and js/ |
| `build-public-html.mjs` | Rebuild `public_html/` from `.remember/deploy-manifest.txt` |

## Deploying

Deploys are manual; nothing is wired to CI and pushing this repo publishes
nothing. The upload copy is built from the manifest, in this order so the HTML
and assets agree on their `?v=` tokens:

```bash
node scripts/stamp-logo-cache.mjs
node scripts/stamp-asset-cache.mjs
node scripts/build-public-html.mjs
```

Then upload the contents of `public_html/` to the host's document root
(`domains/becreativetx.com/public_html` on the Hostinger account) over
SCP/SFTP. Anything not listed in the manifest does not ship, so new files must
be added there. The prior tree stays in `public_html_prev/` for rollback.
