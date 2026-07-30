/* Home page: turn the "What they say" carousel into a continuous horizontal
   auto-scroll so it is obvious there are more testimonials than the first few.

   The section ships as a Salient/Flickity slider. This waits until the page has
   loaded (so Flickity has initialised), tears that slider down, and rebuilds the
   quotes into a simple scrolling track that:
     - auto-scrolls left to right, looping seamlessly (the set is duplicated),
     - can also be scrolled or swiped by hand,
     - pauses while hovered, focused, or touched,
     - falls back to a plain manual scroller under reduced-motion.

   Each star rating is moved out of the quote paragraph so the quote text can be
   clamped to a uniform height without hiding the stars. */

(function () {
  function init() {
    var host = document.querySelector('.testimonial_slider');
    if (!host || host.dataset.tmReady) return;
    var quotes = [].slice.call(host.querySelectorAll('blockquote'));
    if (quotes.length < 2) return;
    host.dataset.tmReady = '1';

    // Rebuild each quote: move the star rating out of the <p> so clamping the
    // quote text does not also clip the stars.
    var holder = document.createElement('div');
    quotes.forEach(function (q) {
      var c = q.cloneNode(true);
      // Flickity leaves inline position/left/width on each cell; drop it so the
      // card flows in the flex track instead of being absolutely positioned.
      c.removeAttribute('style');
      var p = c.querySelector('p');
      var stars = c.querySelector('.star-rating-wrap');
      if (stars) {
        // The theme stars use Font Awesome, whose webfont is missing (renders
        // as empty boxes). Every rating here is five stars, so draw them
        // directly with unicode instead.
        stars.innerHTML = '<span class="tm-stars" aria-label="Five out of five stars">★★★★★</span>';
        if (p) p.parentNode.insertBefore(stars, p.nextSibling);
      }
      holder.appendChild(c);
    });
    var setHtml = holder.innerHTML;

    // Tear down Flickity if it initialised, then replace the slider markup.
    try { if (window.jQuery && window.jQuery(host).data('flickity')) window.jQuery(host).flickity('destroy'); } catch (e) {}

    host.classList.add('tm-host');
    // Drop the hook class the theme's slider keys on, so a late Flickity init
    // cannot grab this node and re-stack the quotes.
    host.classList.remove('testimonial_slider');
    // Two copies back to back give a seamless loop.
    host.innerHTML = '<div class="tm-scroller" tabindex="0" aria-label="Customer testimonials"><div class="tm-track">' + setHtml + setHtml + '</div></div>';

    var scroller = host.querySelector('.tm-scroller');
    var track = host.querySelector('.tm-track');

    var paused = false;
    ['mouseenter', 'focusin', 'pointerdown', 'touchstart'].forEach(function (ev) {
      scroller.addEventListener(ev, function () { paused = true; }, { passive: true });
    });
    ['mouseleave', 'focusout', 'pointerup', 'touchend'].forEach(function (ev) {
      scroller.addEventListener(ev, function () { paused = false; }, { passive: true });
    });

    var half = 0;
    function measure() { half = track.scrollWidth / 2; }
    measure();
    window.addEventListener('resize', measure);

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // static: the row is still scrollable by hand

    var speed = 0.5; // px per frame, ~30px/s
    function tick() {
      if (!paused && half > 0) {
        scroller.scrollLeft += speed;
        if (scroller.scrollLeft >= half) scroller.scrollLeft -= half;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Build as soon as the DOM is parsed (not on window 'load'), so the quotes
  // never sit stacked while images finish loading. Also re-run on load as a
  // safety net in case the theme slider initialised late.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
