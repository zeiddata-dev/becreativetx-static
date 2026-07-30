# Be Creative - Static Site Deployment Runbook (Hostinger)

This migrates `becreativetx.com` from WordPress to the static HTML export in
this repo, with two PHP form handlers running on the same Hostinger box. No
DNS changes, no external services, no build step.

Files that make the forms and routing work:

- `.htaccess` - HTTPS, old-URL preservation, caching, 404
- `forms/config.php` - shared settings (fill in mailbox creds) + helpers
- `forms/quote.php` - Request-a-Quote handler
- `forms/upload.php` - Upload-Art handler
- `uploads/` - where submitted art is stored (has its own `.htaccess`)

Work top to bottom. Do not skip Phase 0.

Phases 0-5 describe the original WordPress cutover. For an ordinary content or
code change to a site that is already live, use the incremental release below
instead.

---

## Incremental release (site already live)

Changes are made and reviewed in `../bctx-dev`, then promoted here. `bctx-live`
is production: do not edit it directly.

1. Promote the reviewed files from `bctx-dev` into this checkout, then confirm
   `git status` lists only the files you meant to change.

2. Re-stamp cache busters, then rebuild the upload copy. Order matters, so the
   copied HTML and the copied assets agree on their `?v=` tokens:

   ```
   node scripts/stamp-logo-cache.mjs
   node scripts/stamp-asset-cache.mjs
   node scripts/build-public-html.mjs
   ```

   `build-public-html.mjs` validates every manifest entry before touching the
   existing tree and keeps the previous copy as `public_html_prev/`. It refuses
   to run if that rollback copy already exists, so clear it first.

3. If a release adds a new file, add it to `.remember/deploy-manifest.txt`.
   Anything not listed is silently left out of the upload: a page can link a
   file that exists in the repo and still 404 in production. The manifest is the
   authority on what ships.

4. QA the generated tree before uploading, not the repo root:

   ```
   cd public_html
   python -m http.server 5179 --bind 127.0.0.1
   ```

   Load `http://127.0.0.1:5179/index.html` with the network tab open. A real
   failure is a same-origin path under `/css/`, `/js/`, or `/assets/` returning
   404 or no response, which means the file is missing from the manifest.

   Requests to `fonts.googleapis.com` and the two
   `becreativetx.com/.../sr7.*.css` files are expected to appear as failures
   here and are not: Slider Revolution lazy-loads those from the live origin, so
   they cannot resolve against a local server. Judge them by hostname, not by
   status.

5. Upload `public_html/` to Hostinger. Roll back by restoring
   `public_html_prev/`.

---

## Phase 0 - Backup (do this first)

1. hPanel > **Files** > **Backups** (or **Websites > Manage > Backups**).
2. Create a **Files backup** and a **Database backup** of the live site.
   Download both to your own computer. Wait for the download to finish.
3. Also make a manual copy on the server so rollback is instant:
   - hPanel > **File Manager**, or SSH/SFTP.
   - Confirm the WordPress site currently lives in `public_html/`.
4. **Verify the backup restores** before touching anything:
   - Download the DB `.sql` and open it in a text editor; confirm it is not
     empty and ends cleanly (you can see `INSERT INTO` statements).
   - Unzip the files backup locally; confirm `wp-config.php` and
     `wp-content/uploads/` are present.
   - If either check fails, re-run the backup. Do not proceed on a bad backup.

---

## Phase 1 - Staging

Test everything on a staging subdomain before cutover.

1. **Create the staging subdomain**
   - hPanel > **Domains** > **Subdomains**.
   - Create e.g. `staging.becreativetx.com`. Note its document root, usually
     `public_html/staging` or a dedicated folder like `staging_bctx`.

2. **Upload the static build**
   - Upload the full contents of this repo to the staging document root:
     all `*.html`, `assets/`, `css/`, `js/`, `product-images/`, plus the new
     `.htaccess`, `forms/`, and `uploads/`.
   - Keep the folder structure identical to this repo.

3. **Folder and file permissions**
   - Directories: `755`
   - Files (`.html`, `.php`, `.css`, `.js`, images): `644`
   - The `uploads/` directory must be **writable by PHP**: set it to `755`
     (Hostinger runs PHP as the site user, so `755` is enough; only use `775`
     if uploads fail with a permission error).
   - Quick way in File Manager: right-click a folder > **Permissions**.
   - Via SSH:
     ```
     find . -type d -exec chmod 755 {} \;
     find . -type f -exec chmod 644 {} \;
     chmod 755 uploads
     ```

4. **Fill in mailbox credentials**
   - hPanel > **Emails** > **Email Accounts**. Create (or confirm) two real
     mailboxes on the domain, e.g. `noreply@becreativetx.com` (sender) and a
     destination such as `quotes@becreativetx.com`.
   - Edit `forms/config.php` and set:
     - `TO_EMAIL` - where leads should land (e.g. `quotes@becreativetx.com`)
     - `FROM_EMAIL` - a real domain mailbox (e.g. `noreply@becreativetx.com`).
       Do NOT set this to the visitor's address; that breaks SPF.
     - `FROM_NAME` - display name, e.g. `Be Creative Website`
   - Leave `USE_SMTP = false` for now (uses PHP `mail()`). Authenticated SMTP
     is preferred for deliverability; see Phase 4. When you add an SMTP sender,
     fill `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT` and set
     `USE_SMTP = true`.
   - Optional: raise `MAX_UPLOAD_BYTES` (default 25 MB). It must not exceed the
     server's `upload_max_filesize` / `post_max_size` (hPanel > **Advanced** >
     **PHP Configuration**). Raise those too if you expect large art files.

