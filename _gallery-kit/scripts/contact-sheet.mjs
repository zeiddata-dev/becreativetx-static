// Builds a labelled contact sheet from gallery thumbnails so the unlabelled
// photos can be reviewed and categorised in one pass.
//
// Run: node scripts/contact-sheet.mjs <slug-prefix> [outfile]

import { readdir, mkdir } from 'node:fs/promises';
import { join, basename, extname, dirname } from 'node:path';
import sharp from 'sharp';

const THUMBS = 'becreativetx-site/assets/gallery/thumb';
const prefix = process.argv[2] ?? '';
const outFile = process.argv[3] ?? 'tmp/contact-sheet.png';

const CELL = 300;
const LABEL = 34;
const COLS = 5;
const PAD = 6;

// A prefix starting with "!" excludes rather than includes.
const exclude = prefix.startsWith('!');
const match = exclude ? prefix.slice(1) : prefix;

const files = (await readdir(THUMBS))
  .filter((f) => {
    if (extname(f) !== '.webp') return false;
    const hit = basename(f, '.webp').startsWith(match);
    return exclude ? !hit : hit;
  })
  .sort();

if (files.length === 0) {
  console.error(`FAIL: no thumbnails matching "${prefix}" in ${THUMBS}`);
  process.exit(1);
}

const rows = Math.ceil(files.length / COLS);
const cellW = CELL + PAD * 2;
const cellH = CELL + LABEL + PAD * 2;

const composites = [];

for (const [i, file] of files.entries()) {
  const id = basename(file, '.webp');
  const col = i % COLS;
  const row = Math.floor(i / COLS);

  const img = await sharp(join(THUMBS, file))
    .resize({ width: CELL, height: CELL, fit: 'contain', background: '#ffffff' })
    .toBuffer();

  composites.push({ input: img, left: col * cellW + PAD, top: row * cellH + PAD });

  const label = `<svg width="${CELL}" height="${LABEL}">
    <rect width="100%" height="100%" fill="#111"/>
    <text x="6" y="22" font-family="monospace" font-size="15" fill="#fff">${i + 1}. ${id}</text>
  </svg>`;

  composites.push({
    input: Buffer.from(label),
    left: col * cellW + PAD,
    top: row * cellH + PAD + CELL,
  });
}

await mkdir(dirname(outFile), { recursive: true });

await sharp({
  create: {
    width: COLS * cellW,
    height: rows * cellH,
    channels: 3,
    background: '#e8e8e8',
  },
})
  .composite(composites)
  .png()
  .toFile(outFile);

console.log(`wrote ${outFile} (${files.length} images, ${COLS}x${rows})`);
