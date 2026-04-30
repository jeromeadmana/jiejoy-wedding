#!/usr/bin/env node
// Resize + recompress an image in-place. Use before committing any
// source image larger than ~2 MB to public/ — keeps the git repo
// from bloating.
//
// Usage:
//   node scripts/optimize-image.mjs <path> [--width 2400] [--quality 85]
//
// Examples:
//   node scripts/optimize-image.mjs public/images/hero.jpg
//   node scripts/optimize-image.mjs public/images/wide.png --width 1600
//
// Defaults are tuned for a hero/full-bleed photo on a retina display.
// For thumbnails, lower the width (e.g. 1200) and you'll get well
// under 200 KB.

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const out = { width: 2400, quality: 85 };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--width") out.width = Number(argv[++i]);
    else if (a === "--quality") out.quality = Number(argv[++i]);
    else if (a === "-h" || a === "--help") out.help = true;
    else positional.push(a);
  }
  out.input = positional[0];
  return out;
}

function help() {
  console.log(
    "Usage: node scripts/optimize-image.mjs <path> [--width 2400] [--quality 85]",
  );
}

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.input) {
  help();
  process.exit(args.help ? 0 : 1);
}

const src = path.resolve(args.input);
if (!fs.existsSync(src)) {
  console.error(`File not found: ${src}`);
  process.exit(1);
}

const ext = path.extname(src).toLowerCase();
const tmp = `${src}.optimized${ext}`;

const before = fs.statSync(src).size;
const meta = await sharp(src).metadata();

let pipeline = sharp(src).resize({
  width: args.width,
  withoutEnlargement: true,
});

if (ext === ".png") {
  pipeline = pipeline.png({ quality: args.quality, compressionLevel: 9 });
} else if (ext === ".webp") {
  pipeline = pipeline.webp({ quality: args.quality });
} else {
  // jpg / jpeg / unknown — fall through to mozjpeg
  pipeline = pipeline.jpeg({ quality: args.quality, mozjpeg: true });
}

await pipeline.toFile(tmp);

const after = fs.statSync(tmp).size;

// Don't replace if the "optimized" file is somehow larger — sometimes
// happens with already-compressed sources at high quality settings.
if (after >= before) {
  fs.unlinkSync(tmp);
  console.log(
    `No improvement (${fmt(after)} ≥ ${fmt(before)}). Original kept.`,
  );
  process.exit(0);
}

fs.renameSync(tmp, src);

const reduction = (((before - after) / before) * 100).toFixed(1);
console.log(`${path.relative(process.cwd(), src)}`);
console.log(`  ${meta.width}×${meta.height} → max ${args.width}px wide`);
console.log(`  ${fmt(before)} → ${fmt(after)} (-${reduction}%)`);

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}
