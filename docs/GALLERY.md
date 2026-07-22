# Gallery — how it works and how to add work

The product gallery on **`casestudies.html`**. Filterable by service, with a
lightbox. No framework.

## Which page is which

| File | What it is |
|---|---|
| `casestudies.html` | **The deliverable.** Matches the published becreativetx.com |
| `case-studies.html` | Earlier redesign, kept only for reference. Not the live look |

`becreativetx-site/` was labelled a "rebuild of becreativetx.com" but is in
fact a redesign — cream, Archivo Black, heavy rules. The published site is
white, Open Sans, with image-set headings and a charcoal footer. `live.css`
and `gallery-live.css` carry values measured from the live page, not guessed:

| Property | Measured |
|---|---|
| Page background | `#ffffff` |
| Body type | Open Sans 400, 14px / 28px |
| Intro copy | justified, `rgba(0,0,0,0.65)`, 564px column |
| Content column | 885px |
| Heading | image asset, 600 x 130 |
| Footer | `#252525` |

The display headings on the live site are images, not text, and those images
are already in `assets_curated/` (`casestudfiesAsset-109`, `footer.png`, and
the logo). They are staged into `assets/site/`.

## Adding or changing pieces

1. Drop the source image into `assets_curated/` at the project root (PNG or
   JPEG, any size).
2. Convert it:

```bash
node scripts/build-gallery-images.mjs
```

   Writes an 800px thumbnail and an 1800px full size as WebP into
   `becreativetx-site/assets/gallery/`. Prints a table and fails loudly if
   anything lands over 400KB.

3. Add an entry to `becreativetx-site/js/gallery-data.js`. The `id` is the
   converted filename without extension.
4. Write the tiles into the page:

```bash
node scripts/build-gallery-html.mjs
```

Step 4 is what puts the images in the HTML. Skipping it means the data file
changed but the page did not. The generator targets `casestudies.html` by
default; pass a path as the first argument to write elsewhere.

## Why the tiles are generated, not built in the browser

The site's promise is that you can open a file and it works, with JavaScript as
enhancement only. So the tiles ship as static markup in `case-studies.html`.
`js/gallery.js` reads the DOM and adds the filter bar and lightbox on top. With
JavaScript off, all 37 pieces still render and every image still has alt text.

That is also why `gallery-data.js` is not fetched at runtime — it is a build
input, read by the Node generator.

## Filters

Filters are derived from the data. A category with no pieces gets no button, so
nothing renders as broken or empty. Add a print piece and the Print filter
appears on its own.

## Current contents

| Category | Pieces |
|---|---|
| Promo | 28 |
| Design | 9 |
| Print | 0 |
| Apparel | 0 |

**Print and Apparel have no photography.** This is a content gap, not a bug:

- The only apparel image in the curated set is a purchased stock polo mockup.
  DESIGN.md Section 3 bars stock-derived art from the site, so it is excluded.
- The antique press photograph is atmosphere, not client work.
- The studio business cards derive from a stock template, so they are not
  presented as portfolio work.

Both filters appear automatically once real photographs are added.

## Before this page goes public

The old placeholder read "client permission required" on every tile. That
question is still open. The gallery now names real clients — City of Allen,
Momentum Spine & Joint, Unitron Power Systems, Atlas Marine Systems, Box
Insurance Agency, Legacy Housing, Visit Allen Texas, Foxcart. Confirm with
Chris that each is cleared to show publicly before launch.

Alt text describes only what each photograph shows. No claims about results,
volumes, or scope are made anywhere in the gallery.
