/**
 * GalleryPanel.js
 * Carousel of saved images, navigable with the gamepad.
 *
 * D-pad Left/Right → navigate images
 * A                → bring selected image to front / preview fullscreen
 * X                → download selected image
 * Y                → delete selected image
 * B / Select       → close
 */

import { InputManager, MODE } from '../core/inputManager.js';
import { ImageStore }          from '../core/imageStore.js';
import { GalleryPublisher }    from '../core/galleryPublisher.js';

export class GalleryPanel {
  constructor() {
    this._el     = null;
    this._strip  = null;
    this._info   = null;
    this._active = 0;
    this._visible = false;
    this._pubState = new Map();   // entry.id -> already in the on-disk gallery

    this._build();
    this._wireEvents();
  }

  // ── Public ──────────────────────────────────────────────────────────────────

  show() {
    this._visible = true;
    this._active  = Math.max(0, ImageStore.count - 1);
    this._el.classList.add('hud-panel--visible');
    this._refresh();
    InputManager.setMode(MODE.GALLERY);
    this._syncPublished();
  }

  hide() {
    this._visible = false;
    this._el.classList.remove('hud-panel--visible');
    InputManager.setMode(MODE.DRAW);
  }

  toggle() {
    this._visible ? this.hide() : this.show();
  }

  // ── Build DOM ────────────────────────────────────────────────────────────────

  _build() {
    this._el = document.createElement('div');
    this._el.className = 'hud-panel hud-panel--gallery';
    this._el.setAttribute('aria-label', 'Gallery');
    this._el.innerHTML = `
      <div class="hud-panel__header">
        <span class="hud-hint">Select</span>
        <span class="hud-panel__title">GALLERY</span>
        <span class="hud-hint">B = close</span>
      </div>

      <div class="gallery-count" id="gp-count">0 images</div>

      <div class="gallery-strip-wrap">
        <button class="gallery-arrow" id="gp-prev" aria-label="Previous">◀</button>
        <div class="gallery-strip" id="gp-strip" role="listbox"></div>
        <button class="gallery-arrow" id="gp-next" aria-label="Next">▶</button>
      </div>

      <div class="gallery-preview-wrap">
        <img class="gallery-preview-img" id="gp-preview" alt="" />
      </div>

      <div class="gallery-info" id="gp-info">—</div>

      <div class="gallery-actions">
        <button class="gp-action-btn" id="gp-load" title="Load to Canvas [Start]">⬆ Load</button>
        <button class="gp-action-btn" id="gp-dl"  title="Download [X]">⬇ Download</button>
        <button class="gp-action-btn" id="gp-del" title="Delete [Y]">✕ Delete</button>
        <button class="gp-action-btn" id="gp-all" title="Download All">⬇ All</button>
        <button class="gp-action-btn gp-action-btn--pub" id="gp-pub" title="Add this image to the gallery" hidden>⇧ Publish</button>
        <button class="gp-action-btn gp-action-btn--pub" id="gp-pub-all" title="Add every session image to the gallery" hidden>⇧ Publish all</button>
      </div>

      <div class="hud-panel__footer">
        <span class="hud-hint hud-hint--dpad">⬅➡ nav &nbsp;·&nbsp; A preview &nbsp;·&nbsp; X down &nbsp;·&nbsp; Y del &nbsp;·&nbsp; Start load</span>
      </div>
    `;

    this._strip   = this._el.querySelector('#gp-strip');
    this._info    = this._el.querySelector('#gp-info');
    this._preview = this._el.querySelector('#gp-preview');
    this._count   = this._el.querySelector('#gp-count');

    this._el.querySelector('#gp-prev').addEventListener('click', () => this._navigate('left'));
    this._el.querySelector('#gp-next').addEventListener('click', () => this._navigate('right'));
    this._el.querySelector('#gp-load').addEventListener('click', () => this._loadToCanvas());
    this._el.querySelector('#gp-dl').addEventListener('click',   () => this._download());
    this._el.querySelector('#gp-del').addEventListener('click',  () => this._delete());
    this._el.querySelector('#gp-all').addEventListener('click',  () => ImageStore.downloadAll());
    this._el.querySelector('#gp-pub').addEventListener('click',  () => this._publish());
    this._el.querySelector('#gp-pub-all').addEventListener('click', () => this._publishAll());

    document.body.appendChild(this._el);
  }

