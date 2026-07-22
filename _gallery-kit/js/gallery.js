/* Filterable product gallery with a lightbox.

   Progressive enhancement. The tiles are static markup written into the page
   by scripts/build-gallery-html.mjs, so with JavaScript off the gallery still
   renders every piece. This file only adds the filter bar and the lightbox,
   and it reads the DOM rather than any data file. */

(function () {
  var grid = document.getElementById('gallery-grid');
  var filterHost = document.getElementById('gallery-filters');
  if (!grid || !filterHost) return;

  var all = Array.prototype.slice.call(grid.querySelectorAll('.gal-item'));
  if (all.length === 0) return;

  var LABELS = { print: 'Print', promo: 'Promo', apparel: 'Apparel', design: 'Design' };
  var ORDER = ['print', 'promo', 'apparel', 'design'];

  // Only offer a filter for a category that has work in it. Adding items to
  // gallery-data.js and re-running the generator makes its filter appear.
  var present = ORDER.filter(function (cat) {
    return all.some(function (li) { return li.getAttribute('data-cat') === cat; });
  });

  var visible = all.slice();

  /* ---------- filter bar ---------- */

  var bar = document.createElement('div');
  bar.className = 'gal-filters';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Filter work by service');

  var count = document.createElement('p');
  count.className = 'gal-count';
  count.setAttribute('aria-live', 'polite');

  ['all'].concat(present).forEach(function (cat) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gal-filter';
    b.textContent = cat === 'all' ? 'All' : LABELS[cat];
    b.setAttribute('data-cat', cat);
    b.setAttribute('aria-pressed', String(cat === 'all'));
    b.addEventListener('click', function () { setFilter(cat); });
    bar.appendChild(b);
  });

  bar.appendChild(count);
  filterHost.appendChild(bar);

  function setFilter(cat) {
    visible = [];

    all.forEach(function (li) {
      var on = cat === 'all' || li.getAttribute('data-cat') === cat;
      li.hidden = !on;
      if (on) visible.push(li);
    });

    Array.prototype.forEach.call(bar.querySelectorAll('.gal-filter'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === cat));
    });

    count.textContent = visible.length + (visible.length === 1 ? ' piece' : ' pieces');
  }

  /* ---------- lightbox ---------- */

  var lb = document.createElement('div');
  lb.className = 'gal-lightbox';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Enlarged image');
  lb.innerHTML =
    '<div class="gal-lb-bar"><button type="button" class="gal-lb-btn" data-act="close">Close</button></div>' +
    '<figure class="gal-lb-figure"><img alt=""><figcaption></figcaption></figure>' +
    '<div class="gal-lb-nav">' +
    '<button type="button" class="gal-lb-btn" data-act="prev">Previous</button>' +
    '<span class="gal-lb-position"></span>' +
    '<button type="button" class="gal-lb-btn" data-act="next">Next</button>' +
    '</div>';

  document.body.appendChild(lb);

  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('figcaption');
  var lbPos = lb.querySelector('.gal-lb-position');
  var closeBtn = lb.querySelector('[data-act="close"]');
  var index = 0;
  var lastFocus = null;

  function show(i) {
    index = (i + visible.length) % visible.length;
    var li = visible[index];
    var img = li.querySelector('img');

    lbImg.src = 'assets/gallery/full/' + li.getAttribute('data-id') + '.webp';
    lbImg.alt = img.alt;
    lbCap.textContent = li.getAttribute('data-client') + ' — ' + img.alt;
    lbPos.textContent = index + 1 + ' of ' + visible.length;
  }

  function openLightbox(li) {
    index = visible.indexOf(li);
    if (index < 0) return;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    show(index);
    closeBtn.focus();
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  all.forEach(function (li) {
    li.querySelector('.gal-tile').addEventListener('click', function () { openLightbox(li); });
  });

  lb.addEventListener('click', function (e) {
    var act = e.target.getAttribute && e.target.getAttribute('data-act');
    if (act === 'close') closeLightbox();
    if (act === 'prev') show(index - 1);
    if (act === 'next') show(index + 1);
  });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'Tab') {
      // Keep tab focus inside the dialog while it is open.
      var f = lb.querySelectorAll('button');
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  setFilter('all');
})();
