import { access } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = path.resolve(import.meta.dirname, '..');
const logoPath = path.join(root, 'public/logo.png');

await access(logoPath);

const publicDir = path.join(root, 'public');

async function png(size, dest) {
  await sharp(logoPath)
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, dest));
}

await png(16, 'favicon-16.png');
await png(32, 'favicon-32.png');
await png(48, 'favicon-48.png');
await png(180, 'apple-touch-icon.png');
await png(192, 'icon-192.png');
await png(512, 'icon-512.png');

const ico = await pngToIco([
  path.join(publicDir, 'favicon-16.png'),
  path.join(publicDir, 'favicon-32.png'),
  path.join(publicDir, 'favicon-48.png'),
]);
await writeFile(path.join(publicDir, 'favicon.ico'), ico);

const logo = await sharp(logoPath).resize(280, 280).png().toBuffer();
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f3fbfc"/>
  <rect width="18" height="630" fill="#0a6274"/>
  <text x="470" y="270" fill="#102226" font-family="Inter, Noto Sans, sans-serif" font-size="68" font-weight="700">Momentum Apps</text>
  <text x="470" y="350" fill="#3a5158" font-family="Inter, Noto Sans, sans-serif" font-size="34">Apps that help you build momentum</text>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: 110, top: 175 }])
  .png()
  .toFile(path.join(publicDir, 'og.png'));

console.log('Wrote favicons, app icons, and og.png from public/logo.png');
