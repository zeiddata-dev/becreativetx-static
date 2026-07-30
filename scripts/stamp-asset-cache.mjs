// Stamp the site's own css/ and js/ references with a content-hash cache buster.
//
// Same problem the logo stamper solves, one level up: these files keep stable
// filenames across releases, and the server sends a long Cache-Control, so a
// returning visitor keeps running the previously cached bytes. That is how an
// edit to css/home.css or js/home.js ships and still looks unchanged.
//
// Each ref becomes ?v=<first 8 hex of the file's sha256>. The token moves only
// when the bytes move, so untouched files stay cached and an edited file
// invalidates itself. Only css/ and js/ are stamped; the theme assets under
// assets/ already carry their own ?ver= from WordPress.
//
// Idempotent: an existing ?v= is stripped and recomputed from the file.
//
// Run from the repo root, before generating public_html:
//   node scripts/stamp-asset-cache.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ASSET_REF = /(href|src)="((?:css|js)\/[A-Za-z0-9._-]+\.(?:css|js))(\?v=[a-f0-9]+)?"/g;

const roots = ['.', 'public_html'];
const pages = [];
for (const root of roots) {
  if (!existsSync(root)) continue;
  for (const f of readdirSync(root)) {
    if (f.endsWith('.html')) pages.push(root === '.' ? f : join(root, f));
  }
}

const hashes = new Map();
function hashOf(file) {
  if (!hashes.has(file)) {
    hashes.set(file, createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 8));
  }
  return hashes.get(file);
}

let written = 0;
let missing = 0;
const moved = new Set();

for (const page of pages) {
  const base = dirname(page) === '.' ? '' : dirname(page);
  const html = await readFile(page, 'utf8');

  const out = html.replace(ASSET_REF, (match, attr, path, oldToken) => {
    const file = base ? join(base, path) : path;
    if (!existsSync(file)) {
      console.log(`FAIL  ${page}: ${path} referenced but not on disk`);
      missing += 1;
      return match;
    }
    const hash = hashOf(file);
    if ((oldToken ? oldToken.slice(3) : null) !== hash) moved.add(`${file} -> ?v=${hash}`);
    return `${attr}="${path}?v=${hash}"`;
  });

  if (out !== html) {
    await writeFile(page, out);
    written += 1;
    console.log(`UPDATED    ${page}`);
  } else {
    console.log(`UNCHANGED  ${page}`);
  }
}

for (const m of [...moved].sort()) console.log(`  STAMP  ${m}`);
console.log(`DECISION=${missing ? 'FAIL' : 'PASS'} pages_written=${written} missing_assets=${missing}`);
if (missing) process.exitCode = 1;
