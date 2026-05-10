/**
 * brushRegistry.js
 * Central registry for all brush sprite families.
 * Loads once at app startup; all panels and sketches read from this singleton.
 * Paths are relative to gamepad/index.html (i.e., one level up for assets).
 */

export const BRUSH_FAMILIES = [
  {
    id: 'Ps_pink',
    label: 'Peace Sans — Pink',
    path: '../gamepad_sprites/PeaceSans/Ps_pink/',
    ext: 'png',
    count: 58,
    color: '#ff6eb4',
  },
  {
    id: 'Garam_blue',
    label: 'Garamond — Blue',
    path: '../gamepad_sprites/GaramondI/Garam_blue/',
    ext: 'png',
    count: 58,
    color: '#4fc3f7',
  },
  {
    id: 'Garam_pink',
    label: 'Garamond — Pink',
    path: '../gamepad_sprites/GaramondI/Garam_pink/',
    ext: 'png',
    count: 58,
    color: '#f48fb1',
  },
  {
    id: 'Garam_bw',
    label: 'Garamond — B&W',
    path: '../gamepad_sprites/GaramondI/Garam_bw_small/',
    ext: 'png',
    count: 58,
    color: '#cfd8dc',
  },
  {
    id: 'Raleway_green',
    label: 'Raleway — Green',
    path: '../gamepad_sprites/Raleway/Raleway_green/',
    ext: 'png',
    count: 78,
    color: '#a5d6a7',
  },
  {
    id: 'timbres',
    label: 'Timbres',
    path: '../gamepad_sprites/timbre/timbre',
    ext: 'jpeg',
    count: 8,
    startIndex: 1,   // files are 1-indexed
    color: '#ffcc80',
    customPath: true, // path is a prefix, not a folder
  },
  {
    id: 'fleurs',
    label: 'Fleurs',
    path: '../gamepad_sprites/fleurs/',
    ext: 'png',
    count: 11,
    color: '#ce93d8',
  },
  {
    id: 'Destra_yellow',
    label: 'Destra — Yellow',
    path: '../gamepad_sprites/Destra/Destra_yellow/',
    ext: 'png',
    count: 78,
    color: '#fff176',
  },
  {
    id: 'Minipax_white',
    label: 'Minipax — White',
    path: '../gamepad_sprites/Minipax/minipax_white/',
    ext: 'png',
    count: 78,
    color: '#f5f5f5',
  },
  {
    id: 'brushes',
    label: 'Brushes',
    path: '../gamepad_sprites/brushes/sprite(',
    ext: 'png',
    count: 59,
    startIndex: 1,
    customPath: true, // prefix + index + ').' + ext
    closingParen: true,
    color: '#80cbc4',
  },
];

/** Returns the URL for a specific sprite (index is 0-based internally). */
export function getSpriteUrl(familyIndex, spriteIndex) {
  const fam = BRUSH_FAMILIES[familyIndex];
  if (!fam) return null;

  const start = fam.startIndex ?? 0;
  const i = start + spriteIndex;

  if (fam.customPath) {
    const closing = fam.closingParen ? ')' : '';
    return `${fam.path}${i}${closing}.${fam.ext}`;
  }
  return `${fam.path}${i}.${fam.ext}`;
}

/**
 * Loaded sprite arrays. Populated by preloadAll().
 * families[familyIndex] = p5.Image[]
 */
export const families = [];

let _loaded = false;

/**
 * Called inside p5.preload(). Loads all sprites into families[].
 * @param {p5} p — the p5 instance
 */
export function preloadAll(p) {
  for (let fi = 0; fi < BRUSH_FAMILIES.length; fi++) {
    const fam = BRUSH_FAMILIES[fi];
    families[fi] = [];
    const start = fam.startIndex ?? 0;

    for (let si = 0; si < fam.count; si++) {
      const url = getSpriteUrl(fi, si);
      families[fi].push(p.loadImage(url));
    }
  }
  _loaded = true;
}

export function isLoaded() { return _loaded; }

/** Returns a specific p5.Image, or null. */
export function getSprite(familyIndex, spriteIndex) {
  return families[familyIndex]?.[spriteIndex] ?? null;
}

export function familyCount() { return BRUSH_FAMILIES.length; }
export function spriteCount(familyIndex) { return BRUSH_FAMILIES[familyIndex]?.count ?? 0; }
export function familyMeta(familyIndex) { return BRUSH_FAMILIES[familyIndex] ?? null; }
