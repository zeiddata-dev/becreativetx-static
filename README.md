# becreativetx — static site

A faithful static mirror of becreativetx.com with an upgraded product gallery
on the case-studies page.

## Run it

From this folder:

```bash
npx vite .
```

Or any static server. Open `casestudies.html` to see the gallery.

## Layout

| Path | What it is |
|---|---|
| `*.html` | The flattened pages, captured from the live WordPress site |
| `assets/` | Every asset the pages use (Salient theme, plugins, uploads), local |
| `assets/gallery/` | Converted product images: `thumb/` (grid), `full/` (lightbox) |
| `css/gallery.css` | Gallery styling, scoped under `#bc-gallery` |
| `js/gallery.js` | Filter + lightbox, reads the tiles already in the page |
| `js/gallery-data.js` | The gallery catalogue (build input) |
| `product-images/` | **Drop real product photos here** — see its README |
| `scripts/` | Build tools (below) |
| `docs/` | How the gallery works, and the replication method |

## The gallery

The case-studies page shipped with four client logos. It now shows a
filterable grid of product photos with a lightbox, styled to match the live
site (white, Open Sans, restrained). Filters appear only for categories that
have work, so empty ones stay hidden rather than looking broken.

The tiles are static markup in `casestudies.html`, so the gallery renders with
JavaScript disabled; the script only adds filtering and the lightbox.

### Adding work

See `product-images/README.md`. Short version: drop photos into the category
folder, run `scripts/build-gallery-images.mjs`, add the printed entries to
`js/gallery-data.js`, run `scripts/build-gallery-html.mjs`.

## Scripts

| Script | Does |
|---|---|
| `flatten.mjs` | Rebuild the static pages from the saved crawl (source of the mirror) |
| `inject-gallery.mjs` | Place the gallery container into casestudies.html (one-time, idempotent) |
| `build-gallery-images.mjs` | Convert dropped photos to WebP, print catalogue entries |
| `build-gallery-html.mjs` | Write the tiles into the page |
| `contact-sheet.mjs` | Labelled contact sheet for reviewing photos before cataloguing |

## Not yet done

- The `/gallery/` page and portfolio detail pages were not in the crawl; they
  are not mirrored yet.
- Forms (quote, art upload, newsletter) still point at the live WordPress
  endpoints and do not submit from the mirror. Wiring them is a separate task.
- The gallery photos are stand-ins from the old asset set, pending real
  product photography.
