const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Simple CRC32 implementation for PNG chunks
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([len, typeAndData, crc]);
}

function generatePng(width, height, drawIcon = true) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data: height rows, each row has 1 filter byte + width * 4 bytes
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowBytes);

  const bgR = 15, bgG = 23, bgB = 42; // #0f172a navy
  const crossR = 37, crossG = 99, crossB = 235; // #2563eb blue
  const cyanR = 6, cyanG = 182, cyanB = 212; // #06b6d4 cyan

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Draw rounded background and centered medical cross
      const cx = width / 2;
      const cy = height / 2;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);

      const crossThickness = width * 0.14;
      const crossArmLength = width * 0.34;

      const isVertical = dx < crossThickness && dy < crossArmLength;
      const isHorizontal = dy < crossThickness && dx < crossArmLength;

      if (drawIcon && (isVertical || isHorizontal)) {
        // Gradient from cyan to blue
        const t = (x + y) / (width + height);
        rawData[pixelOffset] = Math.round(cyanR * (1 - t) + crossR * t);
        rawData[pixelOffset + 1] = Math.round(cyanG * (1 - t) + crossG * t);
        rawData[pixelOffset + 2] = Math.round(cyanB * (1 - t) + crossB * t);
        rawData[pixelOffset + 3] = 255;
      } else {
        rawData[pixelOffset] = bgR;
        rawData[pixelOffset + 1] = bgG;
        rawData[pixelOffset + 2] = bgB;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('Generating 1024x1024 icon.png...');
const iconPng = generatePng(1024, 1024, true);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconPng);

console.log('Generating 1024x1024 adaptive-icon.png...');
const adaptiveIcon = generatePng(1024, 1024, true);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveIcon);

console.log('Generating 1284x2778 splash.png...');
const splashPng = generatePng(600, 1000, true);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splashPng);

console.log('Generating favicon.png...');
const faviconPng = generatePng(48, 48, true);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), faviconPng);

console.log('All mobile assets successfully created in mobile-app/assets!');
