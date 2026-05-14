/**
 * gamepadSketch.js
 * Thin p5 instance that delegates all logic to core/ modules.
 * Exported as createSketch(container) → returns the p5 instance.
 */

import * as BrushRegistry from '../core/brushRegistry.js';
import { JoyImage, PATTERNS }    from '../core/joyImage.js';
import { InputManager, MODE }    from '../core/inputManager.js';
import { ImageStore }            from '../core/imageStore.js';

/** Movement speed (px/frame at full stick deflection). Tweakable from ParamPanel. */
export const params = {
  moveSpeed:      10,
  rotateSpeed:    0.045,
  scaleSpeed:     0.006,
  scaleMin:       0.05,
  scaleMax:       8,
  refOpacity:     0.5,
};

// ─── State shared with UI panels (via App) ────────────────────────────────────
export let familyIndex = 0;
export let spriteIndex = 0;
export let patternIndex = 0;

export function setFamilyIndex(i) { familyIndex = i; _syncBrush(); }
export function setSpriteIndex(i) { spriteIndex = i; _syncBrush(); }
export function setPatternIndex(i) { patternIndex = i; _syncBrush(); }

// ─── p5 refs ─────────────────────────────────────────────────────────────────
let _p5;          // the p5 instance
let _overlay;     // p5.Graphics — permanent ink layer
let _joyImg;      // JoyImage cursor
let _rotVal = 0;
let _scaleVal = 1;
let _referenceImg = null;

