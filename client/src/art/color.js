/** Small color helpers for shading the SVG art. */

function clamp(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;
}

/** amount > 0 lightens toward white, amount < 0 darkens toward black. */
export function shade(hex, amount) {
  const rgb = hexToRgb(hex);
  const target = amount >= 0 ? 255 : 0;
  const t = Math.abs(amount);
  return rgbToHex(rgb.map((v) => v + (target - v) * t));
}

/** Base64 data URI — works for <img> tags and for Phaser's loader. */
export function svgToDataUri(svg) {
  const bytes = new TextEncoder().encode(svg);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}
