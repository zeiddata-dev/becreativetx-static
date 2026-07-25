/* Gallery data — the /gallery/ page.

   The gallery shows all of be creative's work in one filterable grid. It draws
   from two sources:

   1. The four case-study clients (window.CASE_STUDIES, loaded from
      casestudies-data.js). Each of their products already carries a `type`.
   2. The general work below — pieces not tied to a single client, dropped into
      product-images/general/<type>/ and built by scripts/build-gallery-images.mjs.
      The subfolder is the product type.

   Ids match assets/gallery/{thumb,full}/<id>.webp.

   Apparel is intentionally not a photo grid: on the live site it is two links,
   so the Apparel filter shows those links instead of tiles. Replace the
   placeholder targets below with the real ones when confirmed. */

window.GALLERY = {
  // Order of the filter chips. 'All' is added by the page.
  types: ['Design', 'Print', 'Promo', 'Apparel'],

  // General work, typed by folder. alt describes only what the photo shows.
  general: [
    // Design
    { id: 'general-design-01-dollar-sign-money-clip-hero', type: 'Design', alt: 'Dollar-sign money clip.' },
    { id: 'general-design-02-naked-bomb-packaging-hero', type: 'Design', alt: 'Product packaging designed for Naked Bomb.' },
    { id: 'general-design-atlas-marine-cleaning-cloth-hero', type: 'Design', alt: 'Branded microfiber cleaning cloth for Atlas Marine Systems.' },
    { id: 'general-design-foxcart-cleaning-cloth-hero', type: 'Design', alt: 'Branded microfiber cleaning cloth for Foxcart.' },
    { id: 'general-design-legacy-badges-lanyards-hero', type: 'Design', alt: 'Event badges and lanyards designed for Legacy.' },

    // Print
    { id: 'general-print-03-christar-communication-brochure-hero', type: 'Print', alt: 'Communication brochure printed for Christar.' },
    { id: 'general-print-04-ncha-standing-committee-guidelines-hero', type: 'Print', alt: 'Standing committee guidelines booklet printed for NCHA.' },
    { id: 'general-print-05-american-leather-best-better-good-hero', type: 'Print', alt: 'Best, Better, Good printed piece for American Leather.' },
    { id: 'general-print-06-american-leather-trundle-sleeper-hero', type: 'Print', alt: 'Trundle sleeper printed piece for American Leather.' },
    { id: 'general-print-07-american-leather-senior-living-hero', type: 'Print', alt: 'Senior living printed piece for American Leather.' },
    { id: 'general-print-09-dont-gamble-coverage-frame-hero', type: 'Print', alt: 'Do not gamble with coverage printed frame piece.' },
    { id: 'general-print-american-leather-hospitality-samples-hero', type: 'Print', alt: 'Hospitality sample printed pieces for American Leather.' },
    { id: 'general-print-butler-land-automation-brochure-hero', type: 'Print', alt: 'Land automation brochure printed for Butler.' },
    { id: 'general-print-christar-trifold-brochure-hero', type: 'Print', alt: 'Trifold brochure printed for Christar.' },
    { id: 'general-print-christar-world-map-card-hero', type: 'Print', alt: 'World map card printed for Christar.' },
    { id: 'general-print-church-stained-glass-card-hero', type: 'Print', alt: 'Stained-glass card printed for a church.' },
    { id: 'general-print-legacy-fall-home-show-piece-hero', type: 'Print', alt: 'Fall home show printed piece for Legacy.' },
    { id: 'general-print-rotary-club-colleyville-card-hero', type: 'Print', alt: 'Printed card for the Rotary Club of Colleyville.' },
    { id: 'general-print-show-itinerary-2023-hero', type: 'Print', alt: 'Printed 2023 show itinerary.' },
    { id: 'general-print-tiny-house-catalog-hero', type: 'Print', alt: 'Printed catalog for a tiny house builder.' },
    { id: 'general-print-watson-2023-calendar-hero', type: 'Print', alt: 'Printed 2023 calendar for Watson.' },
  ],

  // Apparel is not a product grid. It explains the ordering workflow: apparel
  // starts by choosing blanks in the external store, which then feed into a
  // quote we design and price from. Each step may carry a link; set
  // `external: true` for off-site targets so they open in a new tab.
  apparel: {
    heading: 'How to order branded apparel',
    intro: 'Apparel starts with the blank. Pick the garments you want first, then we quote and design from there.',
    steps: [
      {
        text: 'Browse the be creative apparel store and choose your blanks — the garment styles, colors, and sizes you want printed or embroidered.',
        link: { label: 'Shop branded apparel', href: 'https://www.companycasuals.com/BeCreativeOnline/start.jsp', external: true },
      },
      {
        text: 'List the blanks you picked in a quote request so we know exactly what you have in mind.',
        link: { label: 'Request a quote', href: 'request-a-quote.html' },
      },
      {
        text: 'Submit it and our team takes it from there with design and pricing.',
      },
    ],
  },
};