export function getOverlayCanvas() {
  return _overlay?.canvas ?? null;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createSketch(container) {
  _p5 = new p5(sketch => {
    let _cnv;

    // ── preload ───────────────────────────────────────────────────────────────
    sketch.preload = () => {
      BrushRegistry.preloadSelected(sketch);
    };

    // ── setup ─────────────────────────────────────────────────────────────────
    sketch.setup = () => {
      _cnv = sketch.createCanvas(window.innerWidth, window.innerHeight);
      sketch.pixelDensity(window.devicePixelRatio || 1);

      _overlay = sketch.createGraphics(sketch.width, sketch.height);
      _overlay.clear();

      _joyImg = new JoyImage(
        sketch.width  / 2,
        sketch.height / 2,
        1,
        BrushRegistry.getSprite(BrushRegistry.familyIdByIndex(familyIndex), spriteIndex),
        _overlay,
        sketch.width,
        sketch.height
      );

      _wireInputs();
      _wireJoystick(sketch);

      // Resize
      window.addEventListener('resize', () => {
        sketch.resizeCanvas(window.innerWidth, window.innerHeight);
        const newOverlay = sketch.createGraphics(sketch.width, sketch.height);
        newOverlay.clear();
        newOverlay.image(_overlay, 0, 0);
        _overlay = newOverlay;
        _joyImg.setTarget(_overlay, sketch.width, sketch.height);
      });
    };

    // ── draw ──────────────────────────────────────────────────────────────────
    sketch.draw = () => {
      sketch.background(255); // Solid white base

      // Draw reference image behind the overlay
      if (_referenceImg && params.refOpacity > 0) {
        sketch.push();
        sketch.tint(255, params.refOpacity * 255);
        sketch.imageMode(sketch.CENTER);
        // "Contain" scaling
        const s = Math.min(sketch.width / _referenceImg.width, sketch.height / _referenceImg.height);
        const dw = _referenceImg.width * s;
        const dh = _referenceImg.height * s;
        sketch.image(_referenceImg, sketch.width / 2, sketch.height / 2, dw, dh);
        sketch.pop();
      }

      // Draw the permanent ink layer
      sketch.push();
      sketch.imageMode(sketch.CORNER);
      sketch.image(_overlay, 0, 0);
      sketch.pop();

      // Draw live brush cursor (ghost / preview)
      if (_joyImg && BrushRegistry.isLoaded()) {
        sketch.push();
        sketch.tint(255, 180); // semi-transparent preview
        _joyImg.show(sketch);
        sketch.noTint();
        sketch.pop();
      }

      // Poll gamepad
      const gp = _getActiveGamepad();
      if (gp) InputManager.update(gp, sketch.deltaTime);
    };

    // ── key shortcuts (fallback without gamepad) ───────────────────────────────
    sketch.keyPressed = (e) => {
      if (e.key === 'Enter' || e.key === ' ') _joyImg?.stamp();
      if (e.key === 'c' || e.key === 'C')     _clearOverlay();
      if (e.key === 'z' || e.key === 'Z')     _clearOverlay();
      if (e.key === 's' || e.key === 'S')     _saveImage();
      if (e.key === 'p' || e.key === 'P')     _joyImg?.nextPattern();
    };

    // parampanel:clearCanvas → wipe the overlay
    document.addEventListener('parampanel:clearCanvas', _clearOverlay);

    // Load reference image
    document.addEventListener('parampanel:referenceLoaded', (e) => {
      sketch.loadImage(e.detail.url, (img) => {
        _referenceImg = img;
      });
    });

    // Load back saved image to canvas
    document.addEventListener('gallery:loadToCanvas', (e) => {
      sketch.loadImage(e.detail.url, (img) => {
        // Clear current overlay and draw the loaded image
        _overlay.clear();
        _overlay.imageMode(sketch.CORNER);
        _overlay.image(img, 0, 0);
      });
    });

  }, container);

  return _p5;
}

// ─── Input wiring ─────────────────────────────────────────────────────────────

function _wireInputs() {
  InputManager.on('move', ({ ax, ay }) => {
    if (!_joyImg) return;
    _joyImg.x += ax * params.moveSpeed;
    _joyImg.y += ay * params.moveSpeed;
  });

  InputManager.on('rotateLeft',  ({ value }) => { _rotVal -= value * params.rotateSpeed; _joyImg.rotation = _rotVal; });
  InputManager.on('rotateRight', ({ value }) => { _rotVal += value * params.rotateSpeed; _joyImg.rotation = _rotVal; });

  InputManager.on('scaleDown', ({ value }) => {
    _scaleVal = Math.max(params.scaleMin, _scaleVal - value * params.scaleSpeed);
    _joyImg.scale = _scaleVal;
  });
  InputManager.on('scaleUp', ({ value }) => {
    _scaleVal = Math.min(params.scaleMax, _scaleVal + value * params.scaleSpeed);
    _joyImg.scale = _scaleVal;
  });

  InputManager.on('stamp',         () => _joyImg?.stamp());
  InputManager.on('undo',          () => { /* TODO: undo stack */ });
  InputManager.on('resetPosition', () => {
    if (!_joyImg || !_p5) return;
    _joyImg.x = _p5.width  / 2;
    _joyImg.y = _p5.height / 2;
  });
  InputManager.on('nextPattern',   () => {
    if (!_joyImg) return;
    _joyImg.nextPattern();
    patternIndex = PATTERNS.indexOf(_joyImg.pattern);
    document.dispatchEvent(new CustomEvent('sketch:patternChanged', { detail: { patternIndex } }));
  });

  InputManager.on('familyNext', () => _step('family',  1));
  InputManager.on('familyPrev', () => _step('family', -1));
  InputManager.on('spriteNext', () => _step('sprite',  1));
  InputManager.on('spritePrev', () => _step('sprite', -1));

  InputManager.on('saveImage',    _saveImage);
  InputManager.on('toggleBrushPanel', () => document.dispatchEvent(new CustomEvent('ui:toggleBrushPanel')));
  InputManager.on('toggleParamPanel', () => document.dispatchEvent(new CustomEvent('ui:toggleParamPanel')));
  InputManager.on('toggleGallery',    () => document.dispatchEvent(new CustomEvent('ui:toggleGallery')));
}

function _wireJoystick(sketch) {
  // p5.joystick integration — stamp on green button
  try {
    const joystick = sketch.createJoystick?.(false);
    if (joystick) {
      joystick.onButtonPressed(e => {
        if (e.name === 'buttonGreen') _joyImg?.stamp();
      });
    }
  } catch(_) {
    console.warn('p5.joystick not available, using raw Gamepad API only.');
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _step(type, dir) {
  if (!_joyImg) return;
  if (type === 'family') {
    familyIndex = _wrap(familyIndex + dir, BrushRegistry.familyCount());
    spriteIndex = 0;
  } else {
    spriteIndex = _wrap(spriteIndex + dir, BrushRegistry.spriteCountByIndex(familyIndex));
  }
  _syncBrush();
  document.dispatchEvent(new CustomEvent('sketch:brushChanged', {
    detail: { familyIndex, spriteIndex }
  }));
}

function _syncBrush() {
  if (!_joyImg) return;
  _joyImg.img     = BrushRegistry.getSprite(BrushRegistry.familyIdByIndex(familyIndex), spriteIndex);
  _joyImg.pattern = PATTERNS[patternIndex];
}

function _clearOverlay() {
  if (!_overlay || !_p5) return;
  _overlay.clear();
}

function _saveImage() {
  if (!_overlay || !_p5) return;
  // Create a temporary graphics with a white background so saved image isn't transparent
  const temp = _p5.createGraphics(_overlay.width, _overlay.height);
  temp.background(255);
  temp.image(_overlay, 0, 0);
  ImageStore.save(temp.canvas, BrushRegistry.familyMetaByIndex(familyIndex)?.label);
  temp.remove();
}

function _getActiveGamepad() {
  const gps = navigator.getGamepads?.() ?? [];
  for (const gp of gps) { if (gp) return gp; }
  return null;
}

function _wrap(val, len) {
  return ((val % len) + len) % len;
}
