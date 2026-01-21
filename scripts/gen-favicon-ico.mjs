import fs from "node:fs";
import path from "node:path";

/**
 * Generate a minimal favicon.ico that embeds a PNG image.
 * This avoids "broken favicon" in browsers that still hard-request /favicon.ico.
 *
 * Source: app/favicon.png
 * Output: app/favicon.ico
 */

const root = process.cwd();
const inputPath = path.join(root, "app", "favicon.png");
const outputPath = path.join(root, "app", "favicon.ico");

if (!fs.existsSync(inputPath)) {
  console.error(`Missing ${inputPath}. Put your favicon PNG at app/favicon.png first.`);
  process.exit(1);
}

const png = fs.readFileSync(inputPath);

// Best effort: parse width/height from IHDR to fill ICO directory entry.
// PNG IHDR chunk starts at byte offset 16 with 4-byte width + 4-byte height.
let width = 0;
let height = 0;
if (png.length >= 24 && png.toString("ascii", 12, 16) === "IHDR") {
  width = png.readUInt32BE(16);
  height = png.readUInt32BE(20);
}

// ICO directory entry fields are 1 byte for width/height, where 0 means 256.
const w1 = width >= 256 ? 0 : Math.max(1, Math.min(255, width));
const h1 = height >= 256 ? 0 : Math.max(1, Math.min(255, height));

// ICONDIR (6 bytes)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type = icon
header.writeUInt16LE(1, 4); // count = 1

// ICONDIRENTRY (16 bytes)
const entry = Buffer.alloc(16);
entry.writeUInt8(w1, 0); // width
entry.writeUInt8(h1, 1); // height
entry.writeUInt8(0, 2); // color count
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bit count (best-effort)
entry.writeUInt32LE(png.length, 8); // bytes in resource
entry.writeUInt32LE(header.length + entry.length, 12); // image offset

fs.writeFileSync(outputPath, Buffer.concat([header, entry, png]));
console.log(`Wrote ${path.relative(root, outputPath)} from ${path.relative(root, inputPath)} (${width}x${height})`);
