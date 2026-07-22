// Converts curated source art into web-ready gallery images.
//
// Reads assets_curated/, writes two WebP sizes per image into the static site:
//   assets/gallery/thumb/  800px wide  - grid tiles
//   assets/gallery/full/  1800px wide  - lightbox view
//
// Sources are PNG/JPEG up to 4.7MB. The site README caps delivered images at
// about 400KB; WebP at these widths lands well under that.
//
// Run: node scripts/build-gallery-images.mjs

import { mkdir, readdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const SRC = 'assets_curated';
const OUT = 'becreativetx-site/assets/gallery';

const SIZES = [
  { dir: 'thumb', width: 800, quality: 78 },
  { dir: 'full', width: 1800, quality: 82 },
];

const SOURCE_EXT = new Set(['.png', '.jpg', '.jpeg']);

// Slug used for both the output filename and the manifest key.
function slug(file) {
  return basename(file, extname(file))
    .toLowerCase()
    .replace(/-?e\d{13,}$/, '')      // WordPress edit-timestamp suffixes
    .replace(/-scaled$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  for (const { dir } of SIZES) {
    await mkdir(join(OUT, dir), { recursive: true });
  }

  const files = (await readdir(SRC)).filter((f) => SOURCE_EXT.has(extname(f).toLowerCase()));

  if (files.length === 0) {
    console.error(`FAIL: no source images found in ${SRC}`);
    process.exit(1);
  }

  const rows = [];

  for (const file of files) {
    const id = slug(file);
    const src = join(SRC, file);
    const meta = await sharp(src).metadata();

    for (const { dir, width, quality } of SIZES) {
      // Never upscale: a source narrower than the target keeps its own width.
      const target = Math.min(width, meta.width);
      await sharp(src)
        .resize({ width: target, withoutEnlargement: true })
        .webp({ quality })
        .toFile(join(OUT, dir, `${id}.webp`));
    }

    const outSize = (await stat(join(OUT, 'thumb', `${id}.webp`))).size;
    rows.push({
      id,
      source: file,
      width: meta.width,
      height: meta.height,
      orientation: meta.height > meta.width ? 'portrait' : 'landscape',
      thumbKB: Math.round(outSize / 1024),
    });
  }

  rows.sort((a, b) => a.id.localeCompare(b.id));

  const overBudget = rows.filter((r) => r.thumbKB > 400);
  const srcMB = (
    (await Promise.all(files.map(async (f) => (await stat(join(SRC, f))).size))).reduce((a, b) => a + b, 0) /
    1048576
  ).toFixed(1);

  console.table(rows.map(({ id, width, height, orientation, thumbKB }) => ({ id, width, height, orientation, thumbKB })));
  console.log(`\nconverted   ${rows.length} images`);
  console.log(`source      ${srcMB}MB`);
  console.log(`OVER 400KB  ${overBudget.length}${overBudget.length ? ': ' + overBudget.map((r) => r.id).join(', ') : ''}`);
  console.log(overBudget.length === 0 ? 'RESULT=PASS' : 'RESULT=CHECK');
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
