/**
 * utils.js
 * Shared utility functions used across _global_interface modules.
 * Import or include this before gui.js and gamepadSketch.js.
 */

/**
 * Round a float to 1 decimal place (used for gamepad axis display).
 * @param {number} x
 * @returns {number}
 */
function financial(x) {
  return Number.parseFloat(x).toFixed(1);
}

/**
 * Returns a random number between min and max.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Wrap val into the range [0, len).
 * @param {number} val
 * @param {number} len
 * @returns {number}
 */
function wrapIndex(val, len) {
  return ((val % len) + len) % len;
}
