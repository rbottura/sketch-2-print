/**
 * imageStore.js
 * In-memory store for images captured from the drawing canvas.
 * Each entry: { dataUrl, label, timestamp, width, height }
 *
 * Emits DOM CustomEvents on the document so UI panels stay in sync:
 *   'imagestore:saved'   — { detail: { index, entry } }
 *   'imagestore:removed' — { detail: { index } }
 *   'imagestore:cleared' — {}
 */

const _images = [];

export const ImageStore = {
  /** All saved entries (read-only view). */
  get all() { return _images; },

  get count() { return _images.length; },

  /**
   * Capture the current state of a canvas/p5.Graphics and save it.
   * @param {HTMLCanvasElement} canvas
   * @param {string} [label]
   * @returns {number} index of the saved image
   */
  save(canvas, label = '') {
    const dataUrl = canvas.toDataURL('image/png');
    const entry = {
      dataUrl,
      label:     label || `Draw ${_images.length + 1}`,
      timestamp: Date.now(),
      width:     canvas.width,
      height:    canvas.height,
    };
    _images.push(entry);
    const index = _images.length - 1;
    _dispatch('imagestore:saved', { index, entry });
    return index;
  },

  /** Get a single entry by index. */
  get(index) { return _images[index] ?? null; },

  /** Remove entry at index. */
  remove(index) {
    if (index < 0 || index >= _images.length) return;
    _images.splice(index, 1);
    _dispatch('imagestore:removed', { index });
  },

  /** Clear all saved images. */
  clear() {
    _images.length = 0;
    _dispatch('imagestore:cleared', {});
  },

  /**
   * Trigger a browser download for an entry.
   * @param {number} index
   */
  download(index) {
    const entry = _images[index];
    if (!entry) return;
    const a = document.createElement('a');
    a.href = entry.dataUrl;
    a.download = `${entry.label.replace(/\s+/g, '_')}_${entry.timestamp}.png`;
    a.click();
  },

  /** Download all images as individual files (sequential, ~200ms apart). */
  downloadAll() {
    _images.forEach((_, i) => {
      setTimeout(() => ImageStore.download(i), i * 200);
    });
  },
};

function _dispatch(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}
