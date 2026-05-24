// Render tools/icon-gen/icon.svg to all the PNG sizes Expo expects.
// Run: node tools/icon-gen/render.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..');
const ASSETS = path.join(REPO, 'app', 'assets');

const iconSvg = fs.readFileSync(path.join(__dirname, 'icon.svg'));
const wordmarkSvg = fs.readFileSync(path.join(__dirname, 'wordmark.svg'));

// Compact "Nb." mark — for app icon (small home-screen square)
const iconTargets = [
  { name: 'icon.png', size: 1024 },
  { name: 'android-icon-foreground.png', size: 1024 },
  { name: 'favicon.png', size: 48 },
];

// Full "Naam Bolo" wordmark — for splash + marketing
const wordmarkTargets = [
  { name: 'splash-icon.png', size: 1024 },
  { name: 'wordmark.png', size: 1024 },
];

for (const t of iconTargets) {
  const out = path.join(ASSETS, t.name);
  await sharp(iconSvg, { density: 300 }).resize(t.size, t.size, { fit: 'cover' }).png().toFile(out);
  console.log(`✓ ${t.name} — icon mark (${t.size}×${t.size})`);
}

for (const t of wordmarkTargets) {
  const out = path.join(ASSETS, t.name);
  await sharp(wordmarkSvg, { density: 300 }).resize(t.size, t.size, { fit: 'cover' }).png().toFile(out);
  console.log(`✓ ${t.name} — wordmark (${t.size}×${t.size})`);
}

// Android adaptive background — solid filmi pink under the foreground.
const bgPng = path.join(ASSETS, 'android-icon-background.png');
await sharp({
  create: { width: 1024, height: 1024, channels: 3, background: '#ff2d6f' },
})
  .png()
  .toFile(bgPng);
console.log(`✓ android-icon-background.png (1024×1024 solid filmi pink) → ${bgPng}`);

console.log('\nAll icons regenerated.');
