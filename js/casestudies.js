/* Per-client product overlay for the case-studies page.

   Each client logo becomes a button. Clicking it opens a full-screen overlay
   showing that client's products; clicking a product opens a single-image view
   with prev/next scoped to that client. Escape and arrow keys work; focus is
   trapped in the overlay and restored on close.

   Progressive enhancement: the logos and their alt text are already in the
   page. With JavaScript off they simply do not open an overlay — nothing is
   hidden or broken. */

(function () {
  var clients = window.CASE_STUDIES || [];
  if (!clients.length) return;

  var THUMB = 'assets/gallery/thumb/';
  var FULL = 'assets/gallery/full/';

  // Match each on-page logo image to its client via logoMatch, and turn the
  // logo into a button that opens the overlay.
  var logos = [].slice.call(document.querySelectorAll('img[src*="PLAIN-DEBOSS"]'));

  clients.forEach(function (client) {
    var img = logos.filter(function (i) { return i.getAttribute('src').indexOf(client.logoMatch) !== -1; })[0];
    if (!img) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cs-logo-btn';
    btn.setAttribute('aria-label', 'View ' + client.name + ' work (' + client.products.length + ' pieces)');

    var cue = document.createElement('span');
    cue.className = 'cs-logo-cue';
    cue.textContent = 'View work';

    img.parentNode.insertBefore(btn, img);
    btn.appendChild(img);
    btn.appendChild(cue);
    btn.addEventListener('click', function () { openOverlay(client); });
  });

  /* ---------- overlay (built once, reused) ---------- */

  var overlay = document.createElement('div');
  overlay.className = 'cs-overlay';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  // A panel floating over a dimmed backdrop (the page stays visible behind),
  // rather than a full-screen takeover that reads like a new page.
  overlay.innerHTML =
    '<div class="cs-ov-panel">' +
      '<div class="cs-ov-bar">' +
        '<h2 class="cs-ov-title"></h2>' +
        '<button type="button" class="cs-ov-btn" data-act="close" aria-label="Close">Close</button>' +
      '</div>' +
      '<div class="cs-ov-body">' +
        '<div class="cs-ov-grid-wrap"><ul class="cs-ov-grid"></ul></div>' +
        '<div class="cs-ov-zoom" hidden>' +
          '<div><button type="button" class="cs-ov-btn" data-act="back">Back</button></div>' +
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
  var elGridWrap = overlay.querySelector('.cs-ov-grid-wrap');
  var elGrid = overlay.querySelector('.cs-ov-grid');
  var elZoom = overlay.querySelector('.cs-ov-zoom');
  var elZoomImg = overlay.querySelector('.cs-zoom-figure img');
  var elZoomCap = overlay.querySelector('.cs-zoom-figure figcaption');
  var elZoomPos = overlay.querySelector('.cs-zoom-pos');
  var closeBtn = overlay.querySelector('[data-act="close"]');

  var active = null; // current client
  var zi = 0;        // index within the zoom view
  var lastFocus = null;

  function openOverlay(client) {
    active = client;
    lastFocus = document.activeElement;
    elTitle.textContent = client.name;

    elGrid.innerHTML = '';
    client.products.forEach(function (p, i) {
      var li = document.createElement('li');
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'cs-tile';
      tile.setAttribute('aria-label', 'View larger: ' + p.alt);
      tile.innerHTML = '<span class="frame"><img src="' + THUMB + p.id + '.webp" alt="' +
        p.alt.replace(/"/g, '&quot;') + '" loading="' + (i < 3 ? 'eager' : 'lazy') + '" decoding="async"></span>';
      tile.addEventListener('click', function () { showZoom(i); });
      li.appendChild(tile);
      elGrid.appendChild(li);
    });

    showGrid();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function showGrid() {
    elZoom.hidden = true;
    elGridWrap.hidden = false;
  }

  function showZoom(i) {
    zi = (i + active.products.length) % active.products.length;
    var p = active.products[zi];
    elZoomImg.src = FULL + p.id + '.webp';
    elZoomImg.alt = p.alt;
    elZoomCap.textContent = active.name + ' — ' + p.alt;
    elZoomPos.textContent = (zi + 1) + ' of ' + active.products.length;
    elGridWrap.hidden = true;
    elZoom.hidden = false;
  }

  function closeOverlay() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    active = null;
    if (lastFocus) lastFocus.focus();
  }

  overlay.addEventListener('click', function (e) {
    // Clicking the dimmed backdrop (outside the panel) closes the pop-out.
    if (e.target === overlay) { closeOverlay(); return; }
    var act = e.target.getAttribute && e.target.getAttribute('data-act');
    if (act === 'close') closeOverlay();
    else if (act === 'back') showGrid();
    else if (act === 'prev') showZoom(zi - 1);
    else if (act === 'next') showZoom(zi + 1);
  });

  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    var zooming = !elZoom.hidden;
    if (e.key === 'Escape') { if (zooming) showGrid(); else closeOverlay(); }
    else if (zooming && e.key === 'ArrowLeft') showZoom(zi - 1);
    else if (zooming && e.key === 'ArrowRight') showZoom(zi + 1);
    else if (e.key === 'Tab') {
      // Keep focus inside the overlay.
      var f = overlay.querySelectorAll('button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
