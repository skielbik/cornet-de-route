// Générateur du site Cornet de route, sans aucune dépendance.
//   node src/build.mjs              → dist/    (site de production)
//   node src/build.mjs --apercu     → apercu/  (liens relatifs, ouvrable sans serveur)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync, cpSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify, OPTIONS } from './lib.mjs';
import * as P from './pages.mjs';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const apercu = args.includes('--apercu');
const dossierContenu = args.includes('--contenu') ? args[args.indexOf('--contenu') + 1] : join(RACINE, 'content');
const SORTIE = join(RACINE, apercu ? 'apercu' : 'dist');
const config = JSON.parse(readFileSync(join(RACINE, 'site.config.json'), 'utf8'));
const triFr = new Intl.Collator('fr', { sensitivity: 'base' }).compare;
const alertes = [];

// ---------- Lecture du contenu ----------

function lireJson(fichier) {
  try {
    return JSON.parse(readFileSync(fichier, 'utf8'));
  } catch (e) {
    throw new Error(`Fichier illisible : ${fichier} (${e.message})`);
  }
}

function lireOptionnel(fichier) {
  return existsSync(fichier) ? lireJson(fichier) : {};
}

const dossierGlaciers = join(dossierContenu, 'glaciers');
const glaciers = readdirSync(dossierGlaciers)
  .filter((f) => f.endsWith('.json'))
  .map((f) => normaliser(lireJson(join(dossierGlaciers, f)), f.replace(/\.json$/, '')))
  .filter((g) => {
    if (!g.publie) return false;
    if (![1, 2, 3].includes(g.distinction)) {
      alertes.push(`${g.slug} : distinction manquante, fiche non publiée.`);
      return false;
    }
    return true;
  })
  .sort((a, b) => b.distinction - a.distinction || triFr(a.nom, b.nom));

function normaliser(brut, slugFichier) {
  const slug = slugify(brut.slug || slugFichier);
  const oui = (v) => v === true || String(v).toLowerCase() === 'oui';
  const g = {
    slug,
    nom: String(brut.nom || slug).trim(),
    pays: String(brut.pays || '').trim(),
    ville: String(brut.ville || '').trim(),
    distinction: Number(brut.distinction),
    prix: String(brut.prix || '').trim(),
    parfum: String(brut.parfum || '').trim(),
    notes: brut.notes || {},
    recit: brut.recit || '',
    analyse: brut.analyse || {},
    bemol: brut.bemol || '',
    verdict: brut.verdict || '',
    adresses: (brut.adresses || []).map((a) => ({
      nom: String(a.nom || '').trim(),
      adresse: String(a.adresse || '').trim(),
      quartier: String(a.quartier || '').trim(),
      lat: a.lat === '' || a.lat == null ? NaN : Number(a.lat),
      lng: a.lng === '' || a.lng == null ? NaN : Number(a.lng),
    })),
    options: Object.fromEntries(OPTIONS.map((o) => [o.cle, oui(brut.options?.[o.cle])])),
    liens: { site: '', instagram: '', google_maps: '', ...(brut.liens || {}) },
    date_visite: brut.date_visite ? String(brut.date_visite).slice(0, 10) : '',
    date_publication: brut.date_publication ? String(brut.date_publication).slice(0, 10) : '',
    photo: brut.photo || '',
    publie: brut.publie !== false,
  };
  for (const champ of ['pays', 'ville', 'parfum', 'recit', 'verdict']) {
    if (!g[champ]) alertes.push(`${slug} : champ « ${champ} » vide.`);
  }
  if (!g.adresses.length) alertes.push(`${slug} : aucune adresse.`);
  g.adresses.forEach((a, i) => {
    if (!Number.isFinite(a.lat) || !Number.isFinite(a.lng)) alertes.push(`${slug} : coordonnées manquantes pour l'adresse ${i + 1}.`);
  });
  g.paysSlug = slugify(g.pays);
  g.villeSlug = slugify(g.ville);
  g.quartiers = [...new Set(g.adresses.map((a) => a.quartier).filter(Boolean))];
  g.url = `/fr/${g.paysSlug}/${g.villeSlug}/${g.slug}/`;
  g.paysUrl = `/fr/${g.paysSlug}/`;
  return g;
}

