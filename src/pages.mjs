// Modèles de pages. Les liens internes s'écrivent depuis la racine ("/fr/…") ;
// le générateur les rend relatifs pour l'aperçu.
import {
  esc, cornet, distinctionCourte, points, paragraphes, enLigne, dateFr, itineraire, codePays,
  DISTINCTIONS, CRITERES, OPTIONS, ICONES, sansAccents,
} from './lib.mjs';

// ---------- Grammaire des noms de lieux ----------

const MASCULINS = new Set(['japon', 'portugal', 'bresil', 'canada', 'mexique', 'maroc', 'perou', 'chili', 'danemark', 'luxembourg', 'royaume-uni', 'liban', 'vietnam', 'cambodge', 'senegal', 'nepal', 'pakistan', 'venezuela', 'kenya', 'qatar']);
const PLURIELS = new Set(['etats-unis', 'pays-bas', 'emirats arabes unis', 'philippines', 'maldives', 'seychelles']);
const SANS_ARTICLE = new Set(['singapour', 'monaco', 'malte', 'israel', 'cuba', 'chypre', 'maurice', 'madagascar', 'hong kong', 'taiwan', 'bahrein']);
const cle = (p) => sansAccents(p).toLowerCase();
const voyelle = (p) => /^[aeiouyh]/i.test(sansAccents(p));

export function dePays(p) {
  const k = cle(p);
  if (PLURIELS.has(k)) return `des ${p}`;
  if (MASCULINS.has(k)) return voyelle(p) ? `de l'${p}` : `du ${p}`;
  if (SANS_ARTICLE.has(k)) return voyelle(p) ? `d'${p}` : `de ${p}`;
  return voyelle(p) ? `d'${p}` : `de ${p}`;
}

export function enPays(p) {
  const k = cle(p);
  if (PLURIELS.has(k)) return `aux ${p}`;
  if (MASCULINS.has(k)) return voyelle(p) ? `en ${p}` : `au ${p}`;
  if (SANS_ARTICLE.has(k)) return `à ${p}`;
  return `en ${p}`;
}

export const deVille = (v) => (voyelle(v) ? `d'${v}` : `de ${v}`);

const pluriel = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`;

// ---------- Gabarit commun ----------

const NAV = [
  { cle: 'accueil', label: 'Accueil', href: '/fr/', icone: ICONES.accueil },
  { cle: 'carte', label: 'Carte', href: '/fr/carte/', icone: ICONES.carte },
  { cle: 'autour', label: 'Autour de moi', href: '/fr/autour-de-moi/', icone: ICONES.autour },
  { cle: 'liste', label: 'Ma liste', href: '/fr/ma-liste/', icone: ICONES.coeur },
];

function logo() {
  return `<a class="logo" href="/fr/" aria-label="Cornet de route, accueil">${cornet(3, 11, 'creme', { label: false })}<span>Cornet de route</span></a>`;
}

export function layout(site, page) {
  const { config } = site;
  const titre = page.titre ? `${page.titre} | ${config.nom}` : `${config.nom} : ${config.surtitre.toLowerCase()}`;
  const canonique = config.url + page.chemin;
  const image = config.url + (page.image || '/icons/og.png');
  const jsonld = (page.jsonld || []).map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`).join('\n');
  const umami = config.umami?.script && config.umami?.siteId && site.mode === 'production'
    ? `<script defer src="${esc(config.umami.script)}" data-website-id="${esc(config.umami.siteId)}"></script>` : '';
  const enTete = page.enTeteFiche
    ? `<header class="entete entete-fiche">
  <a class="icone-bouton" href="${page.enTeteFiche.retour}" aria-label="Retour à ${esc(page.enTeteFiche.retourLabel)}">${ICONES.retour}</a>
  <a class="logo logo-centre" href="/fr/">Cornet de route</a>
  <nav class="nav-haut" aria-label="Navigation principale">
    <a href="/fr/destinations/">Destinations</a>
    ${NAV.slice(1).map((n) => `<a href="${n.href}">${n.label}</a>`).join('')}
  </nav>
  <button type="button" class="icone-bouton coeur" data-glacier="${esc(page.enTeteFiche.slug)}" data-nom="${esc(page.enTeteFiche.nom)}" aria-pressed="false" aria-label="Ajouter à ma liste">${ICONES.coeur}</button>
</header>`
    : `<header class="entete">
  ${logo()}
  <nav class="nav-haut" aria-label="Navigation principale">
    <a href="/fr/destinations/"${page.actif === 'destinations' ? ' aria-current="page"' : ''}>Destinations</a>
    ${NAV.slice(1).map((n) => `<a href="${n.href}"${page.actif === n.cle ? ' aria-current="page"' : ''}>${n.label}</a>`).join('')}
  </nav>
  <a class="icone-bouton" href="/fr/recherche/" aria-label="Rechercher">${ICONES.recherche}</a>
</header>`;

  return `<!DOCTYPE html>
<html lang="fr" data-root="/" data-mode="${site.mode}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(page.description)}">
${page.noindex || site.mode !== 'production' ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(canonique)}">`}
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${esc(config.nom)}">
<meta property="og:title" content="${esc(page.titre || config.nom)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${esc(canonique)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:locale" content="fr_FR">
<meta name="theme-color" content="#A3D5C5">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600&family=Bodoni+Moda:ital,opsz,wght@0,6..96,600;1,6..96,400&display=swap">
<link rel="stylesheet" href="/assets/site.css?v=${site.version}">
${jsonld}
${umami}
</head>
<body class="${page.classe || ''}">
<a class="evitement" href="#contenu">Aller au contenu</a>
${enTete}
<main id="contenu">
${page.contenu}
</main>
<footer class="pied">
  <div class="pied-in">
    ${logo()}
    <p class="pied-promesse">${esc(config.promesse)}</p>
    <nav aria-label="Liens du site">
      <a href="/fr/methode/">La méthode</a>
      <a href="/fr/destinations/">Destinations</a>
      <a href="/fr/recherche/">Rechercher</a>
      <a href="${esc(config.instagram)}" rel="noopener">Instagram</a>
      <a href="/fr/mentions-legales/">Mentions légales et confidentialité</a>
    </nav>
    <button type="button" class="bouton contour installer" hidden>Installer l'application</button>
    <p class="pied-note">© ${new Date().getFullYear()} ${esc(config.nom)}</p>
  </div>
