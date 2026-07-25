// Convert dropped product photos into web-ready gallery images, per client.
//
// Reads product-images/<client>/, where <client> is one of the four case
// studies. Writes two WebP sizes per photo into the gallery:
//   assets/gallery/thumb/  800px wide  - overlay grid
//   assets/gallery/full/  1800px wide  - overlay zoom view
//
// The folder decides the client. The filename becomes the product's alt text,
// so name each file for what it shows, e.g. "printed stadium cups.jpg".
//
// After converting, it prints product entries grouped by client, ready to
// paste into the matching `products` array in js/casestudies-data.js. It never
// edits that file itself, so wording stays under human control.
//
// Run: node scripts/build-gallery-images.mjs

import { mkdir, readdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const SRC = 'product-images';
const OUT = 'assets/gallery';

// Folder -> display name. Matches the four logos on the case-studies page.
const CLIENTS = {
  unitron: 'Unitron Power Systems',
  momentum: 'Momentum Spine & Joint',
  allen: 'City of Allen',
  'box-insurance': 'Box Insurance Agency',
};

// product-images/general/<type>/ -> the /gallery/ page, typed by folder.
// These are not tied to a case-study client; the subfolder is the product type.
const GENERAL = 'general';
const GENERAL_TYPES = {
  design: 'Design',
  print: 'Print',
  promo: 'Promo',
  apparel: 'Apparel',
};

const SIZES = [
  { dir: 'thumb', width: 800, quality: 78 },
  { dir: 'full', width: 1800, quality: 82 },
];

const SOURCE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function slug(file, key) {
  const base = basename(file, extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  // Prefix with the client key so ids stay unique across folders.
  return `${key}-${base}`;
}

function altFromName(file) {
  const stem = basename(file, extname(file));
  const dash = stem.indexOf(' - ');
  const desc = dash === -1 ? stem : stem.slice(dash + 3);
  return desc.trim();
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
  const byClient = {};
  const byType = {};
  let total = 0;

  async function convert(src, id) {
    const meta = await sharp(src).metadata();
    for (const { dir: sz, width, quality } of SIZES) {
      const target = Math.min(width, meta.width);
      await sharp(src).resize({ width: target, withoutEnlargement: true }).webp({ quality })
        .toFile(join(OUT, sz, `${id}.webp`));
    }
    return Math.round((await stat(join(OUT, 'thumb', `${id}.webp`))).size / 1024);
  }

  for (const [key, name] of Object.entries(CLIENTS)) {
    const files = await listImages(join(SRC, key));
    byClient[key] = { name, entries: [] };

    for (const file of files) {
      const id = slug(file, key);
      const thumbKB = await convert(join(SRC, key, file), id);
      const alt = altFromName(file) || 'PLACEHOLDER — describe the piece';
      rows.push({ group: key, id, thumbKB, over: thumbKB > 400 ? 'YES' : '' });
      byClient[key].entries.push(`      { id: '${id}', alt: ${JSON.stringify(alt)} },`);
      total++;
    }
  }

  for (const [type, label] of Object.entries(GENERAL_TYPES)) {
    const files = await listImages(join(SRC, GENERAL, type));
    byType[type] = { label, entries: [] };

    for (const file of files) {
      const id = slug(file, `general-${type}`);
      const thumbKB = await convert(join(SRC, GENERAL, type, file), id);
      const alt = altFromName(file) || 'PLACEHOLDER — describe the piece';
      rows.push({ group: `general/${type}`, id, thumbKB, over: thumbKB > 400 ? 'YES' : '' });
      byType[type].entries.push(`  { id: '${id}', type: '${label}', alt: ${JSON.stringify(alt)} },`);
      total++;
    }
  }

  if (total === 0) {
    console.log('No images found under product-images/<client>/.');
    console.log('Drop photos into product-images/{unitron,momentum,allen,box-insurance} and re-run.');
    return;
  }

  console.table(rows);
  const over = rows.filter((r) => r.over);
  console.log(`converted   ${total}`);
  console.log(`OVER 400KB  ${over.length}${over.length ? ': ' + over.map((r) => r.id).join(', ') : ''}`);

  console.log('\n--- paste each block into the matching client\'s products in js/casestudies-data.js ---');
  for (const [key, { name, entries }] of Object.entries(byClient)) {
    if (!entries.length) continue;
    console.log(`\n// ${name} (${key})`);
    console.log(entries.join('\n'));
  }

  const generalEntries = Object.values(byType).flatMap((t) => t.entries);
  if (generalEntries.length) {
    console.log('\n--- paste into the GENERAL array in js/gallery-data.js (typed by folder) ---');
    for (const { label, entries } of Object.values(byType)) {
      if (!entries.length) continue;
      console.log(`\n  // ${label}`);
      console.log(entries.join('\n'));
    }
  }

  console.log('\n--- end ---');
  console.log(over.length === 0 ? 'RESULT=PASS' : 'RESULT=CHECK');
}

main().catch((err) => { console.error('FAIL:', err.message); process.exit(1); });