---

## Phase 2 - QA checklist (run on staging)

Tick every item before cutover.

- [ ] Every page loads with full styling and images:
      `/`, `/request-a-quote.html`, `/upload-art.html`, `/casestudies.html`,
      `/gallery.html`, `/branded-apparel.html`, `/commercial-printing.html`,
      `/promotional-products.html`, `/design-2.html`.
- [ ] Old WordPress-style URLs redirect (301) to the `.html` page and the
      page still renders with styling. Test:
      `/request-a-quote/`, `/upload-art/`, `/casestudies/`, `/gallery/`,
      `/branded-apparel/`, `/commercial-printing/`, `/promotional-products/`,
      `/design/`.
- [ ] Site is served over **HTTPS** (padlock shows); `http://` redirects to
      `https://`.
- [ ] **Quote form**: submit with valid data > thank-you page shows > a real
      email arrives at `TO_EMAIL`. Reply to it and confirm it reaches the
      submitter (Reply-To works).
- [ ] Quote form: submitting with an artwork file stores it and the email
      lists the stored filename under `/uploads/`.
- [ ] Quote form: leaving Name or Email blank shows the error page.
- [ ] **Upload form**: submit with valid data + a file > thank-you page > email
      arrives, and the file lands in `/uploads/` with a timestamped name.
- [ ] Upload form: mismatched "Email" / "Confirm Email" is rejected.
- [ ] Upload form: a disallowed file type (e.g. `.exe`) is rejected.
- [ ] Directory listing of `/uploads/` is blocked (visiting `/uploads/` gives
      403 or the 404 page), but a known file URL downloads.
- [ ] No console 404s for CSS/JS/images (browser devtools > Network).

If form emails do not arrive, that is almost always the domain mail setup, not
the code. Go to Phase 4.

---

## Phase 3 - Cutover by folder swap (DNS is NOT touched)

Everything stays on Hostinger; only the document root contents change.

1. Put the site in a known state (optional maintenance note).
2. In File Manager / SSH, from the account home:
   ```
   mv public_html public_html_wp_backup
   mkdir public_html
   ```
   Then upload the static build into the new `public_html/` (or move the
   validated staging folder into place).
   - If staging already holds the exact build:
     ```
     mv public_html public_html_wp_backup
     mv staging_bctx public_html
     ```
     (use your real staging folder name).
3. Re-apply permissions in the new `public_html` (Phase 1 step 3), and confirm
   `forms/config.php` still has the live mailbox creds.
4. Load `https://becreativetx.com/` and re-run the Phase 2 checklist quickly.

**Rollback (instant):**
```
mv public_html public_html_static_failed
mv public_html_wp_backup public_html
```
WordPress is live again. DNS never changed, so this takes effect immediately.

---

## Phase 4 - Fix domain email (form deliverability depends on this)

The forms can only deliver if the domain's mail is healthy. Do this in
hPanel/DNS (DNS stays at Hostinger).

1. **MX records** - hPanel > **Emails** > **DNS / MX records** (or **Domains >
   DNS Zone**). Confirm MX points to Hostinger mail
   (`mx1.hostinger.com`, `mx2.hostinger.com`) with correct priorities.
2. **Mailbox exists / not full** - hPanel > **Emails** > **Email Accounts**.
   Confirm `TO_EMAIL` and `FROM_EMAIL` mailboxes exist and are under quota.
3. **SPF** (TXT) - one record like:
   ```
   v=spf1 include:_spf.mail.hostinger.com ~all
   ```
   Without SPF, form mail from the server is likely marked spam.
4. **DKIM** (TXT) - enable DKIM for the domain in hPanel; it publishes a
   `hostingermail..._domainkey` TXT record. Confirm it resolves.
5. **DMARC** (TXT) - add `_dmarc.becreativetx.com`:
   ```
   v=DMARC1; p=none; rua=mailto:postmaster@becreativetx.com
   ```
   Start with `p=none` to monitor, tighten later.
6. **Send tests both ways** - email the mailbox from an outside address (Gmail)
   and reply out. Then submit a form and confirm the lead arrives in the inbox,
   not spam.
7. If deliverability is still poor, switch the forms to **authenticated SMTP**:
   set `USE_SMTP = true` and fill `SMTP_*` in `forms/config.php`, then wire an
   SMTP send in the marked branch of `send_lead()`. Authenticated SMTP is the
   reliable path; `mail()` is the fallback.

Use a checker (e.g. MXToolbox) to confirm SPF/DKIM/DMARC/MX resolve correctly.

---

## Phase 5 - Post-launch

- [ ] Monitor form submissions for **48-72 hours**; submit one real test per
      form per day and confirm receipt.
- [ ] Check the server **404 log** (hPanel > **Advanced** > error logs, or
      Analytics) for old URLs that are not mapped; add them to `.htaccess` if
      any legitimate inbound links 404.
- [ ] Keep `public_html_wp_backup` and the downloaded backups for **30 days**.
      Only delete once the static site and email have run clean for a month.
- [ ] Periodically clear old files from `/uploads/` once leads are handled.

---

### Notes / assumptions

- HTTPS is forced with `%{HTTPS} off`. If Hostinger fronts the site with a
  proxy that hides that, switch the rule to test
  `%{HTTP:X-Forwarded-Proto} !https` instead.
- `design-2.html` is mapped from both `/design-2/` and the likely original
  `/design/` slug.
- Emails are sent as plain text with the uploaded file **linked, not
  attached** (avoids message-size limits). To attach instead, see the comment
  in `send_lead()` in `forms/config.php`.