</footer>
<nav class="nav-bas" aria-label="Navigation principale">
${NAV.map((n) => `  <a href="${n.href}"${page.actif === n.cle ? ' aria-current="page"' : ''}>${n.icone}<span>${n.label}</span></a>`).join('\n')}
</nav>
${(page.scripts || []).includes('carte') ? `<script>window.CARTE=${JSON.stringify({ tuiles: config.carte.tuiles, attribution: config.carte.attribution }).replace(/</g, '\\u003c')}</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js" defer></script>` : ''}
<script src="/assets/site.js?v=${site.version}" defer></script>
</body>
</html>
`;
}

// ---------- Composants ----------

function photo(g, classe, fond = 'vert') {
  if (g.photo) {
    return `<img class="${classe}" src="${esc(g.photo)}" alt="Une glace de ${esc(g.nom)} tenue à bout de bras devant la boutique" loading="lazy" decoding="async">`;
  }
  return `<div class="${classe} photo-vide" aria-hidden="true">${cornet(g.distinction, classe.includes('grande') ? 40 : 22, fond, { label: false })}</div>`;
}

export function carteListe(g, { avecVille = false } = {}) {
  const lieu = avecVille ? `${esc(g.ville)}, ${esc(g.pays)}` : esc(g.quartiers.join(' · ') || g.ville);
  return `<article class="carte-glacier" ${attributsFiltre(g)}>
  <a href="${g.url}" class="carte-lien">
    ${photo(g, 'vignette')}
    <div class="carte-texte">
      ${distinctionCourte(g.distinction)}
      <h3>${esc(g.nom)}</h3>
      <p class="petit doux">${lieu} · <span class="prix">${esc(g.prix)}</span></p>
      <p class="petit">À ne pas manquer : <em class="parfum">${esc(g.parfum)}</em></p>
    </div>
  </a>
  <button type="button" class="coeur mini" data-glacier="${esc(g.slug)}" data-nom="${esc(g.nom)}" aria-pressed="false" aria-label="Ajouter ${esc(g.nom)} à ma liste">${ICONES.coeur}</button>
</article>`;
}

function carteVitrine(g) {
  return `<a class="carte-vitrine" href="${g.url}">
  ${photo(g, 'photo-vitrine')}
  <div class="carte-texte">
    ${distinctionCourte(g.distinction)}
    <h3>${esc(g.nom)}</h3>
    <p class="petit doux">${esc(g.ville)}, ${esc(g.pays)} · <span class="prix">${esc(g.prix)}</span></p>
  </div>
