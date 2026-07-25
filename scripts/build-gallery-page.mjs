// Build gallery.html by cloning the chrome of an existing flattened page.
//
// The /gallery/ page was never in the crawl, so it cannot be flattened like the
// others. Instead we borrow a real page's head, header nav, and footer (so the
// site chrome renders identically) and swap the content region for the gallery
// mount, wiring in the gallery CSS/JS.
//
// Source of chrome: commercial-printing.html (a light service page, no slider).
// Idempotent: re-running regenerates gallery.html from the current source.
//
// Run: node scripts/build-gallery-page.mjs

import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'commercial-printing.html';
const OUT = 'gallery.html';

const HEAD_LINKS =
  '<link rel="stylesheet" href="css/casestudies.css">\n' +
  '<link rel="stylesheet" href="css/gallery.css">\n';

const SCRIPTS =
  '<script src="js/casestudies-data.js" defer></script>\n' +
  '<script src="js/gallery-data.js" defer></script>\n' +
  '<script src="js/gallery.js" defer></script>\n';

// The content that replaces everything between the two content wrappers.
const CONTENT =
  '<div class="container-wrap">\n' +
  '\t<div class="container main-content">\n' +
  '\t\t<div id="gallery-root" class="gal-wrap">\n' +
  '\t\t\t<div class="gal-intro">\n' +
  '\t\t\t\t<h1>Our Work</h1>\n' +
  '\t\t\t\t<p>A cross-section of what we design, print, and produce for our clients. ' +
  'Filter by type, or browse everything, then click any piece to see it up close.</p>\n' +
  '\t\t\t</div>\n' +
  '\t\t\t<noscript><p class="gal-nojs">The gallery needs JavaScript to browse and ' +
  'filter work. Please enable it, or explore our services from the menu above.</p></noscript>\n' +
  '\t\t</div>\n' +
  '\t</div>\n' +
  '</div><!--/container-wrap-->';

function replaceBetween(html, startMark, endMark, replacement, label) {
  const start = html.indexOf(startMark);
  if (start === -1) throw new Error(`start marker not found: ${label}`);
  const end = html.indexOf(endMark, start);
  if (end === -1) throw new Error(`end marker not found: ${label}`);
  return html.slice(0, start) + replacement + html.slice(end + endMark.length);
}

const src = await readFile(SRC, 'utf8');
let out = src;

// Title.
out = out.replace(/<title>[^<]*<\/title>/, '<title>Our Work &#8211; be creative</title>');

// Content region: from the opening container-wrap to its closing comment.
out = replaceBetween(out, '<div class="container-wrap">', '</div><!--/container-wrap-->', CONTENT, 'content');

// Assets: CSS into <head>, scripts before </body>.
out = out.replace('</head>', HEAD_LINKS + '</head>');
out = out.replace('</body>', SCRIPTS + '</body>');

// Sanity checks.
const checks = {
  'gallery-root present': out.includes('id="gallery-root"'),
  'gallery.js linked': out.includes('js/gallery.js'),
  'gallery.css linked': out.includes('css/gallery.css'),
  'single content mount': (out.match(/id="gallery-root"/g) || []).length === 1,
  'header kept': out.includes('<header id="top">'),
  'footer kept': out.includes('id="footer-outer"'),
  'old body content gone': !out.includes('apparelAsset-106-scaled'),
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

await writeFile(OUT, out, 'utf8');
console.log(`wrote ${OUT} (${Math.round(out.length / 1024)} KB)`);
for (const [k, ok] of Object.entries(checks)) console.log(`${ok ? 'PASS' : 'FAIL'}  ${k}`);
console.log(failed.length ? `RESULT=FAIL (${failed.join(', ')})` : 'RESULT=PASS');
