// Génère les icônes de l'application et l'image de partage (à relancer si le symbole change).
// Usage : NODE_PATH="$(npm root -g)" node scripts/icones.mjs   (nécessite sharp)
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { cornet } from '../src/lib.mjs';
const sharp = createRequire(import.meta.url)('sharp');

function symbole(taille, D, { arrondi = 0, fond = '#A3D5C5', largeur = taille, hauteur = taille } = {}) {
  const svg = cornet(3, D, 'vert', { label: false });
  const w = 1.8 * D; const h = 2.6 * D;
  const interieur = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const x = (largeur - w) / 2; const y = (hauteur - h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}"><rect width="${largeur}" height="${hauteur}" rx="${arrondi}" fill="${fond}"/><g transform="translate(${x} ${y})">${interieur}</g></svg>`;
}

const sortie = new URL('../public/icons/', import.meta.url);
const png = (svg, nom) => sharp(Buffer.from(svg)).png().toFile(new URL(nom, sortie).pathname);
writeFileSync(new URL('favicon.svg', sortie), symbole(64, 18, { arrondi: 14 }));
await png(symbole(512, 112, { arrondi: 0 }), 'icon-512.png');
await png(symbole(192, 42, { arrondi: 0 }), 'icon-192.png');
await png(symbole(512, 92, { arrondi: 0 }), 'icon-maskable-512.png');
await png(symbole(180, 40, { arrondi: 0 }), 'apple-touch-icon.png');
await png(symbole(0, 120, { largeur: 1200, hauteur: 630 }), 'og.png');
console.log('Icônes générées.');
