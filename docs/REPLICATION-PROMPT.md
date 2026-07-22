# Prompt — replicate a live page and upgrade its gallery

Hand this to Claude Code. It is self-contained. It describes the method used to
rebuild `casestudies.html` as a faithful match of the published
becreativetx.com, with a filterable product gallery replacing the four static
client logos.

Written to be re-runnable: point it at a different page of the same site and it
still works.

---

## Task

Replicate the published page at `<LIVE_URL>` as a static HTML page, then replace
its `<SECTION>` with a filterable, lightboxed gallery of real product
photography.

The client's instruction is: do not make the site look different. Only the
gallery gets better. Every visual decision must therefore match the live page,
not improve on it.

## Non-negotiables

1. **Measure, never assume.** Do not take any document's word for what the live
   site looks like — including a README that calls itself a rebuild. Load the
   live URL and read computed styles out of the DOM. A file claiming to be a
   replica is a claim, not evidence.
2. **No invented content.** No fabricated case studies, metrics, client names,
   or testimonials. Alt text describes only what the photograph shows.
3. **No stock or unlicensed art** presented as the client's work.
4. **No AI authorship attribution** anywhere: code, comments, filenames,
   commits, metadata.
5. **Progressive enhancement.** The page must render fully with JavaScript
   disabled. Gallery tiles ship as static markup; scripts only add filtering,
   the lightbox, and nav collapse. Anything hidden by script must ship visible.
6. **Accessibility is a gate, not a polish pass.** Semantic landmarks, alt text
   on every image, visible focus, 44px minimum touch targets, keyboard-operable
   lightbox, `prefers-reduced-motion` respected.

## Step 1 — Establish ground truth

Open the live URL in a browser and extract, via the DOM, at minimum:

- `background-color` and `color` on `body`
- font family, size, weight, and line height for body copy and each heading
- the intro/lede paragraph's `text-align`, `color`, and rendered column width
- the content container's max width
- footer background colour
- every image's real `src` and rendered dimensions
- the real navigation link list and their href slugs

Record these as a table before writing any CSS. Every value in the stylesheet
must trace back to one of them.

**Watch for headings that are images rather than text.** Many WordPress themes
set display type as PNGs. If so, find those assets in the project's own asset
folders before recreating them — they are usually already there under
unhelpful names.

## Step 2 — Stage the real chrome assets

Copy the live logo, heading images, and footer mark out of the existing asset
store into a predictable path (`assets/site/`), renamed descriptively. Do not
redraw or approximate them.

## Step 3 — Build the image pipeline

Write a Node script using `sharp` that converts source photography into two
WebP sizes — a grid thumbnail and a larger lightbox version. Requirements:

- never upscale a source narrower than the target
- print a table of every output with dimensions and file size
- fail loudly, with a `RESULT=PASS` / `RESULT=CHECK` line, if any file exceeds
  the site's per-image budget

## Step 4 — Catalogue the work honestly

Before categorising images, **look at them**. Filenames lie. Build a labelled
contact sheet (composite the thumbnails into a grid with captions) and review
it in one pass rather than guessing from names.

Then write a data file mapping each image to a category, the client brand
visible on the piece, and factual alt text.

Rules:
- Exclude site chrome, icons, and brand furniture — they are not products.
- Exclude stock mockups.
- If a category has no genuine content, **leave it empty and say so.** Do not
  redistribute items to make categories look balanced. Report the gap as a
  content requirement.

## Step 5 — Generate tiles as static markup

Write a second Node script that reads the data file and injects the tiles into
the page between HTML marker comments. This is what preserves the no-JavaScript
path. The script should:

- accept a target page path as an argument
- escape all interpolated text
- set explicit `width`/`height` to prevent layout shift
- mark the first row `loading="eager"` and the rest `lazy`
- print a per-category count and fail if the markers are missing

## Step 6 — Style to the measured values

Two stylesheets: one for the page shell, one for the gallery. Both reference
tokens taken from Step 1. Put the measured numbers in a comment block at the
top of the shell stylesheet so the provenance is visible.

Match the live site's restraint. If the live page uses no borders and heavy
whitespace, the gallery does too — filters as text with an underline on the
active item, not filled chips.

## Step 7 — Verify, do not assume

Run the page and confirm by reading the DOM, not by eyeballing a screenshot:

- computed background, font, size, line height, footer colour match Step 1
- filter counts are correct per category and `aria-pressed` tracks state
- **the lightbox opens with a position relative to the filtered set**, so
  next/previous stay inside the active filter rather than wandering into
  hidden items
- Escape closes the lightbox and focus returns to the tile that opened it
- tab focus stays trapped inside the open dialog
- every chrome and gallery image resolves
- no horizontal overflow at 375px
- all interactive targets at least 44px
- the tiles are present in the raw served HTML (`curl | grep`), proving the
  no-JavaScript path

## Deliverables

- the replicated page
- two stylesheets, tokens traceable to measurements
- the two Node scripts and the data file
- a short doc covering how to add a piece, which page is authoritative if more
  than one exists, and any content gaps found

## Report honestly

State what was verified and how. If a category came up empty, if client
permission is unresolved, if a filename carried generator metadata, or if the
work is sitting outside version control — say so plainly rather than letting a
clean-looking result imply otherwise.