</a>`;
}

function attributsFiltre(g) {
  const opts = OPTIONS.filter((o) => g.options[o.cle]).map((o) => o.cle).join(' ');
  return `data-d="${g.distinction}" data-prix="${esc(g.prix)}" data-options="${opts}"`;
}

function filtres(id) {
  const puce = (groupe, valeur, label) => `<button type="button" class="puce" data-groupe="${groupe}" data-valeur="${esc(valeur)}" aria-pressed="false">${label}</button>`;
  return `<div class="filtres" data-filtres="${id}" role="group" aria-label="Filtrer les glaciers">
  ${puce('d', '3', 'Trois boules')}${puce('d', '2', 'Deux boules')}${puce('d', '1', 'Une boule')}
  ${puce('prix', '€', '€')}${puce('prix', '€€', '€€')}${puce('prix', '€€€', '€€€')}
  ${OPTIONS.map((o) => puce('options', o.cle, o.label)).join('')}
  <button type="button" class="puce effacer" data-effacer hidden>Tout afficher</button>
</div>
<p class="petit doux filtres-vide" data-vide="${id}" hidden>Aucun glacier ne correspond à ces filtres.</p>`;
}

function pointsCarte(glaciers) {
  return glaciers.flatMap((g) => g.adresses.filter((a) => Number.isFinite(a.lat) && Number.isFinite(a.lng)).map((a) => ({
    lat: a.lat, lng: a.lng, nom: g.nom, lieu: a.nom || '', ville: g.ville, d: g.distinction, url: g.url, p: g.paysSlug, v: g.villeSlug,
  })));
}

function miniCarte(glaciers, lien, legende) {
  return `<div class="carte-mini" data-carte="mini" data-points="${esc(JSON.stringify(pointsCarte(glaciers)))}">
  <div class="carte-fond" aria-hidden="true"></div>
  ${legende ? `<span class="pastille">${legende}</span>` : ''}
  <a class="pastille pastille-lien" href="${lien}">Voir sur la carte</a>
</div>`;
}

function fil(liens) {
  return `<nav class="fil" aria-label="Fil d'Ariane">${liens.map((l, i) => (l.href && i < liens.length - 1 ? `<a href="${l.href}">${esc(l.label)}</a>` : `<span>${esc(l.label)}</span>`)).join(' <span aria-hidden="true">›</span> ')}</nav>`;
}

function filJsonld(site, liens) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: liens.map((l, i) => ({ '@type': 'ListItem', position: i + 1, name: l.label, item: site.config.url + l.href })),
  };
}

function rechercheForm(id, valeur = '') {
  return `<form class="recherche" action="/fr/recherche/" method="get" role="search" data-recherche>
  <label for="${id}">Où partez-vous ?</label>
  <div class="champ">${ICONES.recherche}<input id="${id}" name="q" type="search" value="${esc(valeur)}" placeholder="Rome, Lisbonne, Tokyo…" autocomplete="off" enterkeyhint="search"></div>
  <div class="suggestions" role="listbox" hidden></div>
</form>`;
}

// ---------- Accueil ----------

export function accueil(site) {
  const { glaciers, pays } = site;
  const troisBoules = glaciers.filter((g) => g.distinction === 3);
  const recents = [...glaciers].sort((a, b) => String(b.date_publication).localeCompare(String(a.date_publication))).slice(0, 5);
  const destinations = pays.map((p) => `<a class="puce caramel" href="${p.url}">${esc(p.nom)}</a>`).join('');
  const contenu = `
<section class="hero bande-vert">
  <div class="hero-in">
    <span class="hero-cornet">${cornet(3, 26, 'vert', { label: false })}</span>
    <p class="surtitre">${esc(site.config.surtitre)}</p>
    <h1 class="titre-xl">${esc(site.config.promesse)}</h1>
    <p class="chapo">Les glaces d'exception du monde entier, goûtées et distinguées par un seul dégustateur, avec le même barème partout.</p>
    ${rechercheForm('destination')}
    <a class="bouton plein" href="/fr/autour-de-moi/#maintenant">${ICONES.autour}Autour de moi</a>
  </div>
</section>
${troisBoules.length ? `
<section class="section">
  <div class="section-tete"><h2>Trois boules</h2><a href="/fr/recherche/#trois-boules">Tout voir</a></div>
  <p class="doux">Des glaces d'exception, chacune une raison de partir.</p>
  <div class="defile">${troisBoules.slice(0, 8).map(carteVitrine).join('')}</div>
</section>` : ''}
<section class="section">
  <div class="section-tete"><h2>Explorer la carte</h2></div>
  ${miniCarte(glaciers, '/fr/carte/', `${pluriel(glaciers.length, 'glacier', 'glaciers')} · ${pluriel(pays.length, 'pays', 'pays')}`)}
  <a class="bouton contour" href="/fr/carte/">${ICONES.carte}Ouvrir la carte</a>