// ---------- Pays et villes ----------

const pays = [];
for (const g of glaciers) {
  let p = pays.find((x) => x.slug === g.paysSlug);
  if (!p) {
    p = { slug: g.paysSlug, nom: g.pays, url: g.paysUrl, glaciers: [], villes: [], ...lireOptionnel(join(dossierContenu, 'pays', `${g.paysSlug}.json`)) };
    pays.push(p);
  }
  p.glaciers.push(g);
  let v = p.villes.find((x) => x.slug === g.villeSlug);
  if (!v) {
    v = { slug: g.villeSlug, nom: g.ville, pays: p, glaciers: [], ...lireOptionnel(join(dossierContenu, 'villes', `${p.slug}-${g.villeSlug}.json`)) };
    p.villes.push(v);
  }
  v.glaciers.push(g);
}
pays.sort((a, b) => triFr(a.nom, b.nom));
for (const p of pays) {
  p.villes.sort((a, b) => b.glaciers.length - a.glaciers.length || triFr(a.nom, b.nom));
  for (const v of p.villes) {
    v.url = v.glaciers.length >= config.seuilPageVille ? `/fr/${p.slug}/${v.slug}/` : null;
    for (const g of v.glaciers) g.villeUrl = v.url;
  }
}

// ---------- Écriture ----------

// Textes de l'accueil, modifiables depuis l'administration (content/accueil.json).
const accueilDefaut = JSON.parse(readFileSync(join(RACINE, 'content', 'accueil.json'), 'utf8'));
const accueilLu = lireOptionnel(join(dossierContenu, 'accueil.json'));
const accueil = Object.fromEntries(Object.entries(accueilDefaut).map(([cle, val]) => [cle, String(accueilLu[cle] ?? '').trim() || val]));

const site = { config, accueil, glaciers, pays, mode: apercu ? 'apercu' : 'production', version: Date.now().toString(36) };
rmSync(SORTIE, { recursive: true, force: true });
mkdirSync(SORTIE, { recursive: true });
cpSync(join(RACINE, 'public'), SORTIE, { recursive: true });
if (apercu) {
  rmSync(join(SORTIE, 'admin'), { recursive: true, force: true });
  rmSync(join(SORTIE, '_redirects'), { force: true });
  rmSync(join(SORTIE, '_headers'), { force: true });
}
const pagesEcrites = [];

const page404 = (c) => c === '/404.html';
const pagesPrivees = ['/fr/recherche/', '/fr/autour-de-moi/', '/fr/ma-liste/', '/fr/mentions-legales/'];

// Typographie française : espace insécable avant : ; ! ? » et après «, hors scripts et balises.
function typographie(html) {
  return html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/).map((bloc, i) => (i % 2 ? bloc : bloc.replace(/>([^<]+)</g, (_, t) => `>${t
    .replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»')
    .replace(/ ([:;!?])(?=\s|$|<)/g, '\u00a0$1')}<`))).join('');
}

function ecrire(chemin, html0, { sitemap = true } = {}) {
  const html = typographie(html0);
  const fichier = chemin.endsWith('/') ? `${chemin}index.html` : chemin;
  const cible = join(SORTIE, fichier);
  mkdirSync(dirname(cible), { recursive: true });
  writeFileSync(cible, apercu ? relativiser(html, fichier) : html);
  if (sitemap && !page404(chemin) && !pagesPrivees.includes(chemin)) pagesEcrites.push(chemin);
}

