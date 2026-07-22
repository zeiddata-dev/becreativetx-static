# Product images — drop them here

This is where the real product photos go. The gallery on the case-studies page
is built from what lands in these folders.

## 1. Which folder

Drop each photo into the folder for its service:

```
product-images/
  print/      commercial printing
  promo/      promotional products
  apparel/    branded apparel
  design/     design and identity
```

The folder decides the filter the piece shows under. That is the one choice
that has to be right — everything else is cosmetic and editable later.

## 2. How to name the file (recommended)

Name each file `Client - what it is.jpg`:

```
City of Allen - printed stadium cups.jpg
Momentum Spine and Joint - branded notebook.jpg
```

- The part before ` - ` becomes the client label under the tile.
- The part after becomes the alt text (accessibility and search).

A plain name still works — it just leaves the client blank and uses the whole
name as the description. Any of `.jpg`, `.jpeg`, `.png`, `.webp` is fine, at
full resolution. They get compressed automatically.

## 3. Build it

From the `bctx-live` folder:

```bash
node scripts/build-gallery-images.mjs
```

This compresses every photo to two web sizes and prints ready-to-paste
catalogue lines. Paste those into `js/gallery-data.js` (or just say the word and
they get added), then:

```bash
node scripts/build-gallery-html.mjs
```

That lays the tiles into `casestudies.html`. Reload the page and the new work
is in the gallery.

## Notes

- Empty categories show no filter, so Print and Apparel stay hidden until real
  photos are added — nothing looks broken in the meantime.
- No stock mockups or borrowed art. Only real be creative work belongs here.
- The photos already in the gallery are stand-ins from the old asset set;
  replacing them is exactly this process.
