/**
 * Test setup — stubs for browser APIs that jsdom doesn't fully implement.
 *
 * Three.js's CanvasTexture path calls HTMLCanvasElement.prototype.getContext('2d')
 * which jsdom does NOT implement (it throws "Not implemented"). We override it
 * with a no-op stub so Book.createEmblem() and TextRenderer work in tests.
 */
import { vi } from 'vitest';

// requestAnimationFrame — jsdom doesn't provide it
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// Forcefully override getContext — jsdom defines it but throws "Not implemented".
const ctxStub = {
  scale: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  clearRect: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  quadraticCurveTo: () => {},
  closePath: () => {},
  fill: () => {},
  stroke: () => {},
  fillText: () => {},
  strokeText: () => {},
  measureText: () => ({ width: 10, actualBoundingBoxAscent: 5, actualBoundingBoxDescent: 2 }),
  save: () => {},
  restore: () => {},
  translate: () => {},
  rotate: () => {},
  createRadialGradient: () => ({ addColorStop: () => {} }),
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createPattern: () => ({}),
  drawImage: () => {},
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  putImageData: () => {},
  arc: () => {},
  ellipse: () => {},
  rect: () => {},
  set fillStyle(_) {},
  get fillStyle() { return '#000'; },
  set strokeStyle(_) {},
  get strokeStyle() { return '#000'; },
  set lineWidth(_) {},
  get lineWidth() { return 1; },
  set lineCap(_) {},
  get lineCap() { return 'butt'; },
  set lineJoin(_) {},
  get lineJoin() { return 'miter'; },
  set font(_) {},
  get font() { return '10px sans-serif'; },
  set textAlign(_) {},
  get textAlign() { return 'left'; },
  set textBaseline(_) {},
  get textBaseline() { return 'alphabetic'; },
  set globalAlpha(_) {},
  get globalAlpha() { return 1; },
  set globalCompositeOperation(_) {},
  get globalCompositeOperation() { return 'source-over'; },
  set shadowBlur(_) {},
  get shadowBlur() { return 0; },
  set shadowColor(_) {},
  get shadowColor() { return 'rgba(0, 0, 0, 0)'; },
  set shadowOffsetX(_) {},
  get shadowOffsetX() { return 0; },
  set shadowOffsetY(_) {},
  get shadowOffsetY() { return 0; },
  set mitreLimit(_) {},
  get mitreLimit() { return 10; },
  canvas: null
};

HTMLCanvasElement.prototype.getContext = function () {
  return ctxStub;
};

vi.stubGlobal('__TEST__', true);
