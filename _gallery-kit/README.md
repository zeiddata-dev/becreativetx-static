# Gallery kit (staged, not yet wired)

Salvaged from the retired redesign so the gallery upgrade can drop into the
flattened mirror without rebuilding it. Nothing here is live on the site yet.

## What it is

| Path | Purpose |
|---|---|
| `js/gallery.js` | Filter + lightbox. Reads static tiles from the DOM; needs no data file at runtime. Filter-aware lightbox navigation. |
| `js/gallery-data.js` | Build input: 37 catalogued products with category, client, and factual alt text. |
| `css/gallery-live.css` | Gallery skin matched to the live becreativetx.com look (Open Sans, restrained, text filters). |
| `css/live.css` | Page-shell tokens measured from the live site. Reference only; the flattened pages carry the real Salient CSS. |
| `scripts/build-gallery-images.mjs` | `sharp` pipeline: source art to two WebP sizes, budgeted under 400KB. |
| `scripts/build-gallery-html.mjs` | Writes tiles into a page between HTML markers (preserves the no-JS path). |
| `scripts/contact-sheet.mjs` | Labelled contact sheet for categorising photos by sight, not filename. |
| `assets/gallery/{thumb,full}/` | 62 already-converted product WebPs (37 used in the data file). |
| `GALLERY.md` | How the gallery works and how to add pieces. |
| `REPLICATION-PROMPT.md` | The replicate-and-upgrade method, generalised. |

## Wiring it in (later)

The target is the flattened `casestudies.html`, whose current content is the
four grey client logos. The plan: replace that section with the product grid,
using the tiles generator against `gallery-data.js`.

The media source of truth going forward is `wp-content/uploads` in the archived
install, not the curated set these WebPs came from. Re-run the image pipeline
against real uploads when adding pieces; `sharp` must be installed in this
project first.