</section>
<section class="section">
  <div class="section-tete"><h2>Dernières découvertes</h2></div>
  <ul class="lignes">${recents.map((g) => `<li><a class="ligne" href="${g.url}">${photo(g, 'vignette-petite')}<span class="ligne-texte">${distinctionCourte(g.distinction, 'creme')}<span class="ligne-nom">${esc(g.nom)}</span><span class="petit doux">${esc(g.ville)}, ${esc(g.pays)} · ajouté le ${dateFr(g.date_publication)}</span></span></a></li>`).join('')}</ul>
</section>
<section class="section">
  <div class="section-tete"><h2>Destinations</h2><a href="/fr/destinations/">Toutes</a></div>
  <div class="puces">${destinations}</div>
</section>
<section class="section">
  <div class="encart-chocolat">
    <p class="accent">« Le même barème, de Rome à Tokyo. »</p>
    <p>Chaque glace est goûtée, notée sur quatre critères et photographiée de la même façon. Seules les adresses distinguées sont publiées.</p>
    <a href="/fr/methode/">Découvrir la méthode</a>
  </div>
</section>`;
  return layout(site, {
    chemin: '/fr/',
    actif: 'accueil',
    description: "Cornet de route, le guide des glaciers d'exception du monde entier : un seul dégustateur, le même barème partout, seules les adresses distinguées sont publiées.",
    contenu,
    scripts: ['carte'],
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'WebSite', name: site.config.nom, url: `${site.config.url}/fr/`, inLanguage: 'fr',
      potentialAction: { '@type': 'SearchAction', target: `${site.config.url}/fr/recherche/?q={q}`, 'query-input': 'required name=q' },
    }],
  });
}

// ---------- Fiche glacier ----------

export function fiche(site, g) {
  const autres = site.glaciers.filter((x) => x.slug !== g.slug && x.pays === g.pays)
    .sort((a, b) => (a.ville === g.ville ? -1 : 0) - (b.ville === g.ville ? -1 : 0) || b.distinction - a.distinction)
    .slice(0, 3);
  const villeLien = g.villeUrl || `${g.paysUrl}#${g.villeSlug}`;
  const liens = [
    { label: 'Destinations', href: '/fr/destinations/' },
    { label: g.pays, href: g.paysUrl },
    { label: g.ville, href: villeLien },
    { label: g.nom, href: g.url },
  ];
  const tags = OPTIONS.filter((o) => g.options[o.cle]).map((o) => `<span class="etiquette">${o.label}</span>`).join('');
  const plusieurs = g.adresses.length > 1;
  const adresses = g.adresses.map((a) => `<li class="adresse">
      <div>${plusieurs && a.nom ? `<strong>${esc(a.nom)}</strong><br>` : ''}${esc(a.adresse)}</div>
      <a class="lien-fort" href="${itineraire(`${g.nom}, ${a.adresse}`)}" rel="noopener" data-y-aller="${esc(g.slug)}">Y aller</a>
    </li>`).join('');
  const liensExt = [
    g.liens.site && `<a href="${esc(g.liens.site)}" rel="noopener">Site web</a>`,
    g.liens.instagram && `<a href="${esc(g.liens.instagram)}" rel="noopener">Instagram</a>`,
    g.liens.google_maps && `<a href="${esc(g.liens.google_maps)}" rel="noopener">Google Maps</a>`,
  ].filter(Boolean).join('');
  const premiere = g.adresses[0];
  const contenu = `
<article class="fiche">
  ${g.photo ? `<div class="fiche-photo"><img src="${esc(g.photo)}" alt="Une glace de ${esc(g.nom)} tenue à bout de bras devant la boutique" width="1080" height="1350" fetchpriority="high"></div>` : ''}
  <header class="fiche-tete bande-vert">
    <div class="etroit">
      ${fil(liens.slice(1, 3))}
      <h1>${esc(g.nom)}</h1>
      <p class="fiche-lieu">${esc(g.quartiers.length ? g.quartiers.join(' · ') : g.ville)}${g.quartiers.some((q) => q.includes(g.ville)) ? '' : `, ${esc(g.ville)}`} · <span class="prix">${esc(g.prix)}</span></p>
      <div class="fiche-distinction">
        ${cornet(g.distinction, 30, 'vert')}
        <div><p class="titre-2">${DISTINCTIONS[g.distinction].label}</p><p class="petit">${DISTINCTIONS[g.distinction].sens}</p></div>
      </div>
    </div>
  </header>
  <div class="etroit fiche-corps">
    <div class="recit">${paragraphes(g.recit)}</div>
    <div class="encart parfum-phare">
      <p class="surtitre framboise">Le parfum à ne pas manquer</p>
      <p class="accent grand">${esc(g.parfum)}</p>
    </div>
    <section aria-labelledby="analyse">
      <h2 id="analyse">L'analyse</h2>
      <dl class="criteres">
        ${CRITERES.map((c) => `<div class="critere"><dt><span>${c.label}</span>${points(g.notes[c.cle])}</dt><dd>${enLigne(g.analyse[c.cle] || '')}</dd></div>`).join('')}
      </dl>
    </section>
    ${g.bemol ? `<div class="bemol"><p class="surtitre">Le bémol</p><p>${enLigne(g.bemol)}</p></div>` : ''}
    <section class="verdict" aria-labelledby="verdict">
      <h2 id="verdict">Le verdict</h2>
      ${paragraphes(g.verdict)}
    </section>
    ${tags ? `<div class="etiquettes">${tags}</div>` : ''}
    <section class="encart infos" id="adresses" aria-labelledby="infos">
      <h2 id="infos" class="surtitre">${plusieurs ? `Infos pratiques · ${g.adresses.length} adresses` : 'Infos pratiques'}</h2>
      <ul class="adresses">${adresses}</ul>
      ${g.date_visite ? `<p class="petit doux">Visité le ${dateFr(g.date_visite)}</p>` : ''}
      ${liensExt ? `<p class="liens-ext">${liensExt}</p>` : ''}
    </section>
    <div class="actions">
      ${premiere ? `<a class="bouton plein" href="${plusieurs ? '#adresses' : itineraire(`${g.nom}, ${premiere.adresse}`)}"${plusieurs ? '' : ` rel="noopener" data-y-aller="${esc(g.slug)}"`}>${ICONES.carte}${plusieurs ? 'Choisir une adresse' : 'Y aller'}</a>` : ''}
      <button type="button" class="bouton contour coeur avec-texte" data-glacier="${esc(g.slug)}" data-nom="${esc(g.nom)}" aria-pressed="false">${ICONES.coeur}<span>Ajouter à ma liste</span></button>
    </div>
    <p class="petit doux publie">Fiche publiée le ${dateFr(g.date_publication)}.</p>
  </div>
  ${autres.length ? `<section class="section etroit-section"><div class="section-tete"><h2>Ailleurs ${enPays(g.pays)}</h2></div><div class="liste">${autres.map((x) => carteListe(x, { avecVille: x.ville !== g.ville })).join('')}</div></section>` : ''}
</article>`;

  const descr = `${g.nom} (${g.ville}) : ${DISTINCTIONS[g.distinction].label.toLowerCase()} au guide Cornet de route. Le parfum à ne pas manquer : ${g.parfum.toLowerCase()}. ${g.recit}`.slice(0, 158).replace(/\s\S*$/, '…');
  return layout(site, {
    titre: `${g.nom}, ${g.ville} : glacier ${DISTINCTIONS[g.distinction].label.toLowerCase()}`,
    chemin: g.url,
    description: descr,
    ogType: 'article',
    image: g.photo || undefined,
    contenu,
    classe: 'page-fiche',
    enTeteFiche: { retour: villeLien, retourLabel: g.ville, slug: g.slug, nom: g.nom },
    jsonld: [ficheJsonld(site, g), filJsonld(site, liens)],
  });
}

