// Stamp the case-study client logos with a content-hash cache buster.
//
// The logos keep stable filenames on purpose: js/casestudies-data.js matches
// each client by a `logoMatch` substring ('unitron.webp'), and css/casestudies.css
// sizes Unitron via `img[src*="unitron"]`. Both survive a ?v= suffix, but a
// stable filename plus the server's 30-day Cache-Control means a re-cut logo
// keeps showing the old art in any browser that already visited the page.
//
// So each logo src carries ?v=<first 8 hex of the file's sha256>. The token only
// moves when the bytes move, so unchanged logos stay cached and a re-cut logo
// invalidates itself. Re-run this after replacing any logo, before deploying.
//
// Idempotent: an existing ?v= is stripped and recomputed from the file.
//
// Run: node scripts/stamp-logo-cache.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Every page that renders the logo row. public_html is the Hostinger staging
// mirror; stamping it here keeps the two trees from drifting apart.
const PAGES = ['casestudies.html', 'public_html/casestudies.html'];

const LOGO_SRC = /src="(assets\/gallery\/full\/use_case_media\/([a-z0-9-]+)\.webp)(\?v=[a-f0-9]+)?"/g;

let changed = 0;
let missing = 0;

for (const page of PAGES) {
  if (!existsSync(page)) {
    console.log(`SKIP  ${page} (not present)`);
    continue;
  }

  const base = dirname(page);
  const html = await readFile(page, 'utf8');
  const stamped = [];

  const out = html.replace(LOGO_SRC, (match, path, name, oldToken) => {
    const file = join(base, path);
    if (!existsSync(file)) {
      console.log(`FAIL  ${page}: ${path} referenced but not on disk`);
      missing += 1;
      return match;
    }
    const hash = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 8);
    const was = oldToken ? oldToken.slice(3) : null;
    stamped.push({ name, hash, moved: was !== hash });
    return `src="${path}?v=${hash}"`;
  });

  if (out !== html) {
    await writeFile(page, out);
    changed += 1;
  }

  for (const s of stamped) {
    console.log(`  ${s.moved ? 'STAMP' : 'same '}  ${s.name}.webp -> ?v=${s.hash}`);
  }
  console.log(`${out === html ? 'UNCHANGED' : 'UPDATED'}  ${page} (${stamped.length} logos)`);
}

console.log(`DECISION=${missing ? 'FAIL' : 'PASS'} pages_written=${changed} missing_assets=${missing}`);
if (missing) process.exitCode = 1;
