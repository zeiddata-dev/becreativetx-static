# be creative — project handoff

Last updated 2026-07-25.

## What this is

A faithful static mirror of **becreativetx.com** with an upgraded case-studies
experience. One live project: **`bctx-live/`**.

- Remote: **github.com/zeiddata-dev/becreativetx-static** (private)
- Synced at commit `65379a6`
- Run locally: `npx vite .` from `bctx-live/`, open a page (e.g. `casestudies.html`)

## How we got here (important context)

The brief evolved: not "redesign the site" but "replicate the live site, keep it
looking the same, and upgrade how work is showcased." Two earlier attempts were
built and then deleted as dead ends:

- an Astro scrollytelling rebuild (looked nothing like the real site)
- a brutalist static redesign (same problem)

**Lesson, learned twice:** measure the live site directly; never trust a document
(or a folder) that calls itself a replica. The winning approach was to *flatten*
the site's own rendered HTML rather than re-author it.

## What's done

**The static mirror.** 8 of 9 pages flattened from the live WordPress render,
all assets pulled local, internal links rewired, front-end cruft stripped. The
home hero (Slider Revolution) renders offline. Navigates entirely offline.
Verified against the live site. Built by `scripts/flatten.mjs` from the saved
crawl in `../content_inventory` + the extracted install in
`../_archive/website_origin/public_html`.

**Case-studies page = per-client pop-out overlays.** The page keeps its four
live client logos (Unitron, Momentum, Allen, Box Insurance). Each logo:
- glows red and lifts on hover, with an enlarged "VIEW WORK" cue
- opens a **pop-out** (a card floating over the dimmed page, not a new page)
  showing just that client's products
- products open a single-image zoom with prev/next scoped to that client
- Escape / arrows / focus-trap / backdrop-click-to-close all work
- with JavaScript off, the four logos still show, exactly like live

Files: `js/casestudies.js`, `js/casestudies-data.js`, `css/casestudies.css`,
wired by `scripts/inject-casestudies.mjs`. Logos become buttons at runtime, so
the flattened page body is untouched.

## In progress / next

**The general `/gallery/` page is not built yet.** The live site has one — a
filterable grid of *all* products — but it wasn't in the crawl. Decisions made
for it (pending build):
- filter **by product type**: Print / Promo / Apparel / Design
- shows **all products**: the four clients' work (pulled from their folders) plus
  everything in `product-images/general/`

## Where images go (the intake model)

The client reworks photos (better background, smoother edges) and drops them in:

```
product-images/
  unitron/  momentum/  allen/  box-insurance/   -> case-study overlays
  general/print|promo|apparel|design/           -> the /gallery/ page
```

- Client folders: flat, folder = client. Product type for the gallery is
  assigned by sight when cataloguing.
- General folder: subfolder = product type.

Pipeline: `node scripts/build-gallery-images.mjs` compresses photos to two WebP
sizes and prints catalogue entries to paste into the data file. Proven
end-to-end. See `product-images/README.md` and `product-images/general/README.md`.

## Current status of uploads (2026-07-25)

- All four client folders committed and wired into the overlays: unitron 6,
  momentum 12, allen 11, box-insurance 12. `casestudies-data.js` points at the
  reworked photos for **all four** clients (no more stand-ins).
- `general/design`: 6 photos, `general/print`: 16 photos — committed.
- `general/apparel` and `general/promo`: still empty (`.gitkeep` only).
- Both `product-images/` (source) and the built `assets/gallery/` (thumb+full
  WebP) are committed. Rebuild `assets/gallery/` any time with
  `node scripts/build-gallery-images.mjs`.

## Open items

1. **Build the `/gallery/` page** (filter by type, all products). Note
   `general/apparel` and `general/promo` are empty, so those filters start bare.
   **REMINDER (2026-07-25): revisit apparel + promo after the full gallery
   build.** On the live site the Apparel section is NOT a product grid — it is
   just two links (see https://becreativetx.com/branded-apparel/). So the
   gallery's Apparel filter likely wants those two links, not a photo wall.
   Leaving both empty for now by decision.
2. Add apparel + promo photos to `product-images/general/{apparel,promo}/`
   (only if the gallery design ends up wanting a promo/apparel grid).
3. 6 `/portfolio/` detail pages not mirrored (not in crawl; flatten same way
   after fetching).
4. Forms (quote, upload-art, newsletter) still POST to live WordPress endpoints;
   don't submit from the mirror. Separate wiring task.

## Parts bin (kept, not dead)

`../_archive/website_origin/public_html/` (WP install + all uploads — flatten
source), `../content_inventory/` (page crawl), `../assets_curated/`, `../posts/`.
Root `../node_modules` has sharp + cheerio for the pipeline. The old
`zeiddata-dev/bctx_build` repo is a dead archive.

## Scripts

| Script | Does |
|---|---|
| `flatten.mjs` | Rebuild the static pages from the saved crawl |
| `inject-casestudies.mjs` | Wire overlay assets into casestudies.html (idempotent) |
| `build-gallery-images.mjs` | Convert dropped photos to WebP, print catalogue entries |
| `contact-sheet.mjs` | Labelled contact sheet for cataloguing photos by sight |
