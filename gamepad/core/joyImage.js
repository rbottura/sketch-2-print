/**
 * joyImage.js
 * JoyImage class — the brush cursor controlled by the gamepad.
 * Supports 5 stamp pattern modes for symmetry drawing.
 */

export const PATTERNS = ['single', 'mirror-x', 'mirror-y', 'mirror-xy', 'quad'];
export const PATTERN_LABELS = {
  'single':    '⬤  Single',
  'mirror-x':  '⟺  Mirror X',
  'mirror-y':  '⟷  Mirror Y',
  'mirror-xy': '⊞  Mirror XY',
  'quad':      '⊡  Quad',
};

export class JoyImage {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   * @param {p5.Image} img
   * @param {p5.Graphics} target — the offscreen canvas brushes are stamped onto
   * @param {number} canvasW
   * @param {number} canvasH
   */
  constructor(x, y, scale, img, target, canvasW, canvasH) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.img = img;

    this.rotation = 0;
    this.pattern = PATTERNS[0]; // 'single'

    this._target = target;
    this._cW = canvasW;
    this._cH = canvasH;
  }

  /** Update the offscreen canvas reference (needed after resize). */
  setTarget(target, w, h) {
    this._target = target;
    this._cW = w;
    this._cH = h;
  }

  setPattern(p) { this.pattern = p; }
  nextPattern() {
    const i = PATTERNS.indexOf(this.pattern);
    this.pattern = PATTERNS[(i + 1) % PATTERNS.length];
  }

  /**
   * Stamp the current brush image onto the offscreen canvas
   * at all positions defined by the current pattern.
   */
  stamp() {
    const pts = this._getStampPoints();
    for (const [px, py, rot, scaleX] of pts) {
      this._drawTo(this._target, px, py, rot, scaleX);
    }
  }

  /**
   * Show the live (moving) cursor on the main p5 canvas.
   * @param {p5} p
   */
  show(p) {
    const pts = this._getStampPoints();
    for (const [px, py, rot, scaleX] of pts) {
      p.push();
      p.translate(px, py);
      p.rotate(rot);
      p.scale(this.scale * scaleX, this.scale);
      p.imageMode(p.CENTER);
      p.image(this.img, 0, 0);
      p.pop();
    }
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  /**
   * Returns array of [x, y, rotation, scaleX] for each stamp point.
   * scaleX is -1 when the image should be mirrored horizontally.
   */
  _getStampPoints() {
    const { x, y, rotation: r, _cW: w, _cH: h } = this;
    switch (this.pattern) {
      case 'mirror-x':
        return [
          [x,     y, r,  1],
          [w - x, y, -r, -1],
        ];
      case 'mirror-y':
        return [
          [x, y,     r,  1],
          [x, h - y, -r,  1],
        ];
      case 'mirror-xy':
        return [
          [x,     y,      r,  1],
          [w - x, y,     -r, -1],
          [x,     h - y, -r,  1],
          [w - x, h - y,  r, -1],
        ];
      case 'quad': {
        // 4 rotational stamps at 90° intervals around the canvas centre
        const cx = w / 2, cy = h / 2;
        const dx = x - cx, dy = y - cy;
        return [
          [cx + dx,  cy + dy,  r,       1],
          [cx - dy,  cy + dx,  r + Math.PI / 2, 1],
          [cx - dx,  cy - dy,  r + Math.PI,     1],
          [cx + dy,  cy - dx,  r - Math.PI / 2, 1],
        ];
      }
      default: // 'single'
        return [[x, y, r, 1]];
    }
  }

  _drawTo(gfx, px, py, rot, scaleX) {
    gfx.push();
    gfx.translate(px, py);
    gfx.rotate(rot);
    gfx.scale(this.scale * scaleX, this.scale);
    gfx.imageMode(gfx.CENTER);
    gfx.image(this.img, 0, 0);
    gfx.pop();
  }
}
