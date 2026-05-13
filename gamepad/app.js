/**
 * app.js — GamepadDraw bootstrap (ES module entry point)
 *
 * Load order (guaranteed by index.html):
 *   1. libs/p5.min.js        (global)
 *   2. p5.joystick.js        (global, extends p5)
 *   3. this file             (module)
 */

import * as BrushRegistry from './core/brushRegistry.js';
import { InputManager, MODE } from './core/inputManager.js';
import { ImageStore }          from './core/imageStore.js';
import { BrushPanel }          from './ui/BrushPanel.js';
import { ParamPanel }          from './ui/ParamPanel.js';
import { GalleryPanel }        from './ui/GalleryPanel.js';
import { createSketch,
         setFamilyIndex, setSpriteIndex, setPatternIndex,
         familyIndex, spriteIndex, patternIndex }
       from './sketch/gamepadSketch.js';

import { BrushSelector }       from './ui/BrushSelector.js';

// ── Boot sequence ────────────────────────────────────────────────────────────

async function boot() {
  try {
    // 1. Load manifest
    const manifest = await BrushRegistry.loadManifest();

    // 2. Prompt user to select libraries
    const selector = new BrushSelector(manifest);
    const selectedIds = await selector.prompt();

    // 3. Configure registry
    BrushRegistry.setSelectedFamilies(selectedIds);

    // 4. Start sketch
    const container = document.getElementById('sketch-container');
    const sketchInstance = createSketch(container);

    // 5. Create UI panels
    const brushPanel   = new BrushPanel();
    const paramPanel   = new ParamPanel();
    const galleryPanel = new GalleryPanel();

    // 6. Setup status bar
    _buildStatusBar();
    setTimeout(_updateStatusBar, 100);

  } catch (err) {
    console.error('Failed to boot GamepadDraw:', err);
    document.body.innerHTML = `<div style="color:red;padding:20px;font-family:monospace">Fatal Error: ${err.message}</div>`;
  }
}

boot();

// ── Wire cross-module events ─────────────────────────────────────────────────

// BrushPanel confirmed → apply to sketch
document.addEventListener('brushpanel:confirm', e => {
  const { familyIndex: fi, spriteIndex: si } = e.detail;
  setFamilyIndex(fi);
  setSpriteIndex(si);
  _updateStatusBar();
});

// ParamPanel changed pattern → apply to sketch
document.addEventListener('parampanel:patternChange', e => {
  setPatternIndex(e.detail.patternIndex);
  _updateStatusBar();
});

// Sketch brush changed (via D-pad in draw mode) → sync status bar
document.addEventListener('sketch:brushChanged', e => {
  _updateStatusBar();
});

document.addEventListener('sketch:patternChanged', () => {
  _updateStatusBar();
});

// ── Status bar (always-visible HUD strip at bottom-left) ─────────────────────

function _updateStatusBar() {
  const fam  = BrushRegistry.familyMetaByIndex(familyIndex);
  if (!fam) return;

  const patternLabel = document.getElementById('sb-pattern');
  const familyLabel  = document.getElementById('sb-family');
  const spriteLabel  = document.getElementById('sb-sprite');
  const modeLabel    = document.getElementById('sb-mode');
  const countLabel   = document.getElementById('sb-count');

  if (familyLabel) { familyLabel.textContent = fam.label; familyLabel.style.color = fam.color; }
  if (spriteLabel) spriteLabel.textContent = `#${spriteIndex + 1}`;
  if (countLabel)  countLabel.textContent  = `${ImageStore.count} saved`;
}

document.addEventListener('imagestore:saved',   _updateStatusBar);
document.addEventListener('imagestore:removed', _updateStatusBar);

// ── Keyboard shortcuts overlay (help) ────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'h' || e.key === 'H') _toggleHelp();
});

function _buildStatusBar() {
  const bar = document.createElement('div');
  bar.id = 'status-bar';
  bar.className = 'status-bar';
  bar.innerHTML = `
    <span class="sb-item" id="sb-family">—</span>
    <span class="sb-sep">·</span>
    <span class="sb-item sb-dim" id="sb-sprite">—</span>
    <span class="sb-sep">·</span>
    <span class="sb-item sb-dim" id="sb-count">0 saved</span>
    <span class="sb-spacer"></span>
    <span class="sb-item sb-dim">H = help</span>
  `;
  document.body.appendChild(bar);
  return bar;
}

function _toggleHelp() {
  const existing = document.getElementById('help-overlay');
  if (existing) { existing.remove(); return; }

  const ov = document.createElement('div');
  ov.id = 'help-overlay';
  ov.className = 'help-overlay';
  ov.innerHTML = `
    <div class="help-card">
      <h2>GamepadDraw — Controls</h2>
      <table class="help-table">
        <thead><tr><th>Gamepad</th><th>Keyboard</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>Left Stick</td><td>—</td><td>Move brush</td></tr>
          <tr><td>A / Cross</td><td>Space / Enter</td><td>Stamp brush</td></tr>
          <tr><td>B / Circle</td><td>Z</td><td>Undo / Close panel</td></tr>
          <tr><td>L2 / R2</td><td>—</td><td>Rotate CCW / CW</td></tr>
          <tr><td>X / Square</td><td>—</td><td>Scale down</td></tr>
          <tr><td>Y / Triangle</td><td>—</td><td>Scale up</td></tr>
          <tr><td>D-pad ⬆⬇</td><td>—</td><td>Previous / Next family</td></tr>
          <tr><td>D-pad ⬅➡</td><td>—</td><td>Previous / Next sprite</td></tr>
          <tr><td>L1</td><td>—</td><td>Open Brush Panel</td></tr>
          <tr><td>R1</td><td>—</td><td>Open Param Panel</td></tr>
          <tr><td>R3</td><td>P</td><td>Cycle pattern mode</td></tr>
          <tr><td>L3</td><td>—</td><td>Reset brush to centre</td></tr>
          <tr><td>Select</td><td>—</td><td>Open Gallery</td></tr>
          <tr><td>Start</td><td>S</td><td>Save image</td></tr>
        </tbody>
      </table>
      <p class="help-close-hint">Press H or click to close</p>
    </div>
  `;
  ov.addEventListener('click', () => ov.remove());
  document.body.appendChild(ov);
}