// Aperçu : chaque lien "/x/" devient relatif et pointe vers "x/index.html".
function relativiser(html, fichier) {
  const profondeur = fichier.replace(/^\//, '').split('/').length - 1;
  const prefixe = profondeur ? '../'.repeat(profondeur) : './';
  return html
    .replace(/(\s(?:href|src|action)=")\/(?!\/)([^"]*)"/g, (_, debut, reste) => {
      const [chemin, ancre] = reste.split('#');
      const cheminFinal = chemin === '' || chemin.endsWith('/') ? `${chemin}index.html` : chemin;
      return `${debut}${prefixe}${cheminFinal}${ancre !== undefined ? `#${ancre}` : ''}"`;
    })
    .replace('data-root="/"', `data-root="${prefixe}"`);
}

ecrire('/fr/', P.accueil(site));
for (const g of glaciers) ecrire(g.url, P.fiche(site, g));
for (const p of pays) {
  ecrire(p.url, P.pagePays(site, p));
  for (const v of p.villes) if (v.url) ecrire(v.url, P.pageVille(site, v));
}
ecrire('/fr/destinations/', P.destinations(site));
ecrire('/fr/methode/', P.methode(site));
ecrire('/fr/recherche/', P.recherche(site));
ecrire('/fr/carte/', P.carte(site));
ecrire('/fr/autour-de-moi/', P.autourDeMoi(site));
ecrire('/fr/ma-liste/', P.maListe(site));
ecrire('/fr/mentions-legales/', P.mentions(site));
ecrire('/404.html', P.page404(site), { sitemap: false });
if (!apercu) ecrire('/admin/tableau-de-bord/', P.tableauDeBord(site), { sitemap: false });

// Données lues par la recherche, Autour de moi, Ma liste et la carte.
const donnees = {
  glaciers: glaciers.map((g) => ({
    slug: g.slug, nom: g.nom, url: g.url, pays: g.pays, paysUrl: g.paysUrl, ville: g.ville,
    villeUrl: g.villeUrl, quartiers: g.quartiers, d: g.distinction, prix: g.prix, parfum: g.parfum,
    options: OPTIONS.filter((o) => g.options[o.cle]).map((o) => o.cle), photo: g.photo,
    adresses: g.adresses.filter((a) => Number.isFinite(a.lat)).map((a) => ({ nom: a.nom, lat: a.lat, lng: a.lng })),
    publie: g.date_publication,
  })),
  lieux: pays.flatMap((p) => [
    { type: 'pays', nom: p.nom, url: p.url, n: p.glaciers.length },
    ...p.villes.map((v) => ({ type: 'ville', nom: v.nom, pays: p.nom, url: v.url || `${p.url}#${v.slug}`, n: v.glaciers.length })),
  ]),
};
writeFileSync(join(SORTIE, 'fr', 'donnees.json'), JSON.stringify(donnees));

// Racine : renvoie vers /fr/ (doublé d'une redirection côté hébergeur en production).
if (apercu) writeFileSync(join(SORTIE, 'index.html'), relativiser(P.accueil(site), 'index.html'));
else writeFileSync(join(SORTIE, 'index.html'), `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${config.nom}</title><meta http-equiv="refresh" content="0; url=${apercu ? './fr/index.html' : '/fr/'}"><link rel="canonical" href="${config.url}/fr/"></head><body><a href="${apercu ? './fr/index.html' : '/fr/'}">${config.nom}</a></body></html>`);

writeFileSync(join(SORTIE, 'version.txt'), `Cornet de route ${site.version} ${new Date().toISOString()}\n`);

if (!apercu) {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  writeFileSync(join(SORTIE, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pagesEcrites.map((c) => `  <url><loc>${config.url}${c}</loc><lastmod>${aujourdhui}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  // Avant le lancement, tout le site reste hors des moteurs : passer "ouvertAuxMoteurs" à true pour ouvrir.
  writeFileSync(join(SORTIE, 'robots.txt'), config.ouvertAuxMoteurs
    ? `User-agent: *\nDisallow: /admin/\n\nSitemap: ${config.url}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n');
}

console.log(`${glaciers.length} glacier(s), ${pays.length} pays, ${pagesEcrites.length} page(s) indexables → ${relative(RACINE, SORTIE)}/`);
if (alertes.length) console.log(`À vérifier :\n  - ${alertes.join('\n  - ')}`);