function ficheJsonld(site, g) {
  const adresse = (a) => ({ '@type': 'PostalAddress', streetAddress: a.adresse.split(',')[0], addressLocality: g.ville, addressCountry: codePays(g.pays) });
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: `${g.nom} : ${DISTINCTIONS[g.distinction].label.toLowerCase()}`,
    url: site.config.url + g.url,
    inLanguage: 'fr',
    datePublished: g.date_publication || undefined,
    author: { '@type': 'Organization', name: site.config.nom, url: site.config.url },
    publisher: { '@type': 'Organization', name: site.config.nom, url: site.config.url },
    reviewRating: { '@type': 'Rating', ratingValue: g.distinction, bestRating: 3, worstRating: 1 },
    reviewBody: [g.recit, g.bemol, g.verdict].filter(Boolean).join(' '),
    itemReviewed: {
      '@type': 'IceCreamShop',
      name: g.nom,
      url: g.liens.site || undefined,
      image: g.photo ? site.config.url + g.photo : undefined,
      priceRange: g.prix,
      address: g.adresses.length === 1 ? adresse(g.adresses[0]) : g.adresses.map(adresse),
    },
  };
}

// ---------- Pays et ville ----------

export function pagePays(site, p) {
  const liens = [{ label: 'Destinations', href: '/fr/destinations/' }, { label: p.nom, href: p.url }];
  const autresPays = site.pays.filter((x) => x.slug !== p.slug);
  const blocs = p.villes.map((v) => `<section class="bloc-ville" id="${v.slug}" aria-labelledby="t-${v.slug}">
    <div class="section-tete"><h2 id="t-${v.slug}">${esc(v.nom)}</h2>${v.url ? `<a href="${v.url}">La page ${esc(deVille(v.nom))}</a>` : `<span class="petit doux">${pluriel(v.glaciers.length, 'adresse', 'adresses')}</span>`}</div>
    <div class="liste" data-liste="pays">${v.glaciers.map((g) => carteListe(g)).join('')}</div>
  </section>`).join('');
  const contenu = `
<section class="tete-page bande-vert"><div class="etroit">
  ${fil(liens)}
  <h1>Les meilleurs glaciers ${esc(dePays(p.nom))}</h1>
  <p class="tete-compte">${pluriel(p.glaciers.length, 'adresse distinguée', 'adresses distinguées')} · ${pluriel(p.villes.length, 'ville', 'villes')}</p>
</div></section>
<div class="etroit">
  ${p.intro ? `<div class="intro">${paragraphes(p.intro)}</div>` : ''}
  ${filtres('pays')}
  ${miniCarte(p.glaciers, `/fr/carte/#${p.slug}`)}
  ${blocs}
  ${autresPays.length ? `<section class="section-simple"><h2>Ailleurs dans le monde</h2><div class="puces">${autresPays.map((x) => `<a class="puce caramel" href="${x.url}">${esc(x.nom)}</a>`).join('')}</div></section>` : ''}
</div>`;
  return layout(site, {
    titre: `Les meilleurs glaciers ${dePays(p.nom)}`,
    chemin: p.url,
    description: `Les glaciers d'exception ${enPays(p.nom)}, sélectionnés et notés par Cornet de route : ${p.villes.map((v) => v.nom).join(', ')}.`.slice(0, 158),
    contenu,
    scripts: ['carte'],
    jsonld: [filJsonld(site, liens), listeJsonld(site, p.glaciers)],
  });
}

