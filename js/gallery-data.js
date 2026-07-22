/* Gallery contents.
   Plain global assignment rather than JSON + fetch, so the site keeps working
   when opened directly from disk (file://), as the README promises.

   Each entry:
     id       matches assets/gallery/{thumb,full}/<id>.webp
     cat      print | promo | apparel | design
     client   brand visible on the piece, or "" for be creative's own work
     alt      describes what is shown; no claims beyond the photograph

   Categories with no entries do not render a filter. Add items here and the
   filter appears on its own. */

window.GALLERY_ITEMS = [
  /* ---------- promotional products ---------- */
  { id: 'img-1869', cat: 'promo', client: 'City of Allen', alt: 'Two stadium cups printed with the City of Allen logo.' },
  { id: 'img-1873', cat: 'promo', client: 'City of Allen', alt: 'Blue terry cloth zip pouch embroidered for City of Allen Purchasing.' },
  { id: 'img-1874', cat: 'promo', client: 'Visit Allen Texas', alt: 'Canvas zip pouch printed with a line-drawn floral pattern and the Visit Allen Texas mark.' },
  { id: 'img-1880', cat: 'promo', client: 'City of Allen', alt: 'Two engraved pens in an open rosewood presentation case.' },
  { id: 'img-1881', cat: 'promo', client: 'City of Allen', alt: 'Closed rosewood pen case engraved in gold with the City of Allen logo.' },

  { id: 'img-1871', cat: 'promo', client: 'Momentum Spine & Joint', alt: 'Rocks glass printed with the Momentum Spine and Joint logo.' },
  { id: 'img-1875', cat: 'promo', client: 'Momentum Spine & Joint', alt: 'Blue multi-tool card with ruler markings and the Momentum Spine and Joint logo.' },
  { id: 'img-1876', cat: 'promo', client: 'Momentum Spine & Joint', alt: 'Kraft-cover notebook foil-stamped with the Momentum Spine and Joint logo.' },
  { id: 'img-1877', cat: 'promo', client: 'Momentum Spine & Joint', alt: 'Handheld folding fan branded for Momentum Spine and Joint.' },
  { id: 'img-1878', cat: 'promo', client: 'Momentum Spine & Joint', alt: 'Frosted plastic cup printed with the Momentum Spine and Joint logo.' },
  { id: 'img-1879', cat: 'promo', client: 'Momentum Spine & Joint', alt: 'Printed cocktail napkins with a decorative border and the Momentum Spine and Joint logo.' },

  { id: 'img-1883', cat: 'promo', client: 'Unitron Power Systems', alt: 'White wall charger printed with the Unitron Power Systems logo.' },
  { id: 'img-1885', cat: 'promo', client: 'Unitron Power Systems', alt: 'Swivel USB flash drive printed with the Unitron Power Systems logo.' },
  { id: 'img-1887', cat: 'promo', client: 'Unitron Power Systems', alt: 'Two black microfiber pouches printed for Atlas Marine Systems and Unitron Power Systems.' },
  { id: 'img-1886', cat: 'promo', client: 'Atlas Marine Systems', alt: 'Blue swivel USB flash drive printed with the Atlas Marine Systems logo.' },

  { id: 'img-1882', cat: 'promo', client: 'Box Insurance Agency', alt: 'Leather and metal carabiner keychain stamped with the Box Insurance Agency mark.' },
  { id: 'img-1889', cat: 'promo', client: 'Box Insurance Agency', alt: 'Packaged navy blanket branded with the Box Insurance Agency mark.' },
  { id: 'img-1890', cat: 'promo', client: 'Box Insurance Agency', alt: 'Four insulated water bottles in olive, blue, white, and black, branded with the Box Insurance Agency mark.' },
  { id: 'box-keychain', cat: 'promo', client: 'Box Insurance Agency', alt: 'Leather strap keychain with a metal clip, stamped with the Box Insurance Agency mark.' },
  { id: 'box-flashlight', cat: 'promo', client: 'Box Insurance Agency', alt: 'Black aluminium flashlight branded for Box Insurance Agency.' },
  { id: 'box-knife', cat: 'promo', client: 'Box Insurance Agency', alt: 'Folding waiter-style corkscrew with a wooden handle.' },
  { id: 'box-solar-charger', cat: 'promo', client: 'Box Insurance Agency', alt: 'Solar power bank with a carabiner and compass.' },

  { id: 'img-1884', cat: 'promo', client: 'Foxcart', alt: 'Yellow microfiber cleaning cloth printed with the Foxcart logo.' },

  { id: 'img-1868', cat: 'promo', client: '', alt: 'Solar power bank with a built-in compass and carabiner clip.' },
  { id: 'img-1870', cat: 'promo', client: '', alt: 'Cast metal money clip in the shape of a dollar sign.' },
  { id: 'img-1872', cat: 'promo', client: '', alt: 'Turned wooden back scratcher with a shaped handle.' },
  { id: 'img-1888', cat: 'promo', client: '', alt: 'Black folding multi-tool opened to show pliers, blades, and a saw.' },
  { id: 'promo-1', cat: 'promo', client: '', alt: 'Showroom display of printed banners, lanyards, and branded samples.' },

  /* ---------- design and identity ---------- */
  { id: 'allen-plain-deboss', cat: 'design', client: 'City of Allen', alt: 'Visit Allen Texas wordmark rendered as a blind deboss.' },
  { id: 'box-plain-deboss', cat: 'design', client: 'Box Insurance Agency', alt: 'Box Insurance Agency logo rendered as a blind deboss.' },
  { id: 'box-insuirance-logo-teal', cat: 'design', client: 'Box Insurance Agency', alt: 'Box Insurance Agency logo in teal, showing the cube mark and wordmark.' },
  { id: 'legacy-plain-deboss', cat: 'design', client: 'Legacy Housing', alt: 'Legacy Housing script logo rendered as a blind deboss.' },
  { id: 'legacy-blue-debossed', cat: 'design', client: 'Legacy Housing', alt: 'Legacy Housing script logo debossed and filled in blue.' },
  { id: 'momentum-logo-teal', cat: 'design', client: 'Momentum Spine & Joint', alt: 'Momentum Spine and Joint logo in teal, showing the spine mark and wordmark.' },
  { id: 'momentum-plain-deboss', cat: 'design', client: 'Momentum Spine & Joint', alt: 'Momentum Spine and Joint logo rendered as a blind deboss.' },
  { id: 'momentum-stacked-plain-deboss', cat: 'design', client: 'Momentum Spine & Joint', alt: 'Stacked lockup of the Momentum Spine and Joint logo rendered as a blind deboss.' },
  { id: 'unitron-plain-deboss', cat: 'design', client: 'Unitron Power Systems', alt: 'Unitron Power Systems logo rendered as a blind deboss.' },

  /* ---------- print ----------
     No approved client print pieces are in the curated set yet. The antique
     press photograph is atmosphere, not client work, and the studio business
     cards derive from a stock template. Add real printed pieces here. */

  /* ---------- apparel ----------
     No photographs of produced apparel are in the curated set yet. The only
     apparel image available is a purchased stock mockup, which DESIGN.md
     Section 3 bars from the site. Add real garment photography here. */
];
