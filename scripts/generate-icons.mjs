/*
 * Generates the Raah PWA PNG icons (192, 512, and maskable 512) from the
 * same geometry as public/logo.svg. Pure Node: no image libraries, no network.
 * Run with: npm run icons
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

/* ---------- PNG encoding ---------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- Geometry (512-unit design space, matching logo.svg) ---------- */

const COLORS = {
  indigo: [40, 53, 147],
  offwhite: [246, 247, 251],
  mint: [94, 234, 212],
};

// The Raah "R" route: stem, bowl, leg. Quadratic beziers sampled into segments.
const ROUTE_PATH = [
  { type: 'line', from: [176, 400], to: [176, 150] },
  { type: 'quad', from: [176, 150], control: [176, 118], to: [216, 116] },
  { type: 'quad', from: [216, 116], control: [300, 112], to: [312, 168] },
  { type: 'quad', from: [312, 168], control: [322, 220], to: [258, 234] },
  { type: 'line', from: [258, 234], to: [192, 248] },
  { type: 'line', from: [192, 248], to: [338, 392] },
];

const ROUTE_STROKE = 30;
const DOT_CENTER = [356, 400];
const DOT_RADIUS = 34;
const DOT_INNER = 14;

function sampleQuad(p0, c, p1, steps = 24) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    pts.push([
      u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
      u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
    ]);
  }
  return pts;
}

function buildPolyline(scale, centerX, centerY) {
  const pts = [];
  const map = ([x, y]) => [centerX + (x - 256) * scale, centerY + (y - 256) * scale];
  for (const seg of ROUTE_PATH) {
    if (seg.type === 'line') {
      pts.push(map(seg.from), map(seg.to));
    } else {
      pts.push(...sampleQuad(map(seg.from), map(seg.control), map(seg.to)));
    }
  }
  return pts;
}

function segDist(px, py, a, b) {
  const vx = b[0] - a[0];
  const vy = b[1] - a[1];
  const wx = px - a[0];
  const wy = py - a[1];
  const len2 = vx * vx + vy * vy;
  let t = len2 === 0 ? 0 : (wx * vx + wy * vy) / len2;
  t = Math.max(0, Math.min(1, t));
  const dx = px - (a[0] + t * vx);
  const dy = py - (a[1] + t * vy);
  return Math.hypot(dx, dy);
}

function distToPolyline(px, py, pts) {
  let min = Infinity;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const d = segDist(px, py, pts[i], pts[i + 1]);
    if (d < min) min = d;
  }
  return min;
}

function roundedRectSdf(px, py, x0, y0, x1, y1, r) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const hw = (x1 - x0) / 2;
  const hh = (y1 - y0) / 2;
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const mix = (a, b, t) => a + (b - a) * t;
const mixColor = (a, b, t) => [
  Math.round(mix(a[0], b[0], t)),
  Math.round(mix(a[1], b[1], t)),
  Math.round(mix(a[2], b[2], t)),
];

/* ---------- Rendering ---------- */

function renderIcon(size, { maskable = false } = {}) {
  const k = size / 512;
  const aa = 0.75 / k; // ~0.75 device px of anti-aliasing in design units
  const contentScale = maskable ? 0.76 : 1;
  const centerX = size / 2;
  const centerY = size / 2;
  const polyline = buildPolyline(contentScale * k, centerX, centerY);
  const dotC = [
    centerX + (DOT_CENTER[0] - 256) * contentScale * k,
    centerY + (DOT_CENTER[1] - 256) * contentScale * k,
  ];
  const dotR = DOT_RADIUS * contentScale * k;
  const dotInner = DOT_INNER * contentScale * k;
  const strokeHalf = (ROUTE_STROKE / 2) * contentScale * k;

  // Rounded-square background bounds (in device px).
  const bgInset = maskable ? 0 : 16 * k;
  const bgRadius = maskable ? 0 : 112 * k;

  const rgba = Buffer.alloc(size * size * 4);
  const SUB = [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.25, 0.75],
    [0.75, 0.75],
  ];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let rAcc = 0;
      let gAcc = 0;
      let bAcc = 0;
      let aAcc = 0;
      for (const [dx, dy] of SUB) {
        const px = x + dx;
        const py = y + dy;
        // Background coverage.
        let bgAlpha;
        if (maskable) {
          bgAlpha = 1;
        } else {
          const d = roundedRectSdf(px, py, bgInset, bgInset, size - bgInset, size - bgInset, bgRadius);
          bgAlpha = clamp01(0.5 - d / Math.max(aa, 0.5));
        }
        if (bgAlpha <= 0) continue;

        let color = COLORS.indigo;
        // Route stroke.
        const dRoute = distToPolyline(px, py, polyline) - strokeHalf;
        const routeAlpha = clamp01(0.5 - dRoute / Math.max(aa, 0.5));
        if (routeAlpha > 0) color = mixColor(color, COLORS.offwhite, routeAlpha);
        // Waypoint dot: mint disc with indigo core.
        const distDot = Math.hypot(px - dotC[0], py - dotC[1]);
        const dotAlpha = clamp01(0.5 - (distDot - dotR) / Math.max(aa, 0.5));
        if (dotAlpha > 0) color = mixColor(color, COLORS.mint, dotAlpha);
        const coreAlpha = clamp01(0.5 - (distDot - dotInner) / Math.max(aa, 0.5));
        if (coreAlpha > 0) color = mixColor(color, COLORS.indigo, coreAlpha);

        rAcc += color[0] * bgAlpha;
        gAcc += color[1] * bgAlpha;
        bAcc += color[2] * bgAlpha;
        aAcc += bgAlpha;
      }
      const samples = SUB.length;
      const alpha = aAcc / samples;
      const idx = (y * size + x) * 4;
      if (alpha > 0) {
        rgba[idx] = Math.round(rAcc / aAcc);
        rgba[idx + 1] = Math.round(gAcc / aAcc);
        rgba[idx + 2] = Math.round(bAcc / aAcc);
        rgba[idx + 3] = Math.round(alpha * 255);
      }
    }
  }
  return encodePng(size, rgba);
}

const targets = [
  { file: 'raah-icon-192.png', size: 192, opts: {} },
  { file: 'raah-icon-512.png', size: 512, opts: {} },
  { file: 'raah-maskable-512.png', size: 512, opts: { maskable: true } },
];

for (const { file, size, opts } of targets) {
  const png = renderIcon(size, opts);
  writeFileSync(join(outDir, file), png);
  console.log(`wrote ${file} (${png.length} bytes)`);
}
