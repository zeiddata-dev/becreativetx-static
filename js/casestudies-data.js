/* Case-study clients and their products.

   The case-studies page shows four client logos. Clicking one opens an overlay
   of just that client's products. This file defines the four clients, how each
   maps to its logo image on the page, and which product photos belong to it.

   The deboss/identity marks are intentionally not listed here — they are the
   logos on the page, not products in the gallery.

   Product ids match assets/gallery/{thumb,full}/<id>.webp. alt describes only
   what the photo shows. Momentum, City of Allen, and Box Insurance point at the
   reworked photography dropped into product-images/<key>/ and rebuilt via
   scripts/build-gallery-images.mjs.

   NOTE: Unitron still points at the original stand-in images. No reworked
   Unitron photos have been delivered yet (product-images/unitron/ is empty).
   Replace these three once the real photos arrive, then rebuild. */

window.CASE_STUDIES = [
  {
    key: 'unitron',
    name: 'Unitron Power Systems',
    logoMatch: 'UNITRON-PLAIN-DEBOSS',
    // STAND-IN images — awaiting reworked Unitron photography.
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
      { id: 'momentum-01-branded-napkins', alt: 'Printed cocktail napkins branded for Momentum Spine & Joint.' },
      { id: 'momentum-02-drink-stirrers-product', alt: 'Branded drink stirrers shown as a product shot for Momentum Spine & Joint.' },
      { id: 'momentum-03-drink-stirrers-in-use', alt: 'Branded drink stirrers shown in use in a drink for Momentum Spine & Joint.' },
      { id: 'momentum-04-location-map', alt: 'Printed location map card for Momentum Spine & Joint.' },
      { id: 'momentum-05-contact-directory', alt: 'Printed contact directory card for Momentum Spine & Joint.' },
      { id: 'momentum-06-branded-shot-glass', alt: 'Shot glass printed with the Momentum Spine & Joint logo.' },
      { id: 'momentum-07-laser-cut-invitation', alt: 'Laser-cut invitation printed for Momentum Spine & Joint.' },
      { id: 'momentum-08-ruler-letter-opener', alt: 'Combination ruler and letter opener branded for Momentum Spine & Joint.' },
      { id: 'momentum-09-kraft-notebook', alt: 'Kraft-cover notebook branded for Momentum Spine & Joint.' },
      { id: 'momentum-10-ergonomic-wrist-rest-set', alt: 'Ergonomic wrist rest set branded for Momentum Spine & Joint.' },
      { id: 'momentum-11-handheld-fan', alt: 'Handheld folding fan branded for Momentum Spine & Joint.' },
      { id: 'momentum-12-translucent-cup', alt: 'Translucent plastic cup printed with the Momentum Spine & Joint logo.' },
    ],
  },
  {
    key: 'allen',
    name: 'City of Allen',
    logoMatch: 'ALLEN-PLAIN-DEBOSS',
    products: [
      { id: 'allen-01-city-of-allen-bag-dispenser', alt: 'Bag dispenser branded with the City of Allen logo.' },
      { id: 'allen-02-city-of-allen-cups', alt: 'Stadium cups printed with the City of Allen logo.' },
      { id: 'allen-03-allen-fire-rescue-print', alt: 'Printed piece for Allen Fire Rescue.' },
      { id: 'allen-04-visit-allen-relax-item', alt: 'Relaxation item branded for Visit Allen, Texas.' },
      { id: 'allen-05-visit-allen-bamboo-shoehorn', alt: 'Bamboo shoehorn branded for Visit Allen, Texas.' },
      { id: 'allen-06-city-of-allen-microfiber-cloth', alt: 'Microfiber cloth printed with the City of Allen logo.' },
      { id: 'allen-07-life-canvas-portfolio', alt: 'Canvas zip portfolio branded for the City of Allen.' },
      { id: 'allen-08-visit-allen-floral-pouch', alt: 'Zip pouch printed with a floral pattern for Visit Allen, Texas.' },
      { id: 'allen-09-city-of-allen-soil-tester', alt: 'Soil tester branded with the City of Allen logo.' },
      { id: 'allen-10-city-of-allen-pen-set', alt: 'Engraved pen set in a presentation case for the City of Allen.' },
      { id: 'allen-11-visit-allen-meeting-bottle', alt: 'Insulated meeting bottle branded for Visit Allen, Texas.' },
    ],
  },
  {
    key: 'box',
    name: 'Box Insurance Agency',
    logoMatch: 'BOX-PLAIN-DEBOSS',
    products: [
      { id: 'box-insurance-01-flashlight-hero', alt: 'Aluminium flashlight branded for Box Insurance Agency.' },
      { id: 'box-insurance-02-multipurpose-knife-stone-hero', alt: 'Multipurpose folding knife on stone, branded for Box Insurance Agency.' },
      { id: 'box-insurance-03-leather-keychain-hanging-hero', alt: 'Leather keychain hanging, stamped with the Box Insurance Agency mark.' },
      { id: 'box-insurance-04-multipurpose-knife-desk-hero', alt: 'Multipurpose folding knife on a desk, branded for Box Insurance Agency.' },
      { id: 'box-insurance-05-solar-charger-outdoor-hero', alt: 'Solar power bank shown outdoors, branded for Box Insurance Agency.' },
      { id: 'box-insurance-06-coverage-display-hero', alt: 'Coverage display piece for Box Insurance Agency.' },
      { id: 'box-insurance-07-packaged-notebook-hero', alt: 'Packaged notebook branded for Box Insurance Agency.' },
      { id: 'box-insurance-08-bottle-group-close-hero', alt: 'Group of insulated bottles shown close up, branded for Box Insurance Agency.' },
      { id: 'box-insurance-09-bottle-group-spaced-hero', alt: 'Group of insulated bottles spaced apart, branded for Box Insurance Agency.' },
      { id: 'box-insurance-10-leather-keychain-desk-hero', alt: 'Leather keychain on a desk, stamped with the Box Insurance Agency mark.' },
      { id: 'box-insurance-11-box-insurance-five-year-award-hero', alt: 'Five-year award piece for Box Insurance Agency.' },
      { id: 'box-insurance-11-multi-tool-black-hero', alt: 'Black multi-tool branded for Box Insurance Agency.' },
    ],
  },
];
