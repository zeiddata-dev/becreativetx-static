/* Case-study clients and their products.

   The case-studies page shows four client logos. Clicking one opens an overlay
   of just that client's products. This file defines the four clients, how each
   maps to its logo image on the page, and which product photos belong to it.

   The deboss/identity marks are intentionally not listed here — they are the
   logos on the page, not products in the gallery.

   Product ids match assets/gallery/{thumb,full}/<id>.webp. alt describes only
   what the photo shows. All four clients point at the reworked photography
   dropped into product-images/<key>/ and rebuilt via
   scripts/build-gallery-images.mjs.

   Each product also carries a `type` (Design / Print / Promo / Apparel). The
   case-studies overlay ignores it; the /gallery/ page uses it to filter. Types
   were assigned by sight: printed paper collateral is Print, branded physical
   items are Promo. A few judgement calls are flagged FLAG for review. */

window.CASE_STUDIES = [
  {
    key: 'unitron',
    name: 'Unitron Power Systems',
    logoMatch: 'UNITRON-PLAIN-DEBOSS',
    products: [
      { id: 'unitron-unitron-four-port-charger-hero', type: 'Promo', alt: 'Four-port USB wall charger branded for Unitron Power Systems.' },
      { id: 'unitron-unitron-usb-drive-hero', type: 'Promo', alt: 'Swivel USB flash drive branded for Unitron Power Systems.' },
      { id: 'unitron-unitron-keychain-tool-hero', type: 'Promo', alt: 'Multi-function keychain tool branded for Unitron Power Systems.' },
      { id: 'unitron-unitron-zipper-pouch-hero', type: 'Promo', alt: 'Zippered accessory pouch branded for Unitron Power Systems.' },
      { id: 'unitron-atlas-marine-usb-drive-hero', type: 'Promo', alt: 'Swivel USB flash drive branded for Atlas Marine Systems.' },
      { id: 'unitron-atlas-marine-zipper-pouch-hero', type: 'Promo', alt: 'Zippered accessory pouch branded for Atlas Marine Systems.' },
    ],
  },
  {
    key: 'momentum',
    name: 'Momentum Spine & Joint',
    logoMatch: 'MOMENTUM-STACKED-PLAIN-DEBOSS',
    products: [
      { id: 'momentum-01-branded-napkins', type: 'Promo', alt: 'Printed cocktail napkins branded for Momentum Spine & Joint.' }, // FLAG: paper good, could be Print
      { id: 'momentum-02-drink-stirrers-product', type: 'Promo', alt: 'Branded drink stirrers shown as a product shot for Momentum Spine & Joint.' },
      { id: 'momentum-03-drink-stirrers-in-use', type: 'Promo', alt: 'Branded drink stirrers shown in use in a drink for Momentum Spine & Joint.' },
      { id: 'momentum-04-location-map', type: 'Print', alt: 'Printed location map card for Momentum Spine & Joint.' },
      { id: 'momentum-05-contact-directory', type: 'Print', alt: 'Printed contact directory card for Momentum Spine & Joint.' },
      { id: 'momentum-06-branded-shot-glass', type: 'Promo', alt: 'Shot glass printed with the Momentum Spine & Joint logo.' },
      { id: 'momentum-07-laser-cut-invitation', type: 'Print', alt: 'Laser-cut invitation printed for Momentum Spine & Joint.' }, // FLAG: laser-cut, could be Design
      { id: 'momentum-08-ruler-letter-opener', type: 'Promo', alt: 'Combination ruler and letter opener branded for Momentum Spine & Joint.' },
      { id: 'momentum-09-kraft-notebook', type: 'Promo', alt: 'Kraft-cover notebook branded for Momentum Spine & Joint.' },
      { id: 'momentum-10-ergonomic-wrist-rest-set', type: 'Promo', alt: 'Ergonomic wrist rest set branded for Momentum Spine & Joint.' },
      { id: 'momentum-11-handheld-fan', type: 'Promo', alt: 'Handheld folding fan branded for Momentum Spine & Joint.' },
      { id: 'momentum-12-translucent-cup', type: 'Promo', alt: 'Translucent plastic cup printed with the Momentum Spine & Joint logo.' },
    ],
  },
  {
    key: 'allen',
    name: 'City of Allen',
    logoMatch: 'ALLEN-PLAIN-DEBOSS',
    products: [
      { id: 'allen-01-city-of-allen-bag-dispenser', type: 'Promo', alt: 'Bag dispenser branded with the City of Allen logo.' },
      { id: 'allen-02-city-of-allen-cups', type: 'Promo', alt: 'Stadium cups printed with the City of Allen logo.' },
      { id: 'allen-03-allen-fire-rescue-print', type: 'Print', alt: 'Printed piece for Allen Fire Rescue.' },
      { id: 'allen-04-visit-allen-relax-item', type: 'Promo', alt: 'Relaxation item branded for Visit Allen, Texas.' },
      { id: 'allen-05-visit-allen-bamboo-shoehorn', type: 'Promo', alt: 'Bamboo shoehorn branded for Visit Allen, Texas.' },
      { id: 'allen-06-city-of-allen-microfiber-cloth', type: 'Promo', alt: 'Microfiber cloth printed with the City of Allen logo.' },
      { id: 'allen-07-life-canvas-portfolio', type: 'Promo', alt: 'Canvas zip portfolio branded for the City of Allen.' },
      { id: 'allen-08-visit-allen-floral-pouch', type: 'Promo', alt: 'Zip pouch printed with a floral pattern for Visit Allen, Texas.' },
      { id: 'allen-09-city-of-allen-soil-tester', type: 'Promo', alt: 'Soil tester branded with the City of Allen logo.' },
      { id: 'allen-10-city-of-allen-pen-set', type: 'Promo', alt: 'Engraved pen set in a presentation case for the City of Allen.' },
      { id: 'allen-11-visit-allen-meeting-bottle', type: 'Promo', alt: 'Insulated meeting bottle branded for Visit Allen, Texas.' },
    ],
  },
  {
    key: 'box',
    name: 'Box Insurance Agency',
    logoMatch: 'BOX-PLAIN-DEBOSS',
    products: [
      { id: 'box-insurance-01-flashlight-hero', type: 'Promo', alt: 'Aluminium flashlight branded for Box Insurance Agency.' },
      { id: 'box-insurance-02-multipurpose-knife-stone-hero', type: 'Promo', alt: 'Multipurpose folding knife on stone, branded for Box Insurance Agency.' },
      { id: 'box-insurance-03-leather-keychain-hanging-hero', type: 'Promo', alt: 'Leather keychain hanging, stamped with the Box Insurance Agency mark.' },
      { id: 'box-insurance-04-multipurpose-knife-desk-hero', type: 'Promo', alt: 'Multipurpose folding knife on a desk, branded for Box Insurance Agency.' },
      { id: 'box-insurance-05-solar-charger-outdoor-hero', type: 'Promo', alt: 'Solar power bank shown outdoors, branded for Box Insurance Agency.' },
      { id: 'box-insurance-06-coverage-display-hero', type: 'Print', alt: 'Coverage display piece for Box Insurance Agency.' }, // FLAG: display piece, could be Design
      { id: 'box-insurance-07-packaged-notebook-hero', type: 'Promo', alt: 'Packaged notebook branded for Box Insurance Agency.' },
      { id: 'box-insurance-08-bottle-group-close-hero', type: 'Promo', alt: 'Group of insulated bottles shown close up, branded for Box Insurance Agency.' },
      { id: 'box-insurance-09-bottle-group-spaced-hero', type: 'Promo', alt: 'Group of insulated bottles spaced apart, branded for Box Insurance Agency.' },
      { id: 'box-insurance-10-leather-keychain-desk-hero', type: 'Promo', alt: 'Leather keychain on a desk, stamped with the Box Insurance Agency mark.' },
      { id: 'box-insurance-11-box-insurance-five-year-award-hero', type: 'Promo', alt: 'Five-year award piece for Box Insurance Agency.' }, // FLAG: award, could be Design
      { id: 'box-insurance-11-multi-tool-black-hero', type: 'Promo', alt: 'Black multi-tool branded for Box Insurance Agency.' },
    ],
  },
];
