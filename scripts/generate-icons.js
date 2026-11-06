import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPNG(size, isMaskable = false) {
  const width = size;
  const height = size;

  // Raw RGBA pixel rows: width * 4 bytes + 1 filter byte per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;
  const innerRadius = width * 0.35;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background
      let r = 15, g = 17, b = 23, a = 255; // #0f1117 deep esports dark

      if (isMaskable) {
        // Full bleed esports dark background with subtle radial gradient
        const grad = Math.min(1, dist / (width * 0.7));
        r = Math.floor(18 + (30 - 18) * grad);
        g = Math.floor(15 + (18 - 15) * grad);
        b = Math.floor(28 + (38 - 28) * grad);
      }

      // Outer neon ring / shield
      if (dist < radius && dist > innerRadius) {
        // Red-purple neon glow
        const angle = Math.atan2(dy, dx);
        const mix = (Math.sin(angle) + 1) / 2;
        r = Math.floor(239 * mix + 168 * (1 - mix)); // #ef4444 to #a855f7
        g = Math.floor(68 * mix + 85 * (1 - mix));
        b = Math.floor(68 * mix + 247 * (1 - mix));
      } else if (dist <= innerRadius) {
        // Core flame / gaming shield emblem
        const inCenterBox = Math.abs(dx) < width * 0.22 && Math.abs(dy) < height * 0.22;
        const isCrosshair = (Math.abs(dx) < width * 0.04 && Math.abs(dy) < height * 0.28) ||
                            (Math.abs(dy) < height * 0.04 && Math.abs(dx) < width * 0.28);

        if (inCenterBox || isCrosshair) {
          // Fiery crimson orange accent
          r = 255; g = 75; b = 43; // #ff4b2b
        } else {
          r = 24; g = 24; b = 37;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // no interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idat = createChunk('IDAT', deflated);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Generate PNGs
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, false));

// Generate SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="ffGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="50%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#090a0f" />
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background base -->
  <rect width="512" height="512" rx="112" fill="#0b0d14" />
  
  <!-- Outer Shield Border -->
  <path d="M256 48 L416 112 V256 C416 352 344 424 256 464 C168 424 96 352 96 256 V112 Z" 
        fill="url(#shieldGrad)" stroke="url(#ffGrad)" stroke-width="12" filter="url(#neonGlow)"/>

  <!-- Esports Wings / Crosshair Crest -->
  <path d="M160 210 L256 140 L352 210 L330 290 L256 340 L182 290 Z" 
        fill="#131722" stroke="#f43f5e" stroke-width="6"/>

  <!-- Stylized "FF" Fire Emblem -->
  <path d="M210 180 H302 V212 H242 V236 H290 V266 H242 V330 H204 Z" fill="url(#ffGrad)" />
  <path d="M308 236 L340 236 L330 300 L298 300 Z" fill="#f97316" opacity="0.85" />

  <!-- Stars -->
  <circle cx="256" cy="116" r="6" fill="#fbbf24" />
  <circle cx="230" cy="124" r="4" fill="#fbbf24" opacity="0.8" />
  <circle cx="282" cy="124" r="4" fill="#fbbf24" opacity="0.8" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

// Generate offline fallback page
const offlineHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline | FF TOURNAMENT PRO</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #090a0f;
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      max-width: 440px;
      padding: 32px 24px;
      background: #111420;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
      margin: 16px;
    }
    .badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #ef4444;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      margin: 0 0 12px;
      color: #ffffff;
    }
    p {
      color: #9ca3af;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    button {
      background: linear-gradient(135deg, #ef4444, #a855f7);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:active {
      transform: scale(0.96);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Connection Offline</div>
    <h1>You're Currently Offline</h1>
    <p>FF TOURNAMENT PRO requires an active network connection to sync match rooms, live slots, and wallet balance. Please check your internet connection.</p>
    <button onclick="window.location.reload()">Retry Connection</button>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'offline.html'), offlineHtml);

console.log('Successfully generated icons, offline page, and assets in public/');
