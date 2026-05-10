/**
 * ParamPanel.js
 * Gamepad-navigable parameter panel.
 *
 * Rows (top → bottom):
 *   [0] Clear Canvas  — action button (A to execute)
 *   [1] moveSpeed     — brush movement speed
 *   rotateSpeed  — rotation speed (rad/frame at full trigger)
 *   scaleSpeed   — scale change rate per frame at full trigger
 *   pattern      — stamp pattern mode (cycles through PATTERNS[])
 *
 * D-pad Up/Down  → select active parameter
 * D-pad Left/Right → decrease / increase value
 * B / Escape      → close
 */

import { InputManager, MODE } from '../core/inputManager.js';
import { params }             from '../sketch/gamepadSketch.js';
import { PATTERNS, PATTERN_LABELS } from '../core/joyImage.js';

// Special action rows that appear above the numeric sliders
const ACTION_ROWS = [
  { key: 'clearCanvas', label: 'Clear Canvas', icon: '⌫', color: '#ff2079' },
];

const PARAM_DEFS = [
  {
    key:    'moveSpeed',
    label:  'Move Speed',
    icon:   '⚡',
    min:    1,
    max:    50,
    step:   1,
    format: v => `${v} px/f`,
  },
  {
    key:    'rotateSpeed',
    label:  'Rotate Speed',
    icon:   '↻',
    min:    0.005,
    max:    0.2,
    step:   0.005,
    format: v => v.toFixed(3),
  },
  {
    key:    'scaleSpeed',
    label:  'Scale Speed',
    icon:   '⤢',
    min:    0.001,
    max:    0.05,
    step:   0.001,
    format: v => v.toFixed(3),
  },
];

export class ParamPanel {
  constructor() {
    this._el = null;
    this._actionRows = []; // DOM els for action rows
    this._rows = [];       // DOM els for param slider rows
    // Row indices: 0..(ACTION_ROWS.length-1) = actions, then param sliders, then pattern
    this._activeRow = 0;
    this._visible = false;
    this._patternIndex = 0;

    this._build();
    this._wireEvents();
  }

  // ── Public ──────────────────────────────────────────────────────────────────

  show(patternIndex = 0) {
    this._patternIndex = patternIndex;
    this._visible = true;
    this._el.classList.add('hud-panel--visible');
    this._refresh();
    InputManager.setMode(MODE.PARAM_PANEL);
  }

  hide() {
    this._visible = false;
    this._el.classList.remove('hud-panel--visible');
    InputManager.setMode(MODE.DRAW);
  }

  toggle(patternIndex) {
    this._visible ? this.hide() : this.show(patternIndex);
  }

  // ── Build DOM ────────────────────────────────────────────────────────────────

