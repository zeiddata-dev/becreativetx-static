// Convert dropped product photos into web-ready gallery images.
//
// Reads product-images/<category>/, where <category> is one of print, promo,
// apparel, design. Writes two WebP sizes per photo into the live gallery:
//   assets/gallery/thumb/  800px wide  - grid tiles
//   assets/gallery/full/  1800px wide  - lightbox view
//
// Filename convention (optional but recommended):
//   "Client Name - short description.jpg"
//     client  = "Client Name"
//     alt     = "short description"
//   A name without " - " leaves the client blank and uses the whole name as alt.
//
// After converting, it prints catalogue entries ready to paste into
// js/gallery-data.js. It never edits that file itself, so the wording stays
// under human control. Then run scripts/build-gallery-html.mjs to lay tiles.
//
// Run: node scripts/build-gallery-images.mjs

import { mkdir, readdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const SRC = 'product-images';
const OUT = 'assets/gallery';
const CATEGORIES = ['print', 'promo', 'apparel', 'design'];

const SIZES = [
  { dir: 'thumb', width: 800, quality: 78 },
  { dir: 'full', width: 1800, quality: 82 },
];

const SOURCE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function slug(file) {
  return basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// "Client - description.jpg" -> { client, alt }
function parseName(file) {
  const stem = basename(file, extname(file));
  const dash = stem.indexOf(' - ');
  if (dash === -1) return { client: '', alt: stem };
  return { client: stem.slice(0, dash).trim(), alt: stem.slice(dash + 3).trim() };
}

async function listImages(dir) {
  try {
    return (await readdir(dir)).filter((f) => SOURCE_EXT.has(extname(f).toLowerCase()));
  } catch {
    return [];
  }
}

async function main() {
  for (const { dir } of SIZES) await mkdir(join(OUT, dir), { recursive: true });

  const rows = [];
  const entries = [];
  const perCat = {};

  for (const cat of CATEGORIES) {
    const dir = join(SRC, cat);
    const files = await listImages(dir);
    perCat[cat] = files.length;

    for (const file of files) {
      const id = slug(file);
      const src = join(dir, file);
      const meta = await sharp(src).metadata();

      for (const { dir: sz, width, quality } of SIZES) {
        const target = Math.min(width, meta.width);
        await sharp(src).resize({ width: target, withoutEnlargement: true }).webp({ quality })
          .toFile(join(OUT, sz, `${id}.webp`));
      }

      const thumbKB = Math.round((await stat(join(OUT, 'thumb', `${id}.webp`))).size / 1024);
      const { client, alt } = parseName(file);
      rows.push({ id, cat, thumbKB, over: thumbKB > 400 ? 'YES' : '' });
      entries.push(`  { id: '${id}', cat: '${cat}', client: ${JSON.stringify(client)}, alt: ${JSON.stringify(alt || 'PLACEHOLDER — describe the piece')} },`);
    }
  }

  const total = rows.length;

  if (total === 0) {
    console.log('No images found under product-images/<category>/.');
    console.log('Drop photos into product-images/promo, /print, /apparel, or /design and re-run.');
    return;
  }

  console.table(rows);
  console.log('\nby category:', CATEGORIES.map((c) => `${c} ${perCat[c]}`).join('   '));

  const over = rows.filter((r) => r.over);
  console.log(`converted   ${total}`);
  console.log(`OVER 400KB  ${over.length}${over.length ? ': ' + over.map((r) => r.id).join(', ') : ''}`);

  console.log('\n--- paste into js/gallery-data.js (review client + alt first) ---');
  console.log(entries.join('\n'));
  console.log('--- end ---');
  console.log(over.length === 0 ? 'RESULT=PASS' : 'RESULT=CHECK');
}

main().catch((err) => { console.error('FAIL:', err.message); process.exit(1); });
