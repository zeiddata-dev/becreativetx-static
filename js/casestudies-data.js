/* Case-study clients and their products.

   The case-studies page shows four client logos. Clicking one opens an overlay
   of just that client's products. This file defines the four clients, how each
   maps to its logo image on the page, and which product photos belong to it.

   The deboss/identity marks are intentionally not listed here — they are the
   logos on the page, not products in the gallery.

   Product ids match assets/gallery/{thumb,full}/<id>.webp. alt describes only
   what the photo shows. When real reworked photography is dropped into
   product-images/<key>/ and rebuilt, this file is regenerated. */

window.CASE_STUDIES = [
  {
    key: 'unitron',
    name: 'Unitron Power Systems',
    logoMatch: 'UNITRON-PLAIN-DEBOSS',
    products: [
      { id: 'img-1883', alt: 'White wall charger printed with the Unitron Power Systems logo.' },
      { id: 'img-1885', alt: 'Swivel USB flash drive printed with the Unitron Power Systems logo.' },
      { id: 'img-1887', alt: 'Two black microfiber pouches printed for Atlas Marine Systems and Unitron Power Systems.' },
    ],
  },
  {
    key: 'momentum',
    name: 'Momentum Spine & Joint',
    logoMatch: 'MOMENTUM-STACKED-PLAIN-DEBOSS',
    products: [
      { id: 'img-1871', alt: 'Rocks glass printed with the Momentum Spine and Joint logo.' },
      { id: 'img-1875', alt: 'Blue multi-tool card with ruler markings and the Momentum Spine and Joint logo.' },
      { id: 'img-1876', alt: 'Kraft-cover notebook foil-stamped with the Momentum Spine and Joint logo.' },
      { id: 'img-1877', alt: 'Handheld folding fan branded for Momentum Spine and Joint.' },
      { id: 'img-1878', alt: 'Frosted plastic cup printed with the Momentum Spine and Joint logo.' },
      { id: 'img-1879', alt: 'Printed cocktail napkins with a decorative border and the Momentum Spine and Joint logo.' },
    ],
  },
  {
    key: 'allen',
    name: 'City of Allen',
    logoMatch: 'ALLEN-PLAIN-DEBOSS',
    products: [
      { id: 'img-1869', alt: 'Two stadium cups printed with the City of Allen logo.' },
      { id: 'img-1873', alt: 'Blue terry cloth zip pouch embroidered for City of Allen Purchasing.' },
      { id: 'img-1874', alt: 'Canvas zip pouch printed with a line-drawn floral pattern and the Visit Allen Texas mark.' },
      { id: 'img-1880', alt: 'Two engraved pens in an open rosewood presentation case.' },
      { id: 'img-1881', alt: 'Closed rosewood pen case engraved in gold with the City of Allen logo.' },
    ],
  },
  {
    key: 'box',
    name: 'Box Insurance Agency',
    logoMatch: 'BOX-PLAIN-DEBOSS',
    products: [
      { id: 'img-1882', alt: 'Leather and metal carabiner keychain stamped with the Box Insurance Agency mark.' },
      { id: 'img-1889', alt: 'Packaged navy blanket branded with the Box Insurance Agency mark.' },
      { id: 'img-1890', alt: 'Four insulated water bottles in olive, blue, white, and black, branded with the Box Insurance Agency mark.' },
      { id: 'box-keychain', alt: 'Leather strap keychain with a metal clip, stamped with the Box Insurance Agency mark.' },
      { id: 'box-flashlight', alt: 'Black aluminium flashlight branded for Box Insurance Agency.' },
      { id: 'box-knife', alt: 'Folding waiter-style corkscrew with a wooden handle.' },
      { id: 'box-solar-charger', alt: 'Solar power bank with a carabiner and compass.' },
    ],
  },
];