  // ── Events ───────────────────────────────────────────────────────────────────

  _wireEvents() {
    InputManager.on('panelNav', ({ panel, dir }) => {
      if (panel !== 'gallery' || !this._visible) return;
      this._navigate(dir);
    });

    InputManager.on('panelConfirm', ({ panel }) => {
      if (panel !== 'gallery' || !this._visible) return;
      this._fullscreen();
    });

    InputManager.on('closePanel', ({ panel }) => {
      if (panel !== 'gallery' && !this._visible) return;
      this.hide();
    });

    InputManager.on('galleryDownload', () => { if (this._visible) this._download(); });
    InputManager.on('galleryDelete',   () => { if (this._visible) this._delete(); });
    InputManager.on('galleryLoad',     () => { if (this._visible) this._loadToCanvas(); });

    document.addEventListener('ui:toggleGallery', () => this.toggle());

    // Reflect new saves without opening
    document.addEventListener('imagestore:saved', () => {
      if (this._visible) {
        this._active = ImageStore.count - 1;
        this._refresh();
      } else {
        // Briefly show count badge
        this._flashSavedBadge();
      }
    });

    document.addEventListener('imagestore:removed', () => {
      if (this._visible) {
        this._active = Math.max(0, Math.min(this._active, ImageStore.count - 1));
        this._refresh();
      }
    });

    // Images restored from IndexedDB on page load
    document.addEventListener('imagestore:hydrated', e => {
      this._active = Math.max(0, ImageStore.count - 1);
      if (this._visible) this._refresh();
      else if (e.detail.count > 0) this._flashRestoredBadge(e.detail.count);
    });

    document.addEventListener('imagestore:cleared', () => {
      this._active = 0;
      if (this._visible) this._refresh();
    });
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  _navigate(dir) {
    if (ImageStore.count === 0) return;
    if (dir === 'left')  this._active = _wrap(this._active - 1, ImageStore.count);
    if (dir === 'right') this._active = _wrap(this._active + 1, ImageStore.count);
    this._refresh();
  }

  _download() { ImageStore.download(this._active); }

  _delete() {
    ImageStore.remove(this._active);
    this._active = Math.max(0, this._active - 1);
    this._refresh();
  }

  _fullscreen() {
    const entry = ImageStore.get(this._active);
    if (!entry) return;
    const win = window.open('', '_blank');
    win.document.write(`<img src="${entry.url}" style="max-width:100%;max-height:100vh">`);
  }

  _loadToCanvas() {
    const entry = ImageStore.get(this._active);
    if (!entry) return;
    document.dispatchEvent(new CustomEvent('gallery:loadToCanvas', { detail: { url: entry.url } }));
    this.hide();
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  _refresh() {
    const total = ImageStore.count;
    this._count.textContent = `${total} image${total !== 1 ? 's' : ''}`;

    this._strip.innerHTML = '';

    if (total === 0) {
      this._preview.src = '';
      this._info.textContent = 'No saved images yet. Press Start to save.';
      this._syncPublishButtons();
      return;
    }

    // Thumbnail tiles
    ImageStore.all.forEach((entry, i) => {
      const tile = document.createElement('div');
      tile.className = 'gp-thumb';
      if (i === this._active) tile.classList.add('gp-thumb--active');
      if (this._pubState.get(entry.id)) tile.classList.add('gp-thumb--published');

      const img = document.createElement('img');
      img.src = entry.url;
      img.alt = entry.label;
      img.addEventListener('click', () => {
        this._active = i;
        this._refresh();
      });
      img.addEventListener('dblclick', () => this._fullscreen());

      tile.appendChild(img);
      this._strip.appendChild(tile);

      // Scroll active tile into view
      if (i === this._active) {
        requestAnimationFrame(() => tile.scrollIntoView({ inline: 'center', behavior: 'smooth' }));
      }
    });

    // Large preview
    const active = ImageStore.get(this._active);
    this._preview.src = active.url;
    const published = this._pubState.get(active.id) === true;
    this._info.textContent =
      `${active.label} · ${new Date(active.timestamp).toLocaleTimeString()}` +
      (published ? ' · in gallery' : '');
    this._syncPublishButtons();
  }

  // ── Publishing to the on-disk gallery ────────────────────────────

  _syncPublishButtons() {
    const pub = this._el.querySelector('#gp-pub');
    const all = this._el.querySelector('#gp-pub-all');
    const available = GalleryPublisher.available;

    pub.hidden = all.hidden = !available;
    if (!available) return;

    const active    = ImageStore.get(this._active);
    const published = active ? this._pubState.get(active.id) === true : false;

    pub.disabled    = !active || published;
    pub.textContent = published ? '✓ In gallery' : '⇧ Publish';
    all.disabled    = ImageStore.count === 0;
  }

  /** Ask the server what it already has, then mark every session image. */
  async _syncPublished() {
    const available = await GalleryPublisher.refresh();
    if (!available) {
      this._pubState.clear();
      this._syncPublishButtons();
      return;
    }
    for (const entry of ImageStore.all) {
      this._pubState.set(entry.id, (await GalleryPublisher.isPublished(entry)) === true);
    }
    if (this._visible) this._refresh();
  }

  async _publish() {
    const entry = ImageStore.get(this._active);
    if (!entry) return;

    const result = await this._send(entry);
    if (result.status !== 'error') {
      this._flash(result.status === 'duplicate'
        ? '✓ Already in gallery'
        : `⇧ Published ${result.file}`);
    }
    this._refresh();
  }

  async _publishAll() {
    const all = this._el.querySelector('#gp-pub-all');
    all.disabled = true;

    let added = 0, already = 0, failed = 0;
    for (const entry of [...ImageStore.all]) {
      if (this._pubState.get(entry.id) === true) { already++; continue; }
      const result = await this._send(entry);
      if      (result.status === 'added')     added++;
      else if (result.status === 'duplicate') already++;
      else                                    failed++;
    }

    all.disabled = false;
    this._flash(
      `⇧ ${added} added · ${already} already there` + (failed ? ` · ${failed} failed` : ''),
      3000,
    );
    this._refresh();
  }

  async _send(entry) {
    const result = await GalleryPublisher.publish(entry, ImageStore.filename(entry));
    if (result.status === 'error') this._flash(`⚠ ${result.error}`, 3500);
    else this._pubState.set(entry.id, true);
    return result;
  }

  _flash(text, ms = 2000) {
    const badge = document.getElementById('gp-saved-badge') || this._makeBadge();
    badge.textContent = text;
    badge.classList.add('gp-badge--flash');
    clearTimeout(this._flashTimer);
    this._flashTimer = setTimeout(() => badge.classList.remove('gp-badge--flash'), ms);
  }

  _flashSavedBadge() {
    this._flash(`✓ Saved (${ImageStore.count})`);
  }

  _flashRestoredBadge(count) {
    this._flash(`↻ ${count} image${count !== 1 ? 's' : ''} restored`, 2500);
  }

  _makeBadge() {
    const b = document.createElement('div');
    b.id = 'gp-saved-badge';
    b.className = 'gp-saved-badge';
    document.body.appendChild(b);
    return b;
  }
}

function _wrap(val, len) {
  return ((val % len) + len) % len;
}