export function pageVille(site, v) {
  const p = v.pays;
  const liens = [{ label: 'Destinations', href: '/fr/destinations/' }, { label: p.nom, href: p.url }, { label: v.nom, href: v.url }];
  const autres = p.villes.filter((x) => x.slug !== v.slug);
  const contenu = `
<section class="tete-page bande-vert"><div class="etroit">
  ${fil(liens.slice(1))}
  <h1>Les meilleurs glaciers ${esc(deVille(v.nom))}</h1>
  <p class="tete-compte">${pluriel(v.glaciers.length, 'adresse distinguée', 'adresses distinguées')}</p>
</div></section>
<div class="etroit">
  ${v.intro ? `<div class="intro">${paragraphes(v.intro)}</div>` : ''}
  ${filtres('ville')}
  ${miniCarte(v.glaciers, `/fr/carte/#${p.slug}-${v.slug}`)}
  <div class="liste" data-liste="ville">${v.glaciers.map((g) => carteListe(g)).join('')}</div>
  ${autres.length ? `<section class="section-simple"><h2>Ailleurs ${esc(enPays(p.nom))}</h2><div class="puces">${autres.map((x) => `<a class="puce caramel" href="${x.url || `${p.url}#${x.slug}`}">${esc(x.nom)}</a>`).join('')}</div></section>` : ''}
</div>`;
  return layout(site, {
    titre: `Les meilleurs glaciers ${deVille(v.nom)}`,
    chemin: v.url,
    description: `${pluriel(v.glaciers.length, 'glacier distingué', 'glaciers distingués')} à ${v.nom} par Cornet de route, avec le parfum à ne pas manquer de chacun.`,
    contenu,
    scripts: ['carte'],
    jsonld: [filJsonld(site, liens), listeJsonld(site, v.glaciers)],
  });
}

function listeJsonld(site, glaciers) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: glaciers.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: site.config.url + g.url, name: g.nom })),
  };
}

export function destinations(site) {
  const contenu = `
<section class="tete-page bande-vert"><div class="etroit">
  <h1>Destinations</h1>
  <p class="tete-compte">${pluriel(site.glaciers.length, 'glacier distingué', 'glaciers distingués')} dans ${pluriel(site.pays.length, 'pays', 'pays')}</p>
</div></section>
<div class="etroit">
  ${site.pays.map((p) => `<section class="bloc-pays">
    <div class="section-tete"><h2><a href="${p.url}">${esc(p.nom)}</a></h2><span class="petit doux">${pluriel(p.glaciers.length, 'glacier', 'glaciers')}</span></div>
    <ul class="villes">${p.villes.map((v) => `<li><a href="${v.url || `${p.url}#${v.slug}`}">${esc(v.nom)}</a> <span class="petit doux">${v.glaciers.length}</span></li>`).join('')}</ul>
  </section>`).join('')}
</div>`;
  return layout(site, {
    titre: 'Destinations',
    chemin: '/fr/destinations/',
    actif: 'destinations',
    description: "Tous les pays et toutes les villes du guide Cornet de route, avec leurs glaciers d'exception.",
    contenu,
  });
}

// ---------- Pages de service ----------

export function recherche(site) {
  const contenu = `
<section class="tete-page bande-vert"><div class="etroit">
  <h1>Rechercher</h1>
  ${rechercheForm('q')}
</div></section>
<div class="etroit">
  ${filtres('recherche')}
  <p class="petit doux" data-compte aria-live="polite"></p>
  <div class="liste" data-resultats></div>
  <noscript><p>La recherche a besoin de JavaScript. Toutes les adresses sont aussi sur la page <a href="/fr/destinations/">Destinations</a>.</p></noscript>
</div>`;
  return layout(site, {
    titre: 'Rechercher un glacier',
    chemin: '/fr/recherche/',
    description: 'Cherchez un glacier distingué par ville, pays, nom ou parfum, et filtrez par distinction, prix et options.',
    contenu,
    classe: 'page-recherche',
    noindex: true,
  });
}

export function carte(site) {
  const contenu = `
<h1 class="visuellement-cache">Carte des glaciers</h1>
<div class="carte-pleine" data-carte="pleine" data-points="${esc(JSON.stringify(pointsCarte(site.glaciers)))}">
  <div class="carte-fond" aria-hidden="true"></div>
  <span class="pastille">${pluriel(site.glaciers.length, 'glacier', 'glaciers')} · ${pluriel(site.pays.length, 'pays', 'pays')}</span>
</div>
<p class="etroit petit doux note-carte">${esc(site.config.carte.attribution)}. Touchez un point pour ouvrir la fiche.</p>`;
  return layout(site, {
    titre: 'La carte des glaciers',
    chemin: '/fr/carte/',
    actif: 'carte',
    description: 'Tous les glaciers distingués par Cornet de route sur une carte du monde.',
    contenu,
    classe: 'page-carte',
    scripts: ['carte'],
  });
}

export function autourDeMoi(site) {
  const contenu = `
<section class="tete-page bande-vert"><div class="etroit">
  <h1>Autour de moi</h1>
  <p>Les glaciers distingués les plus proches de vous, du plus près au plus loin.</p>
  <button type="button" class="bouton plein" data-localiser>${ICONES.autour}Me localiser</button>
  <p class="petit">Votre position reste dans votre téléphone : elle n'est ni envoyée ni enregistrée.</p>
</div></section>
<div class="etroit">
  <p class="statut" data-statut aria-live="polite"></p>
  <div class="carte-mini" data-carte="autour" data-points="[]" hidden><div class="carte-fond" aria-hidden="true"></div></div>
  <div class="liste" data-proches></div>
</div>`;
  return layout(site, {
    titre: 'Les glaciers autour de moi',
    chemin: '/fr/autour-de-moi/',
    actif: 'autour',
    description: 'Trouvez les glaciers distingués par Cornet de route les plus proches de vous.',
    contenu,
    scripts: ['carte'],
    noindex: true,
  });
}

export function maListe(site) {
  const contenu = `
<section class="tete-page bande-vert"><div class="etroit">
  <h1>Ma liste</h1>
  <p>Les glaciers que vous gardez pour vos prochains voyages.</p>
</div></section>
<div class="etroit">
  <div class="liste" data-ma-liste></div>
  <div class="vide" data-liste-vide hidden>
    ${cornet(1, 30, 'creme', { label: false })}
    <p><strong>Votre liste est vide.</strong></p>
    <p class="doux">Touchez le cœur d'une fiche pour la garder ici.</p>
    <a class="bouton contour" href="/fr/destinations/">Parcourir les destinations</a>
  </div>
  <p class="petit doux">Votre liste est enregistrée dans ce navigateur, sur cet appareil.</p>
</div>`;
  return layout(site, {
    titre: 'Ma liste',
    chemin: '/fr/ma-liste/',
    actif: 'liste',
    description: 'Les glaciers que vous avez gardés.',
    contenu,
    noindex: true,
  });
}

export function methode(site) {
  const contenu = `
<section class="tete-page bande-vert"><div class="etroit">
  <p class="surtitre">La méthode</p>
  <h1>Le même barème, de Rome à Tokyo</h1>
  <p class="chapo">Un seul dégustateur goûte chaque glace, la note sur quatre critères et la photographie de la même façon. Seules les adresses distinguées sont publiées.</p>
</div></section>
<div class="etroit">
  <section class="section-simple">
    <h2>La distinction</h2>
    <p>Un seul cornet, garni d'une, deux ou trois boules. Le nombre de boules traduit un jugement global : ce n'est pas la moyenne des critères.</p>
    <ul class="niveaux">${[3, 2, 1].map((n) => `<li>${cornet(n, 24, 'blanc')}<div><p class="titre-2">${DISTINCTIONS[n].label}</p><p>${DISTINCTIONS[n].sens}</p></div></li>`).join('')}</ul>
    <p class="doux">Un glacier testé mais non distingué n'est pas publié. Il reste dans la base privée et pourra entrer au guide s'il progresse.</p>
  </section>
  <section class="section-simple">
    <h2>Quatre critères notés sur 5</h2>
    <dl class="criteres">${CRITERES.map((c) => `<div class="critere"><dt><span>${c.label}</span></dt><dd>${c.sens}</dd></div>`).join('')}</dl>
  </section>
  <section class="section-simple">
    <h2>Le prix</h2>
    <p>Il s'affiche de € à €€€, par rapport aux prix de la ville : € est moins cher que la moyenne locale, €€ dans la moyenne, €€€ au-dessus.</p>
  </section>
  <section class="section-simple">
    <h2>La fiche</h2>
    <p>Chaque fiche suit le même ordre : le récit, le parfum à ne pas manquer, l'analyse des quatre critères, le bémol, puis le verdict. Le bémol est toujours là, factuel et constructif.</p>
  </section>
  <section class="section-simple">
    <h2>Le cornet tendu</h2>
    <p>Chaque glace est photographiée de la même façon : format vertical, cornet centré, bras tendu à hauteur des yeux, toujours la même main, rien d'autre dans le cadre.</p>
  </section>
  <section class="section-simple">
    <h2>Une ville, une page</h2>
    <p>Une ville a sa propre page à partir de trois glaciers distingués. Les autres adresses restent sur la carte et sur la page de leur pays.</p>
  </section>
</div>`;
  return layout(site, {
    titre: 'La méthode : un seul palais, le même barème',
    chemin: '/fr/methode/',
    description: "Comment Cornet de route goûte, note et distingue les glaciers : quatre critères, une à trois boules, le même barème partout dans le monde.",
    contenu,
  });
}

export function mentions(site) {
  const contenu = `
<section class="tete-page bande-vert"><div class="etroit">
  <h1>Mentions légales et confidentialité</h1>
</div></section>
<div class="etroit texte-long">
  <p class="encart brouillon">Brouillon à compléter avant l'ouverture du site : les passages entre crochets restent à remplir.</p>
  <h2>Éditeur</h2>
  <p>Cornet de route est édité par [nom de l'éditeur], [adresse ou mention de l'hébergeur pour un éditeur non professionnel]. Contact : [adresse e-mail dédiée].</p>
  <h2>Hébergement</h2>
  <p>Le site est hébergé par Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis.</p>
  <h2>Indépendance</h2>
  <p>[À confirmer : qui paie les glaces goûtées, et l'engagement qu'aucun glacier ne paie pour figurer au guide.]</p>
  <h2>Vos données</h2>
  <ul>
    <li><strong>Mesure d'audience.</strong> Le site compte ses visites avec un outil qui ne dépose pas de cookie et ne permet pas de vous identifier. [Nom de l'outil et lieu d'hébergement à préciser à son installation.]</li>
    <li><strong>Autour de moi.</strong> Votre position n'est demandée que si vous touchez le bouton. Elle sert au calcul des distances dans votre téléphone et n'est ni envoyée ni enregistrée.</li>
    <li><strong>Ma liste.</strong> Elle est enregistrée dans votre navigateur, sur votre appareil. Nous n'y avons pas accès.</li>
    <li><strong>Carte et polices.</strong> La carte et les polices de caractères sont chargées depuis des services tiers, qui reçoivent votre adresse IP. [Fournisseur de la carte à préciser.]</li>
  </ul>
</div>`;
  return layout(site, {
    titre: 'Mentions légales et confidentialité',
    chemin: '/fr/mentions-legales/',
    description: 'Mentions légales et politique de confidentialité de Cornet de route.',
    contenu,
    noindex: true,
  });
}

export function page404(site) {
  const contenu = `
<section class="tete-page bande-vert"><div class="etroit">
  ${cornet(1, 30, 'vert', { label: false })}
  <h1>Cette page a fondu.</h1>
  <p>L'adresse n'existe pas, ou plus. Cherchez une destination :</p>
  ${rechercheForm('q404')}
</div></section>
<div class="etroit section-simple"><a class="bouton contour" href="/fr/">Revenir à l'accueil</a></div>`;
  return layout(site, { titre: 'Page introuvable', chemin: '/404.html', description: 'Page introuvable.', contenu, noindex: true });
}
