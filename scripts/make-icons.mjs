// 앱 아이콘 래스터화 — docs/design/app-icon.svg → public/icons/*.png (gate-2 2절 5항, tech-stack 6·7절)
// 192 · 512 · 512 maskable(같은 SVG: 배경이 전면을 채우고 안전 영역 안에 그림이 있음) · 180 apple-touch-icon(불투명, 모서리 각짐).
import sharp from 'sharp';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(here, '..', 'docs', 'design', 'app-icon.svg'));
const outDir = join(here, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const BG = '#1C1C1E'; // app-icon.svg 배경과 동일
for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-512-maskable.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  const buf = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .flatten({ background: BG }) // 투명 제거 (iOS 조건)
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(join(outDir, name), buf);
  const meta = await sharp(buf).metadata();
  console.log('wrote', name, `${meta.width}x${meta.height}`, meta.hasAlpha ? 'alpha' : 'opaque', `${(buf.length / 1024).toFixed(1)} KB`);
}
