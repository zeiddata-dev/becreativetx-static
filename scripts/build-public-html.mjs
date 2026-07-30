// Regenerate public_html/ (the Hostinger upload copy) from .remember/deploy-manifest.txt.
//
// public_html/ is gitignored and is the only thing that gets uploaded, so it has
// to be rebuilt from the manifest rather than hand-edited. The manifest is the
// authority on what ships: anything not listed is left out of the upload, which
// is how a newly added file (css/a11y.css, for one) can be linked by every page
// and still 404 in production.
//
// Order matters. Stamp cache busters first, then build, so the copied HTML and
// the copied assets agree on their ?v= tokens:
//   node scripts/stamp-logo-cache.mjs
//   node scripts/stamp-asset-cache.mjs
//   node scripts/build-public-html.mjs
//
// The previous tree is kept as public_html_prev/ for rollback. Nothing is
// deleted: if public_html_prev/ already exists the build refuses to start so an
// older known-good copy is never silently discarded.

import { mkdir, copyFile, rename, readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const MANIFEST = '.remember/deploy-manifest.txt';
const OUT = 'public_html';
const PREV = 'public_html_prev';

function fail(msg) {
  console.log(`FAIL  ${msg}`);
  console.log('DECISION=FAIL');
  process.exit(1);
}

if (!existsSync(MANIFEST)) fail(`${MANIFEST} not found. Run from the repo root.`);
if (existsSync(PREV)) fail(`${PREV}/ already exists. Move or delete it first so the rollback copy is not overwritten.`);

const entries = (await readFile(MANIFEST, 'utf8'))
  .split(/\r?\n/).map(s => s.trim()).filter(Boolean);

// Validate the whole manifest before touching the existing tree, so a bad
// manifest cannot leave a half-built upload behind.
const missing = [];
const escaping = [];
const root = resolve('.');
for (const rel of entries) {
  if (!resolve(rel).startsWith(root)) { escaping.push(rel); continue; }
  if (!existsSync(rel) || !statSync(rel).isFile()) missing.push(rel);
}
if (escaping.length) fail(`manifest entries point outside the repo:\n  ${escaping.join('\n  ')}`);
if (missing.length) {
  console.log(`FAIL  ${missing.length} manifest entr${missing.length === 1 ? 'y is' : 'ies are'} not on disk:`);
  for (const m of missing) console.log(`        ${m}`);
  console.log('DECISION=FAIL');
  process.exit(1);
}

const duplicates = entries.filter((e, i) => entries.indexOf(e) !== i);
if (duplicates.length) console.log(`WARN  duplicate manifest entries ignored: ${[...new Set(duplicates)].join(', ')}`);

if (existsSync(OUT)) {
  await rename(OUT, PREV);
  console.log(`KEPT     previous tree as ${PREV}/`);
} else {
  console.log(`NOTE     no existing ${OUT}/ to preserve`);
}

let copied = 0;
let bytes = 0;
for (const rel of new Set(entries)) {
  const dest = join(OUT, rel);
  await mkdir(dirname(dest), { recursive: true });
  await copyFile(rel, dest);
  copied += 1;
  bytes += statSync(rel).size;
}

console.log(`BUILT    ${OUT}/  files=${copied}  bytes=${bytes} (${(bytes / 1048576).toFixed(1)} MB)`);
console.log(`ROLLBACK remove ${OUT}/ and rename ${PREV}/ back to ${OUT}/`);
console.log(`DECISION=${copied === new Set(entries).size ? 'PASS' : 'FAIL'} manifest_entries=${new Set(entries).size} copied=${copied}`);
