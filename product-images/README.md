# Product images — drop them here

The case-studies page shows four client logos. Clicking a logo opens that
client's products. This is where those product photos go.

## 1. Which folder — one per client

```
product-images/
  unitron/         Unitron Power Systems
  momentum/        Momentum Spine & Joint
  allen/           City of Allen
  box-insurance/   Box Insurance Agency
```

The folder decides which client's overlay the photo appears in. That is the one
choice that has to be right.

## 2. Name the file for what it shows

The filename becomes the product's description (alt text):

```
printed stadium cups.jpg
engraved rosewood pen case.jpg
```

Any of `.jpg`, `.jpeg`, `.png`, `.webp`, full resolution — they get compressed
automatically. No client name needed in the filename; the folder already says
who it is.

## 3. Build it

From the `bctx-live` folder:

```bash
node scripts/build-gallery-images.mjs
```

This compresses every photo to two web sizes and prints product lines grouped
by client. Paste each block into that client's `products` array in
`js/casestudies-data.js` (or just say the word and they get added). Reload
`casestudies.html` and click the logo — the new work is in the overlay.

## Notes

- Only the four case-study clients have folders. Products for other brands are
  not shown on the case-studies page.
- No stock mockups or borrowed art. Only real be creative work belongs here.
- The photos in the overlays now are stand-ins from the old asset set;
  replacing them is exactly this process.
