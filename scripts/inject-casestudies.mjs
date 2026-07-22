// Wire the per-client overlay assets into the flattened casestudies.html.
//
// The overlay script turns the existing client logos into buttons at runtime,
// so nothing in the page body needs restructuring — this only adds the
// stylesheet and the two scripts (data + behaviour), once each. Idempotent.
//
// Run after flatten.mjs regenerates the page. Run: node scripts/inject-casestudies.mjs

import { readFile, writeFile } from 'node:fs/promises';
import * as cheerio from 'cheerio';

const PAGE = 'casestudies.html';

const HEAD_LINKS = [{ tag: 'link', attr: 'href', val: 'css/casestudies.css' }];
const BODY_SCRIPTS = ['js/casestudies-data.js', 'js/casestudies.js'];

const html = await readFile(PAGE, 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

// Confirm the four logos are present before wiring anything to them.
const logos = $('img[src*="PLAIN-DEBOSS"]');
if (logos.length < 4) {
  console.error(`FAIL: expected 4 client logos, found ${logos.length}. Re-run flatten.mjs first.`);
  process.exit(1);
}

for (const { attr, val } of HEAD_LINKS) {
  if ($(`link[${attr}="${val}"]`).length === 0) {
    $('head').append(`\n<link rel="stylesheet" href="${val}">\n`);
  }
}

for (const src of BODY_SCRIPTS) {
  if ($(`script[src="${src}"]`).length === 0) {
    // Data must load before behaviour; append in listed order.
    $('body').append(`\n<script src="${src}" defer></script>\n`);
  }
}

await writeFile(PAGE, $.html(), 'utf8');

console.log('logos found:', logos.length);
console.log('stylesheet linked:', $('link[href="css/casestudies.css"]').length > 0);
console.log('data script linked:', $('script[src="js/casestudies-data.js"]').length > 0);
console.log('overlay script linked:', $('script[src="js/casestudies.js"]').length > 0);
console.log('RESULT=PASS');
