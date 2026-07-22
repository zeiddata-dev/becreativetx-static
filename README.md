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
| `assets/gallery/` | Converted product images: `thumb/` (overlay grid), `full/` (zoom) |
| `css/casestudies.css` | Overlay styling, matched to the live look |
| `js/casestudies.js` | Turns the logos into buttons, runs the overlay |
| `js/casestudies-data.js` | The four clients and their products (build input) |
| `product-images/` | **Drop real product photos here** — see its README |
| `scripts/` | Build tools (below) |
| `docs/` | How the gallery works, and the replication method |

## The gallery

The case-studies page keeps its four client logos, exactly as the live site
has them. Each logo is now a button: clicking it opens a full-screen overlay of
just that client's products, and clicking a product opens a single-image view
with prev/next scoped to that client. Escape and arrow keys work; focus is
trapped and restored.

Styling matches the live site (white, Open Sans, quiet). With JavaScript off,
the page shows the four logos just like the live site — nothing is broken, the
drill-down simply is not offered.

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
| `contact-sheet.mjs` | Labelled contact sheet for reviewing photos before cataloguing |

## Not yet done

- The `/gallery/` page and portfolio detail pages were not in the crawl; they
  are not mirrored yet.
- Forms (quote, art upload, newsletter) still point at the live WordPress
  endpoints and do not submit from the mirror. Wiring them is a separate task.
- The gallery photos are stand-ins from the old asset set, pending real
  product photography.
