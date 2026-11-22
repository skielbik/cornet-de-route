// Outils et composants partagés par toutes les pages.

export const COULEURS = {
  vert: '#A3D5C5',
  chocolat: '#3B2418',
  framboise: '#B8325A',
  creme: '#F6EFE2',
  caramel: '#C98A4B',
  blanc: '#FFFFFF',
};

export const DISTINCTIONS = {
  1: { label: 'Une boule', sens: 'Une très bonne adresse.' },
  2: { label: 'Deux boules', sens: "Mérite qu'on fasse un crochet." },
  3: { label: 'Trois boules', sens: "Une glace d'exception, une raison de partir." },
};

export const CRITERES = [
  { cle: 'gout', label: 'Goût', sens: 'Intensité et justesse des saveurs.' },
  { cle: 'texture', label: 'Texture', sens: 'Onctuosité, absence de cristaux de glace.' },
  { cle: 'ingredients', label: 'Ingrédients', sens: "Fabrication artisanale sur place, produits frais, pas d'arômes artificiels." },
  { cle: 'parfums', label: 'Parfums', sens: 'Choix et originalité des parfums.' },
];

export const OPTIONS = [
  { cle: 'vegan', label: 'Vegan' },
  { cle: 'sans_lactose', label: 'Sans lactose' },
  { cle: 'cornet_sans_gluten', label: 'Cornet sans gluten' },
];

// Codes ISO des pays, pour les données lues par Google.
export const CODES_PAYS = {
  'afrique du sud': 'ZA', allemagne: 'DE', argentine: 'AR', australie: 'AU', autriche: 'AT',
  belgique: 'BE', bresil: 'BR', canada: 'CA', chili: 'CL', chine: 'CN', 'coree du sud': 'KR',
  croatie: 'HR', danemark: 'DK', egypte: 'EG', espagne: 'ES', 'etats-unis': 'US', finlande: 'FI',
  france: 'FR', grece: 'GR', hongrie: 'HU', inde: 'IN', indonesie: 'ID', irlande: 'IE', islande: 'IS',
  israel: 'IL', italie: 'IT', japon: 'JP', liban: 'LB', luxembourg: 'LU', malte: 'MT', maroc: 'MA',
  maurice: 'MU', mexique: 'MX', monaco: 'MC', norvege: 'NO', 'nouvelle-zelande': 'NZ', 'pays-bas': 'NL',
  perou: 'PE', pologne: 'PL', portugal: 'PT', 'republique tcheque': 'CZ', 'royaume-uni': 'GB',
  singapour: 'SG', slovenie: 'SI', suede: 'SE', suisse: 'CH', thailande: 'TH', tunisie: 'TN',
  turquie: 'TR', vietnam: 'VN',
};

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function esc(valeur) {
  return String(valeur ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function sansAccents(texte) {
  return String(texte ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function slugify(texte) {
  return sansAccents(texte)
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function dateFr(iso) {
  if (!iso) return '';
  const [a, m, j] = String(iso).slice(0, 10).split('-').map(Number);
  if (!a || !m || !j) return '';
  return `${j === 1 ? '1er' : j} ${MOIS[m - 1]} ${a}`;
}

export function codePays(pays) {
  return CODES_PAYS[sansAccents(pays).toLowerCase()] || pays;
}

export function itineraire(adresse) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adresse)}`;
}

// Paragraphes séparés par une ligne vide ; *italique* et **gras** autorisés.
export function paragraphes(texte, classe = '') {
  const attr = classe ? ` class="${classe}"` : '';
  return String(texte ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p${attr}>${enLigne(p)}</p>`)
    .join('');
}

export function enLigne(texte) {
  return esc(texte)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// Le cornet qui se remplit, d'après la géométrie de la charte (diamètre de boule D).
export function cornet(n, D = 20, fond = 'blanc', { label = true } = {}) {
  const nb = [1, 2, 3].includes(Number(n)) ? Number(n) : 1;
  const liseré = COULEURS[fond] || fond;
  const trait = Math.max(1, Math.round(D * 0.07 * 10) / 10);
  const r = D / 2 - trait / 2;
  const largeur = nb === 1 ? D : 1.8 * D;
  const decalage = nb === 3 ? 0.65 * D : 0;
  const yBas = decalage + D / 2;
  const centre = largeur / 2;
  const haut = decalage + 0.75 * D;
  const hauteur = haut + 1.2 * D;
  const cone = `<polygon points="${f(centre - 0.45 * D)},${f(haut)} ${f(centre + 0.45 * D)},${f(haut)} ${f(centre)},${f(hauteur)}" fill="${COULEURS.chocolat}"/>`;
  const boule = (cx, cy) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${COULEURS.framboise}" stroke="${liseré}" stroke-width="${trait}"/>`;
  let boules = '';
  if (nb === 1) boules = boule(centre, yBas);
  else boules = boule(D / 2, yBas) + boule(1.3 * D, yBas);
  if (nb === 3) boules += boule(centre, D / 2);
  const aria = label ? ` role="img" aria-label="${DISTINCTIONS[nb].label}"` : ' aria-hidden="true"';
  return `<svg class="cornet" width="${f(largeur)}" height="${f(hauteur)}" viewBox="0 0 ${f(largeur)} ${f(hauteur)}"${aria}>${cone}${boules}</svg>`;
}

function f(x) {
  return Math.round(x * 100) / 100;
}

export function distinctionCourte(n, fond = 'blanc') {
  return `<span class="distinction-courte">${cornet(n, 14, fond, { label: false })}<span>${DISTINCTIONS[n]?.label ?? ''}</span></span>`;
}

export function points(note) {
  const n = Math.max(0, Math.min(5, Number(note) || 0));
  let html = '';
  for (let i = 1; i <= 5; i += 1) html += `<span class="point${i <= n ? ' plein' : ''}"></span>`;
  return `<span class="points" role="img" aria-label="${n} sur 5">${html}</span>`;
}

export const ICONES = {
  recherche: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  accueil: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z"/></svg>',
  carte: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  autour: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  coeur: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  retour: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
};
