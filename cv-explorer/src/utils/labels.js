import * as THREE from 'three';

/**
 * Canvas-drawn textures for the in-world signage.
 *
 * Everything the road displays is generated at runtime: no font files, no
 * texture atlases, nothing to 404 on GitHub Pages. Each helper returns a
 * CanvasTexture already flagged sRGB so colours match the CSS palette.
 */

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function toTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** Greedy word wrap. Returns at most `maxLines` lines, ellipsising the last. */
export function wrapText(ctx, text, maxWidth, maxLines = 3) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);

  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxWidth) {
      while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = `${last}…`;
    }
  }
  return lines;
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * The plaque that floats beside each station: date, kind, title, affiliation.
 * Returns { texture, aspect } so the caller can size the plane correctly.
 */
export function createPlaqueTexture({ when, kindLabel, title, org, color }) {
  const W = 1024;
  const H = 512;
  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const pad = 44;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(9, 13, 24, 0.88)';
  roundedRect(ctx, 6, 6, W - 12, H - 12, 26);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  roundedRect(ctx, 6, 6, W - 12, H - 12, 26);
  ctx.stroke();

  // accent bar down the left edge
  ctx.fillStyle = color;
  roundedRect(ctx, 22, 26, 8, H - 52, 4);
  ctx.fill();

  let y = pad + 34;

  ctx.fillStyle = color;
  ctx.font = `600 34px ${FONT_STACK}`;
  ctx.fillText(String(when).toUpperCase(), pad + 22, y);

  const whenWidth = ctx.measureText(String(when).toUpperCase()).width;
  ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
  ctx.font = `500 28px ${FONT_STACK}`;
  ctx.fillText(`· ${kindLabel}`, pad + 34 + whenWidth, y);

  y += 26;

  ctx.fillStyle = '#f8fafc';
  ctx.font = `700 52px ${FONT_STACK}`;
  const titleLines = wrapText(ctx, title, W - pad * 2 - 40, 3);
  for (const line of titleLines) {
    y += 60;
    ctx.fillText(line, pad + 22, y);
  }

  if (org) {
    ctx.fillStyle = 'rgba(203, 213, 225, 0.8)';
    ctx.font = `400 30px ${FONT_STACK}`;
    const orgLines = wrapText(ctx, org, W - pad * 2 - 40, 2);
    y += 18;
    for (const line of orgLines) {
      y += 40;
      ctx.fillText(line, pad + 22, y);
    }
  }

  return { texture: toTexture(canvas), aspect: W / H };
}

/** Big year numeral used for the era gates straddling the road. */
export function createYearTexture(year, color) {
  const W = 512;
  const H = 256;
  const canvas = makeCanvas(W, H);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 150px ${FONT_STACK}`;
  ctx.fillStyle = color;
  ctx.fillText(String(year), W / 2, H / 2 + 6);

  return { texture: toTexture(canvas), aspect: W / H };
}
