/* The /gallery/ page: one filterable grid of all be creative work.

   Products come from two sources, merged here:
     - the four case-study clients (window.CASE_STUDIES), each product already
       typed, and
     - general work (window.GALLERY.general), typed by folder.

   Filtering is client-side (no reload). Clicking a tile opens a single-image
   view with prev/next scoped to the products currently shown. Apparel is not a
   grid: it renders the two links from the data instead.

   Progressive enhancement: the grid, filters, and zoom are built by this
   script. With JavaScript off, a short note explains the gallery needs it; no
   content is hidden that would otherwise be visible. */

(function () {
  var cfg = window.GALLERY;
  var clients = window.CASE_STUDIES || [];
  var mount = document.getElementById('gallery-root');
  if (!cfg || !mount) return;

  var THUMB = 'assets/gallery/thumb/';
  var FULL = 'assets/gallery/full/';

  // Merge the two sources into one flat product list.
  var products = [];
  clients.forEach(function (c) {
    (c.products || []).forEach(function (p) {
      products.push({ id: p.id, type: p.type, alt: p.alt, client: c.name });
    });
  });
  (cfg.general || []).forEach(function (p) {
    products.push({ id: p.id, type: p.type, alt: p.alt, client: null });
  });

  function countOf(type) {
    return products.filter(function (p) { return p.type === type; }).length;
  }

  var current = 'All';   // active filter
  var shown = [];        // products currently rendered (drives the zoom set)

  /* ---------- page scaffold ---------- */

  var filters = document.createElement('div');
  filters.className = 'gal-filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filter work by type');

  var chips = [];
  function addChip(label, count) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gal-chip';
    b.dataset.filter = label;
    b.setAttribute('aria-pressed', label === current ? 'true' : 'false');
    b.innerHTML = label + (count != null ? ' <span class="gal-count">' + count + '</span>' : '');
    b.addEventListener('click', function () { setFilter(label); });
    filters.appendChild(b);
    chips.push(b);
  }

  addChip('All', products.length);
  (cfg.types || []).forEach(function (t) {
    if (t === 'Apparel') { addChip('Apparel', null); return; } // links, not tiles
    var n = countOf(t);
    if (n) addChip(t, n);
  });

  var grid = document.createElement('ul');
  grid.className = 'gal-grid';

  var apparel = buildApparel();     // hidden until the Apparel filter is active
  var empty = document.createElement('p');
  empty.className = 'gal-empty';
  empty.textContent = 'No work in this category yet.';
  empty.hidden = true;

  mount.appendChild(filters);
  mount.appendChild(grid);
  mount.appendChild(apparel);
  mount.appendChild(empty);

  /* ---------- filtering + grid render ---------- */

  function setFilter(label) {
    current = label;
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', c.dataset.filter === label ? 'true' : 'false');
    });

    if (label === 'Apparel') {
      grid.hidden = true;
      empty.hidden = true;
      apparel.hidden = false;
      shown = [];
      return;
    }

    apparel.hidden = true;
    shown = label === 'All'
      ? products.slice()
      : products.filter(function (p) { return p.type === label; });

    grid.innerHTML = '';
    shown.forEach(function (p, i) {
      var li = document.createElement('li');
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'gal-tile';
      tile.style.animationDelay = Math.min(i * 22, 400) + 'ms';
      tile.setAttribute('aria-label', 'View larger: ' + p.alt);
      var tag = current === 'All' ? '<span class="gal-tag">' + p.type + '</span>' : '';
      tile.innerHTML =
        '<span class="frame"><img src="' + THUMB + p.id + '.webp" alt="' +
        esc(p.alt) + '" loading="' + (i < 8 ? 'eager' : 'lazy') + '" decoding="async"></span>' +
        '<span class="gal-cap">' + esc(p.alt) + '</span>' + tag;
      tile.addEventListener('click', function () { openZoom(i); });
      li.appendChild(tile);
      grid.appendChild(li);
    });

    grid.hidden = shown.length === 0;
    empty.hidden = shown.length !== 0;
  }

  function buildApparel() {
    var wrap = document.createElement('div');
    wrap.className = 'gal-apparel';
    wrap.hidden = true;
    var a = cfg.apparel || {};
    var steps = (a.steps || []).map(function (s) {
      var link = '';
      if (s.link) {
        var ext = s.link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        link = '<a class="gal-apparel-link" href="' + esc(s.link.href) + '"' + ext + '>' +
          esc(s.link.label) + '</a>';
      }
      return '<li><div class="gal-step-body"><p>' + esc(s.text) + '</p>' + link + '</div></li>';
    }).join('');
    wrap.innerHTML =
      (a.heading ? '<h2 class="gal-apparel-h">' + esc(a.heading) + '</h2>' : '') +
      (a.intro ? '<p class="gal-apparel-intro">' + esc(a.intro) + '</p>' : '') +
      '<ol class="gal-steps">' + steps + '</ol>';
    return wrap;
  }

  /* ---------- single-image zoom (reuses the case-studies overlay) ---------- */

  var overlay = document.createElement('div');
  overlay.className = 'cs-overlay';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML =
    '<div class="cs-ov-panel">' +
      '<div class="cs-ov-bar">' +
        '<h2 class="cs-ov-title"></h2>' +
        '<button type="button" class="cs-ov-btn" data-act="close" aria-label="Close">Close</button>' +
      '</div>' +
      '<div class="cs-ov-body">' +
        '<div class="cs-ov-zoom">' +
          '<div></div>' +
          '<figure class="cs-zoom-figure"><img alt=""><figcaption></figcaption></figure>' +
          '<div class="cs-zoom-nav">' +
            '<button type="button" class="cs-ov-btn" data-act="prev">Previous</button>' +
            '<span class="cs-zoom-pos"></span>' +
            '<button type="button" class="cs-ov-btn" data-act="next">Next</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  var elTitle = overlay.querySelector('.cs-ov-title');
  var elImg = overlay.querySelector('.cs-zoom-figure img');
  var elCap = overlay.querySelector('.cs-zoom-figure figcaption');
  var elPos = overlay.querySelector('.cs-zoom-pos');
  var closeBtn = overlay.querySelector('[data-act="close"]');

  var zi = 0;
  var lastFocus = null;

  function openZoom(i) {
    if (!shown.length) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    render(i);
    closeBtn.focus();
  }

  function render(i) {
    zi = (i + shown.length) % shown.length;
    var p = shown[zi];
    elTitle.textContent = current === 'All' ? 'All work' : current;
    elImg.src = FULL + p.id + '.webp';
    elImg.alt = p.alt;
    // alt already names the client/brand, so it stands alone as the caption.
    elCap.textContent = p.alt;
    elPos.textContent = (zi + 1) + ' of ' + shown.length;
  }

  function closeZoom() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) { closeZoom(); return; }
    var act = e.target.getAttribute && e.target.getAttribute('data-act');
    if (act === 'close') closeZoom();
    else if (act === 'prev') render(zi - 1);
    else if (act === 'next') render(zi + 1);
  });

  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') closeZoom();
    else if (e.key === 'ArrowLeft') render(zi - 1);
    else if (e.key === 'ArrowRight') render(zi + 1);
    else if (e.key === 'Tab') {
      var f = overlay.querySelectorAll('button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  setFilter('All');
})();