  _build() {
    this._el = document.createElement('div');
    this._el.className = 'hud-panel hud-panel--param';
    this._el.setAttribute('aria-label', 'Parameters');
    this._el.innerHTML = `
      <div class="hud-panel__header">
        <span class="hud-hint">R1</span>
        <span class="hud-panel__title">PARAMETERS</span>
        <span class="hud-hint">B = close</span>
      </div>

      <div class="param-action-list" id="pp-actions"></div>

      <ul class="param-list" id="pp-list"></ul>

      <div class="param-pattern-row" id="pp-pattern-row">
        <span class="param-row__icon">◈</span>
        <span class="param-row__label">Pattern</span>
        <div class="param-pattern-options" id="pp-patterns"></div>
      </div>

      <div class="hud-panel__footer">
        <span class="hud-hint hud-hint--dpad">⬆⬇ select &nbsp;·&nbsp; ⬅➡ adjust</span>
      </div>
    `;

    // Action rows (e.g. Clear Canvas)
    const actionsWrap = this._el.querySelector('#pp-actions');
    ACTION_ROWS.forEach((def, i) => {
      const div = document.createElement('div');
      div.className = 'param-row param-action-row';
      div.dataset.index = i;
      div.style.setProperty('--action-color', def.color);
      div.innerHTML = `
        <span class="param-row__icon" style="color:${def.color}">${def.icon}</span>
        <span class="param-row__label" style="color:${def.color}">${def.label}</span>
        <span class="param-row__value" style="color:${def.color};font-size:10px">A = confirm</span>
      `;
      div.addEventListener('click', () => { this._activeRow = i; this._executeAction(def.key); this._refresh(); });
      actionsWrap.appendChild(div);
      this._actionRows.push(div);
    });

    // Numeric slider rows
    const list = this._el.querySelector('#pp-list');
    PARAM_DEFS.forEach((def, i) => {
      const li = document.createElement('li');
      li.className = 'param-row';
      li.dataset.index = ACTION_ROWS.length + i;
      li.innerHTML = `
        <span class="param-row__icon">${def.icon}</span>
        <span class="param-row__label">${def.label}</span>
        <div class="param-row__bar-wrap">
          <div class="param-row__bar" id="pp-bar-${i}"></div>
        </div>
        <span class="param-row__value" id="pp-val-${i}">—</span>
      `;
      list.appendChild(li);
      this._rows.push(li);
    });

    // Pattern row buttons
    const patternWrap = this._el.querySelector('#pp-patterns');
    PATTERNS.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.className = 'pattern-btn';
      btn.dataset.index = i;
      btn.innerHTML = PATTERN_LABELS[p];
      btn.addEventListener('click', () => {
        this._patternIndex = i;
        this._applyPattern();
        this._refresh();
      });
      patternWrap.appendChild(btn);
    });

    document.body.appendChild(this._el);
  }

  // ── Events ───────────────────────────────────────────────────────────────────

  _wireEvents() {
    InputManager.on('panelNav', ({ panel, dir }) => {
      if (panel !== 'param' || !this._visible) return;
      this._navigate(dir);
    });

    InputManager.on('closePanel', ({ panel }) => {
      if (panel !== 'param' && !this._visible) return;
      this.hide();
    });

    InputManager.on('panelConfirm', ({ panel }) => {
      if (panel !== 'param' || !this._visible) return;
      if (this._activeRow < ACTION_ROWS.length) {
        this._executeAction(ACTION_ROWS[this._activeRow].key);
      }
    });

    document.addEventListener('ui:toggleParamPanel', () => {
      import('../sketch/gamepadSketch.js').then(m => {
        this.toggle(m.patternIndex);
      });
    });

    // Reflect pattern changes from sketch (gamepad shortcut R3)
    document.addEventListener('sketch:patternChanged', e => {
      this._patternIndex = e.detail.patternIndex;
      this._refresh();
    });
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  _navigate(dir) {
    // Total rows: action rows + slider rows + pattern row
    const totalRows = ACTION_ROWS.length + PARAM_DEFS.length + 1;

    switch (dir) {
      case 'up':
        this._activeRow = _wrap(this._activeRow - 1, totalRows);
        break;
      case 'down':
        this._activeRow = _wrap(this._activeRow + 1, totalRows);
        break;
      case 'left':
        this._adjust(-1);
        break;
      case 'right':
        this._adjust(1);
        break;
    }
    this._refresh();
  }

  _executeAction(key) {
    if (key === 'clearCanvas') {
      document.dispatchEvent(new CustomEvent('parampanel:clearCanvas'));
    }
  }

  _adjust(dir) {
    const sliderIndex = this._activeRow - ACTION_ROWS.length;
    if (sliderIndex >= 0 && sliderIndex < PARAM_DEFS.length) {
      const def = PARAM_DEFS[sliderIndex];
      const newVal = Math.min(def.max, Math.max(def.min,
        params[def.key] + dir * def.step
      ));
      params[def.key] = Math.round(newVal / def.step) * def.step;
    } else if (sliderIndex === PARAM_DEFS.length) {
      // Pattern row
      this._patternIndex = _wrap(this._patternIndex + dir, PATTERNS.length);
      this._applyPattern();
    }
    // Action rows (index < ACTION_ROWS.length): left/right does nothing
  }

  _applyPattern() {
    document.dispatchEvent(new CustomEvent('parampanel:patternChange', {
      detail: { patternIndex: this._patternIndex }
    }));
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  _refresh() {
    // Action rows
    this._actionRows.forEach((el, i) => {
      el.classList.toggle('param-row--active', i === this._activeRow);
    });

    // Param slider rows
    PARAM_DEFS.forEach((def, i) => {
      const rowIndex = ACTION_ROWS.length + i;
      const row    = this._rows[i];
      const barEl  = this._el.querySelector(`#pp-bar-${i}`);
      const valEl  = this._el.querySelector(`#pp-val-${i}`);
      const pct    = ((params[def.key] - def.min) / (def.max - def.min)) * 100;

      row.classList.toggle('param-row--active', rowIndex === this._activeRow);
      barEl.style.width = `${Math.max(2, pct)}%`;
      valEl.textContent = def.format(params[def.key]);
    });

    // Pattern row
    const patternRow = this._el.querySelector('#pp-pattern-row');
    patternRow.classList.toggle('param-row--active',
      this._activeRow === ACTION_ROWS.length + PARAM_DEFS.length
    );

    this._el.querySelectorAll('.pattern-btn').forEach((btn, i) => {
      btn.classList.toggle('pattern-btn--active', i === this._patternIndex);
    });
  }
}

function _wrap(val, len) {
  return ((val % len) + len) % len;
}
