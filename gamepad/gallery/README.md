# GamepadDraw Gallery

The published gallery — a static, git-tracked folder of curated drawings.
Live at `/gamepad/gallery/` once deployed.

```
gallery/
├── images/          ← curated PNGs, committed to git
├── manifest.json    ← generated index (do not hand-edit `file`/`bytes`)
├── index.html       ← the page
├── gallery.css
└── gallery.js
```

## Publishing a drawing

1. In GamepadDraw, open the gallery panel (Select) and press **X** on the image
   you want, or click **⬇ Download**. It lands in your downloads as
   `<brush-label>_<YYYY-MM-DD-HH-MM-SS>.png`.
2. Move the file into `gamepad/gallery/images/`.
3. Regenerate the index:
   ```sh
   node scripts/generate-gallery.js
   ```
4. Commit and push — Netlify redeploys and the image is live.

Keeping the filename the app generates means the title and date are filled in
automatically. Renaming the file is fine too; the title is just the name with
dashes turned into spaces.

## Annotating

`title` and `note` in `manifest.json` are yours to edit by hand — the generator
preserves them across runs, matching on `file`. Entries whose image no longer
exists are dropped; new images are appended and the list is re-sorted newest
first.

## Keeping the repo small

Git stores every version of a binary forever, so only commit keepers, and
compress before committing:

```sh
oxipng -o4 --strip safe gamepad/gallery/images/*.png
# or
pngquant --quality 65-85 --ext .png --force gamepad/gallery/images/*.png
```

## In-browser drafts vs. the gallery

Everything you draw is kept in the browser's IndexedDB (`gamepaddraw` database)
and survives a reload — that's your working scratchpad, private to that browser
and that device. This folder is the curated, public subset. The two are
independent: clearing browser data never touches what's committed here.
