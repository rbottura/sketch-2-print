#!/usr/bin/env node
/**
 * scripts/generate-gallery.js
 *
 * Scans gamepad/gallery/images/ and writes gamepad/gallery/manifest.json —
 * the index the published gallery page reads.
 *
 * Workflow:
 *   1. Draw in GamepadDraw, press X (or ⬇ Download) on the image you like.
 *   2. Drop the .png into gamepad/gallery/images/
 *   3. node scripts/generate-gallery.js
 *   4. git add gamepad/gallery && git commit && push → live on Netlify
 *
 * Titles and dates are inferred from the filename produced by the app
 * (`<label>_<YYYY-MM-DD-HH-MM-SS>.png`), and any entry already present in the
 * manifest keeps its hand-edited `title` / `note`, so you can annotate freely
 * and re-run this script without losing your edits.
 */

const fs   = require('fs');
const path = require('path');

const GALLERY_DIR = path.join(__dirname, '..', 'gamepad', 'gallery');
const IMAGES_DIR  = path.join(GALLERY_DIR, 'images');
const OUTPUT_FILE = path.join(GALLERY_DIR, 'manifest.json');
const IMAGE_EXTS  = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

// ─── Previous manifest (to preserve hand-edited fields) ───────────────────────

let previous = {};
if (fs.existsSync(OUTPUT_FILE)) {
  try {
    const json = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    for (const item of json.images ?? []) previous[item.file] = item;
  } catch (err) {
    console.warn('Could not parse existing manifest, starting fresh:', err.message);
  }
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

if (!fs.existsSync(IMAGES_DIR)) {
  console.error(`Missing directory: ${IMAGES_DIR}`);
  process.exit(1);
}

const images = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
  .filter(e => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
  .map(e => e.name)
  .sort()
  .map(file => {
    const prev  = previous[file] ?? {};
    const stat  = fs.statSync(path.join(IMAGES_DIR, file));
    const { title, date } = parseName(file);

    return {
      file,
      title: prev.title ?? title,
      date:  prev.date  ?? date ?? stat.mtime.toISOString().slice(0, 10),
      note:  prev.note  ?? '',
      bytes: stat.size,
    };
  })
  // Newest first — that's the order the page renders in.
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.file < b.file ? 1 : -1));

/**
 * `garamondi-garam-blue_2026-09-15-14-32-07.png`
 *   → { title: 'Garamondi Garam Blue', date: '2026-09-15' }
 */
function parseName(file) {
  const base  = path.basename(file, path.extname(file));
  const match = base.match(/^(.*)_(\d{4}-\d{2}-\d{2})-\d{2}-\d{2}-\d{2}$/);
  const slug  = match ? match[1] : base;

  const title = slug
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase()) || 'Untitled';

  return { title, date: match ? match[2] : null };
}

// ─── Write ────────────────────────────────────────────────────────────────────

const manifest = {
  generated: new Date().toISOString(),
  count: images.length,
  images,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_FILE)} — ${images.length} image(s).`);
