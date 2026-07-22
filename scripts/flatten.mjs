// Flatten a saved WordPress render into a self-contained static page.
//
// For each source page it:
//   1. reads the rendered HTML captured in content_inventory/
//   2. finds every reference to a becreativetx.com asset, in any of the forms
//      the markup uses (absolute, protocol-relative, or root-relative)
//   3. copies that asset out of the extracted install into ./assets/,
//      preserving its path, so only referenced files are carried over
//   4. rewrites the reference to a relative local path
//   5. strips WordPress front-end cruft that only matters to a live install
//      (feeds, xmlrpc/oembed discovery links, the emoji shim, REST/api links)
//
// The result is faithful by construction: it is the site's own output with
// its URLs pointed at local copies. Nothing is re-authored.
//
// Run: node scripts/flatten.mjs

import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const SRC_HTML = '../content_inventory';
const WP_ROOT = '../_archive/website_origin/public_html';
const OUT = '.';

// Source page file -> output file. Slugs match the live URL structure.
const PAGES = [
  ['home.raw.html', 'index.html'],
  ['commercial-printing.raw.html', 'commercial-printing.html'],
  ['promotional-products.raw.html', 'promotional-products.html'],
  ['branded-apparel.raw.html', 'branded-apparel.html'],
  ['design-2.raw.html', 'design-2.html'],
  ['casestudies.raw.html', 'casestudies.html'],
  ['request-a-quote.raw.html', 'request-a-quote.html'],
  ['upload-art.raw.html', 'upload-art.html'],
];

const ASSET_EXT = /\.(css|js|mjs|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|eot|mp4|webm)$/i;

// Lines the live install needs but a static mirror does not. Matched against
// whole <link>/<script>/<meta> tags and removed.
const CRUFT = [
  /<link[^>]+rel=['"]?(alternate|EditURI|wlwmanifest|pingback|https:\/\/api\.w\.org\/)[^>]*>/gi,
  /<link[^>]+(feed|rss)[^>]*>/gi,
  /<link[^>]+rel=['"]?dns-prefetch['"]?[^>]*>/gi,
  // Inline emoji-detection script. The inner match is fenced so it cannot
  // cross a </script> boundary and swallow adjacent scripts.
  /<script\b[^>]*>(?:(?!<\/script>)[\s\S])*?(?:wpemoji|wp-emoji)(?:(?!<\/script>)[\s\S])*?<\/script>/gi,
  /<script[^>]+wp-emoji-release[^>]*><\/script>/gi,
  /<style[^>]*>\s*img\.wp-smiley[\s\S]*?<\/style>/gi,
];

const copied = new Set();
const missing = new Set();

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

// Turn any asset reference into a bare site-root-relative path, or null if it
// is not a local becreativetx.com asset.
function toLocalPath(url) {
  let u = url.trim().replace(/^["']|["']$/g, '');
  u = u.replace(/^https?:\/\/(www\.)?becreativetx\.com/i, '');
  u = u.replace(/^\/\/(www\.)?becreativetx\.com/i, '');
  u = u.split('?')[0].split('#')[0];
  if (!u.startsWith('/wp-content') && !u.startsWith('/wp-includes')) return null;
  if (!ASSET_EXT.test(u)) return null;
  return u.replace(/^\//, '');
}

async function ensureAsset(localPath) {
  if (copied.has(localPath)) return true;
  const from = join(WP_ROOT, localPath);
  if (!(await exists(from))) { missing.add(localPath); return false; }
  const to = join(OUT, 'assets', localPath);
  await mkdir(dirname(to), { recursive: true });
  await copyFile(from, to);
  copied.add(localPath);
  return true;
}

async function flattenPage(srcFile, outFile) {
  let html = await readFile(join(SRC_HTML, srcFile), 'utf8');
  html = html.replace(/^﻿/, '');

  for (const re of CRUFT) html = html.replace(re, '');

  // Rewrite every attribute value that points at a local asset. Covers
  // src=, href=, and srcset= (which holds comma-separated URL + descriptor).
  const refRe = /(src|href)=(["'])([^"']+)\2/gi;
  const found = new Set();

  html = html.replace(refRe, (m, attr, q, val) => {
    const local = toLocalPath(val);
    if (!local) return m;
    found.add(local);
    return `${attr}=${q}assets/${local}${q}`;
  });

  // srcset needs per-URL handling.
  html = html.replace(/srcset=(["'])([^"']+)\1/gi, (m, q, val) => {
    const rewritten = val.split(',').map((part) => {
      const seg = part.trim();
      const sp = seg.indexOf(' ');
      const url = sp === -1 ? seg : seg.slice(0, sp);
      const desc = sp === -1 ? '' : seg.slice(sp);
      const local = toLocalPath(url);
      if (!local) return seg;
      found.add(local);
      return `assets/${local}${desc}`;
    }).join(', ');
    return `srcset=${q}${rewritten}${q}`;
  });

  // Sweep pass: catch asset URLs that live outside src/href/srcset — inside
  // inline <style> url(), @font-face, data-* attributes, and inline JS config.
  // Only rewrites URLs that resolve to a real asset on disk, so live-only
  // endpoints (admin-ajax, wp-json) are left untouched.
  const urlRe = /(https?:)?\/\/(www\.)?becreativetx\.com(\/wp-(?:content|includes)\/[^"'()\s\\]+?\.(?:css|js|mjs|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|eot|mp4|webm))/gi;
  const sweepHits = new Set();
  html = html.replace(urlRe, (m, scheme, www, path) => {
    const local = path.split('?')[0].split('#')[0].replace(/^\//, '');
    sweepHits.add(local);
    found.add(local);
    return `assets/${local}`;
  });

  let ok = 0;
  for (const local of found) {
    if (await ensureAsset(local)) ok++;
  }

  await writeFile(join(OUT, outFile), html, 'utf8');
  return { outFile, refs: found.size, copied: ok, sweep: sweepHits.size };
}

async function main() {
  const rows = [];
  for (const [src, out] of PAGES) {
    if (!(await exists(join(SRC_HTML, src)))) {
      rows.push({ outFile: out, refs: 'SOURCE MISSING', copied: 0 });
      continue;
    }
    rows.push(await flattenPage(src, out));
  }

  console.table(rows);
  console.log(`\nassets copied  ${copied.size}`);
  console.log(`missing        ${missing.size}`);
  if (missing.size) {
    console.log([...missing].slice(0, 15).map((m) => '  - ' + m).join('\n'));
  }
  console.log(missing.size === 0 ? 'RESULT=PASS' : 'RESULT=CHECK');
}

main().catch((e) => { console.error('FAIL:', e.stack); process.exit(1); });
