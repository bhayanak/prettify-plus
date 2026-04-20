import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sizes = [16, 32, 48, 128, 512];

async function generateIcons() {
  const source = resolve(__dirname, '..', 'logo.svg');
  const outDir = resolve(__dirname, '..', 'public', 'icons');

  mkdirSync(outDir, { recursive: true });

  for (const size of sizes) {
    await sharp(source, { density: 300 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(resolve(outDir, `icon-${size}.png`));
    console.log(`✓ Generated icon-${size}.png`);
  }

  console.log(`\nAll ${sizes.length} icons generated in public/icons/`);
}

generateIcons().catch(console.error);
