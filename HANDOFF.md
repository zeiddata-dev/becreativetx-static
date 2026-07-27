# be creative — project handoff

Last updated 2026-07-27.

## ACTIVE WORK: migration to Hostinger (2026-07-27)

**Goal:** retire the WordPress site on Hostinger and serve this static mirror in
its place. Same domain (`becreativetx.com`), same Hostinger account (already paid
annually), **no DNS changes**, working forms, zero-downtime reversible cutover.
Driver wants it live within ~24h, no drawn-out QA (a 20-min smoke test only).

### Decision (settled)
- Static on **Hostinger**, not Cloudflare. Cloudflare Pages was the cleaner
  static host, but "already paid + DNS never moves + forms rebuilt either way"
  won. Cloudflare Workers was never relevant (no compute).
- WordPress content does **not** import back; this repo is the rendered output
  and is already ahead of the live WP site. Going static ships the work as-is.

### Built this session (in repo, NOT committed, NOT deployed)
- `forms/config.php` — shared config: SMTP creds (placeholders), TO/FROM email,
  25MB upload cap, helpers (honeypot, header sanitize, `save_upload`, `send_lead`).
- `forms/quote.php` — Request-a-Quote handler (validate, honeypot, optional
  artwork upload, emails lead).
- `forms/upload.php` — Upload-Art handler (validate, email-match check, stores
  file, emails path).
- `uploads/.htaccess` — no listing, no script exec, forces safe download.
- `.htaccess` (root) — forces HTTPS, 301-redirects all 9 old WP directory URLs to
  `.html` (incl. `/design/`→`design-2.html`), custom 404, gzip + caching.
- Edited `request-a-quote.html` + `upload-art.html`: form `action` → PHP handlers,
  stripped WPForms AJAX classes / `data-token*` / noscript, added `bctx_hp`
  honeypot, converted the dead dropzone to a real file input.
- `DEPLOY.md` — full Phase 0–5 Hostinger runbook (backup, staging, QA, folder-swap
  cutover + rollback, email/SPF/DKIM/DMARC fix, post-launch).
- **Deploy zip** built at `<scratchpad>/bctx-deploy.zip` (521 files, 41 MB;
  excludes `.git/.claude/.idea/.remember/docs` + internal `.md`). Rebuild with the
  shared-read PowerShell snippet (Compress-Archive chokes on locked files).

### Email / DNS findings (live check 2026-07-26)
- NS `ns1/ns2.dns-parking.com` = Hostinger DNS → confirms no DNS move needed.
- MX `mx1/mx2.hostinger.com` **PASS**; SPF `v=spf1 include:_spf.mail.hostinger.com ~all` **PASS**; DMARC `p=none` present.
- **DKIM missing** (`hostingermail1/2._domainkey` absent). Driver reports mail now
  sends to Gmail, but DKIM had **not** published as of last check — re-check; if
  still blank the hPanel toggle didn't save. Not a blocker; affects spam only, and
  form emails ride the same SPF/DKIM.

### Blocker / next action
- **No Hostinger access from here** (no hPanel/FTP; won't handle account
  password). The deploy must be run by someone logged in, following `DEPLOY.md`,
  OR by driving the driver's logged-in browser (offered; awaiting go).
- Operator TODO: fill `forms/config.php` SMTP creds; `uploads/` → 755; confirm
  server `upload_max_filesize`/`post_max_size` ≥ 25MB; verify DKIM.
- **Not started:** actual upload/extract/cutover on Hostinger. Nothing is live.

### Client note
- Email to Chris (casual, why + next steps) drafted and **sent** by driver.

## What this is

A faithful static mirror of **becreativetx.com** with an upgraded case-studies
experience. One live project: **`bctx-live/`**.

- Remote: **github.com/zeiddata-dev/becreativetx-static** (public)
- Synced to `origin/master` (pushed after each change set)
- **Live (GitHub Pages):** https://zeiddata-dev.github.io/becreativetx-static/
  — served from `master` root; pushes to `master` auto-redeploy. Repo was made
  public so Pages works on the free plan.
- Run locally: `npx vite .` from `bctx-live/`, open a page (e.g. `casestudies.html`)

Known cosmetic gap: Font Awesome webfonts 404 on the live site (the icon-font
files were never pulled local during flatten). Pre-existing, site-wide, low
priority.

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

## The `/gallery/` page (built 2026-07-25)

`gallery.html` — one filterable grid of all be creative work, wearing the real
site chrome (Poppins headings, Open Sans, red accent). It reuses the
case-studies lightbox for the single-image zoom.

- **Sources merged:** the four case-study clients (each product now carries a
  `type` in `casestudies-data.js`) plus general work typed by folder
  (`js/gallery-data.js`).
- **62 pieces**, filter chips **All / Design / Print / Promo / Apparel** (the
  site's own nav categories). Filtering is client-side; tiles fade in staggered.
- **Apparel is a workflow, not tiles:** the Apparel filter shows an ordering
  guide (shop blanks at the external Company Casuals store, list them in a quote,
  we design + price). Edit the steps/links in `gallery-data.js` under `apparel`.
- **Type tags** on the 41 client products were assigned by sight and reviewed:
  branded merch is Promo, printed paper is Print, and bespoke/creative pieces
  (laser-cut invitation, coverage display, five-year award) are Design.
- **Nav wired:** a `Gallery` item was added after `Design` in the header menu on
  every page by `scripts/add-gallery-nav.mjs`. On `gallery.html` the generator
  marks Gallery (not Print) as the current page.

Files: `gallery.html`, `css/gallery.css`, `js/gallery.js`, `js/gallery-data.js`.
`gallery.html` is generated by `scripts/build-gallery-page.mjs` (clones the
chrome of `commercial-printing.html`); re-run it if the shared chrome changes.

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

1. **Promo/Design coverage.** `general/promo` and `general/apparel` are empty
   (client plans to add more to both). Add photos to
   `product-images/general/{promo,apparel}/` and rebuild if more coverage is
   wanted.
2. 6 `/portfolio/` detail pages not mirrored (not in crawl; flatten same way
   after fetching).
3. ~~Forms POST to live WordPress endpoints~~ **DONE (2026-07-27):** quote +
   upload-art rewired to `forms/*.php` handlers. See ACTIVE WORK section. The
   **newsletter** form (if present) was not rewired — verify before launch.

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
| `build-gallery-images.mjs` | Convert dropped photos (clients + `general/<type>/`) to WebP, print catalogue entries |
| `build-gallery-page.mjs` | Generate `gallery.html` by cloning a flattened page's chrome (idempotent) |
| `contact-sheet.mjs` | Labelled contact sheet for cataloguing photos by sight |
