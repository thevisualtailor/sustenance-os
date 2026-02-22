/**
 * Generate PWA icons using pure Node.js with zlib for PNG compression.
 * Creates solid dark background (#0a0a0a) PNG files at required sizes.
 */
import { createWriteStream } from 'fs';
import { deflateSync } from 'zlib';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');

/**
 * Build a minimal valid PNG from scratch.
 * Spec: https://www.w3.org/TR/PNG/
 */
function buildPNG(width, height, r, g, b) {
  // Helper to write a 4-byte big-endian uint32
  function uint32BE(n) {
    const buf = Buffer.allocUnsafe(4);
    buf.writeUInt32BE(n, 0);
    return buf;
  }

  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(data) {
    let crc = 0xffffffff;
    for (const byte of data) {
      crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const len = uint32BE(data.length);
    const crcInput = Buffer.concat([typeBytes, data]);
    const crc = uint32BE(crc32(crcInput));
    return Buffer.concat([len, typeBytes, data, crc]);
  }

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: width, height, bit depth 8, color type 2 (RGB), compression 0, filter 0, interlace 0
  const ihdrData = Buffer.concat([
    uint32BE(width),
    uint32BE(height),
    Buffer.from([8, 2, 0, 0, 0]),
  ]);
  const ihdr = chunk('IHDR', ihdrData);

  // IDAT: raw image data (filter byte 0 + RGB per row)
  const rowSize = 1 + width * 3; // filter byte + RGB bytes
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    rawData[offset] = 0; // filter type: None
    for (let x = 0; x < width; x++) {
      rawData[offset + 1 + x * 3 + 0] = r;
      rawData[offset + 1 + x * 3 + 1] = g;
      rawData[offset + 1 + x * 3 + 2] = b;
    }
  }
  const compressed = deflateSync(rawData);
  const idat = chunk('IDAT', compressed);

  // IEND
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Dark background color: #0a0a0a
const R = 0x0a;
const G = 0x0a;
const B = 0x0a;

const icons = [
  { name: 'pwa-512x512.png', width: 512, height: 512 },
  { name: 'pwa-192x192.png', width: 192, height: 192 },
  { name: 'apple-touch-icon.png', width: 180, height: 180 },
];

for (const icon of icons) {
  const pngData = buildPNG(icon.width, icon.height, R, G, B);
  const outPath = resolve(publicDir, icon.name);
  const stream = createWriteStream(outPath);
  stream.write(pngData);
  stream.end();
  console.log(`Generated ${outPath} (${pngData.length} bytes)`);
}
