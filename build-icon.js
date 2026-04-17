// Gera ícone do Bank: SVG com gradiente + símbolo de carteira, em PNG e ICO multi-size.
// Usado pelo electron-builder (build/icon.ico) e pela bandeja/tray (build/icon.png).

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;

const outDir = path.join(__dirname, 'build');
fs.mkdirSync(outDir, { recursive: true });

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="#6366f1"/>
      <stop offset="55%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="256" height="256" rx="52" ry="52" fill="url(#bg)"/>
  <circle cx="40"  cy="40"  r="90" fill="white" opacity="0.08"/>
  <circle cx="230" cy="220" r="70" fill="white" opacity="0.06"/>

  <!-- Carteira (wallet) estilizada, centralizada -->
  <g transform="translate(54 74)" fill="none" stroke="white" stroke-width="10" stroke-linejoin="round" stroke-linecap="round">
    <rect x="0" y="12" width="148" height="96" rx="16" fill="rgba(255,255,255,0.12)"/>
    <path d="M 10 12 C 10 4, 16 -2, 24 -2 L 120 -2 C 128 -2, 134 4, 134 12 L 10 12 Z" fill="rgba(255,255,255,0.18)"/>
    <rect x="96" y="48" width="60" height="28" rx="8" fill="white" stroke="none"/>
    <circle cx="120" cy="62" r="5" fill="#a855f7" stroke="none"/>
  </g>
</svg>`;

async function main() {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const buffers = [];
  for (const s of sizes) {
    const buf = await sharp(Buffer.from(svg)).resize(s, s).png().toBuffer();
    buffers.push(buf);
    if (s === 256) fs.writeFileSync(path.join(outDir, 'icon.png'), buf);
    if (s === 64)  fs.writeFileSync(path.join(outDir, 'tray.png'), buf);
  }

  const ico = await pngToIco(buffers);
  fs.writeFileSync(path.join(outDir, 'icon.ico'), ico);
  console.log('Ícones gerados:');
  console.log('  build/icon.ico  (multi-size)');
  console.log('  build/icon.png  (256x256)');
  console.log('  build/tray.png  (64x64)');
}

main().catch(err => { console.error(err); process.exit(1); });
