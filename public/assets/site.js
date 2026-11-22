// Cornet de route : fonctions côté visiteur (recherche, filtres, Autour de moi, Ma liste, carte, application).
{
  const doc = document.documentElement;
  const racine = doc.dataset.root || '/';
  const apercu = doc.dataset.mode === 'apercu';

  // ---------- Outils ----------

  const u = (chemin) => {
    if (!chemin || /^https?:/.test(chemin)) return chemin;
    const [c0, ancre] = chemin.split('#');
    let c = c0.replace(/^\//, '');
    if (apercu && (c === '' || c.endsWith('/'))) c += 'index.html';
    return racine + c + (ancre !== undefined ? `#${ancre}` : '');
  };
  const suivre = (nom, data) => {
    try { if (window.umami) window.umami.track(nom, data); } catch (e) { /* mesure indisponible */ }
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  let promesseDonnees;
  const donnees = () => {
    promesseDonnees = promesseDonnees || fetch(u('/fr/donnees.json')).then((r) => r.json());
    return promesseDonnees;
  };

  const LABELS = { 1: 'Une boule', 2: 'Deux boules', 3: 'Trois boules' };
  const COEUR = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';

  // Le cornet qui se remplit (même géométrie que le générateur).
  function cornet(n, D, liseré) {
    const r2 = (x) => Math.round(x * 100) / 100;
    const t = Math.max(1, Math.round(D * 0.7) / 10);
    const r = D / 2 - t / 2;
    const L = n === 1 ? D : 1.8 * D;
    const dec = n === 3 ? 0.65 * D : 0;
    const yb = dec + D / 2;
    const c = L / 2;
    const h0 = dec + 0.75 * D;
    const H = h0 + 1.2 * D;
    const b = (x, y) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="#B8325A" stroke="${liseré}" stroke-width="${t}"/>`;
    let s = `<polygon points="${r2(c - 0.45 * D)},${r2(h0)} ${r2(c + 0.45 * D)},${r2(h0)} ${r2(c)},${r2(H)}" fill="#3B2418"/>`;
    s += n === 1 ? b(c, yb) : b(D / 2, yb) + b(1.3 * D, yb);
    if (n === 3) s += b(c, D / 2);
    return { svg: `<svg class="cornet" width="${r2(L)}" height="${r2(H)}" viewBox="0 0 ${r2(L)} ${r2(H)}" aria-hidden="true">${s}</svg>`, L, H };
  }

  function carteGlacier(g, extra = '') {
    const vignette = g.photo
      ? `<img class="vignette" src="${esc(u(g.photo))}" alt="" loading="lazy">`
      : `<div class="vignette photo-vide" aria-hidden="true">${cornet(g.d, 22, '#A3D5C5').svg}</div>`;
    return `<article class="carte-glacier" data-d="${g.d}" data-prix="${esc(g.prix)}" data-options="${g.options.join(' ')}">
  <a href="${esc(u(g.url))}" class="carte-lien">${vignette}
    <div class="carte-texte">
      <span class="distinction-courte">${cornet(g.d, 14, '#FFFFFF').svg}<span>${LABELS[g.d]}</span></span>
      <h3>${esc(g.nom)}</h3>
      <p class="petit doux">${esc(g.ville)}, ${esc(g.pays)} · <span class="prix">${esc(g.prix)}</span></p>
      <p class="petit">À ne pas manquer : <em class="parfum">${esc(g.parfum)}</em></p>
      ${extra}
    </div>
  </a>
  <button type="button" class="coeur mini" data-glacier="${esc(g.slug)}" data-nom="${esc(g.nom)}" aria-pressed="false" aria-label="Ajouter ${esc(g.nom)} à ma liste">${COEUR}</button>
</article>`;
  }

  // ---------- Ma liste ----------

  const CLE_LISTE = 'cornetderoute.liste';
  const lireListe = () => {
    try {
      const v = JSON.parse(localStorage.getItem(CLE_LISTE));
      return Array.isArray(v && v.items) ? v.items : [];
    } catch (e) { return []; }
  };
  const ecrireListe = (items) => {
    try { localStorage.setItem(CLE_LISTE, JSON.stringify({ v: 1, items })); } catch (e) { /* stockage indisponible */ }
  };
  const dansListe = (slug) => lireListe().some((i) => i.slug === slug);

  function majCoeurs() {
    document.querySelectorAll('.coeur[data-glacier]').forEach((b) => {
      const oui = dansListe(b.dataset.glacier);
      b.setAttribute('aria-pressed', String(oui));
      const texte = b.querySelector('span');
      if (texte) texte.textContent = oui ? 'Dans ma liste' : 'Ajouter à ma liste';
      else b.setAttribute('aria-label', `${oui ? 'Retirer' : 'Ajouter'} ${b.dataset.nom || 'ce glacier'} ${oui ? 'de' : 'à'} ma liste`);
    });
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('.coeur[data-glacier]');
    if (!b) return;
    e.preventDefault();
    const slug = b.dataset.glacier;
    let items = lireListe();
    if (items.some((i) => i.slug === slug)) items = items.filter((i) => i.slug !== slug);
    else {
      items.unshift({ slug, ajouteLe: new Date().toISOString().slice(0, 10) });
      suivre('ajout-liste', { glacier: slug });
    }
    ecrireListe(items);
    majCoeurs();
    if (document.querySelector('[data-ma-liste]')) afficherMaListe();
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-y-aller]');
    if (a) suivre('y-aller', { glacier: a.dataset.yAller });
  });

  async function afficherMaListe() {
    const zone = document.querySelector('[data-ma-liste]');
    const vide = document.querySelector('[data-liste-vide]');
    const { glaciers } = await donnees();
    const parSlug = Object.fromEntries(glaciers.map((g) => [g.slug, g]));
    const items = lireListe().map((i) => parSlug[i.slug]).filter(Boolean);
    zone.innerHTML = items.map((g) => carteGlacier(g)).join('');
    vide.hidden = items.length > 0;
    majCoeurs();
  }

  // ---------- Recherche ----------

  function correspondances(d, q) {
    const nq = norm(q);
    if (!nq) return { lieux: [], glaciers: [] };
    const lieux = d.lieux.filter((l) => norm(l.nom).includes(nq))
      .sort((a, b) => norm(a.nom).indexOf(nq) - norm(b.nom).indexOf(nq) || b.n - a.n);
    const glaciers = d.glaciers.filter((g) => [g.nom, g.ville, g.pays, g.parfum, ...g.quartiers].some((t) => norm(t).includes(nq)));
    return { lieux, glaciers };
  }

  function allerRecherche(q) {
    try { sessionStorage.setItem('cornetderoute.q', q); } catch (e) { /* rien */ }
    location.href = `${u('/fr/recherche/')}?q=${encodeURIComponent(q)}`;
  }

  document.querySelectorAll('[data-recherche]').forEach((form) => {
    const champ = form.querySelector('input');
    const boite = form.querySelector('.suggestions');
    const surPageRecherche = !!document.querySelector('[data-resultats]');
    champ.addEventListener('input', async () => {
      if (surPageRecherche) { rafraichirRecherche(); return; }
      const d = await donnees();
      const { lieux, glaciers } = correspondances(d, champ.value);
      const options = [
        ...lieux.slice(0, 4).map((l) => `<a role="option" href="${esc(u(l.url))}" data-q="${esc(l.nom)}"><strong>${esc(l.nom)}</strong><span>${l.type === 'ville' ? esc(l.pays) : 'Pays'} · ${l.n} glacier${l.n > 1 ? 's' : ''}</span></a>`),
        ...glaciers.slice(0, 4).map((g) => `<a role="option" href="${esc(u(g.url))}" data-q="${esc(g.nom)}"><strong>${esc(g.nom)}</strong><span>${esc(g.ville)} · ${LABELS[g.d]}</span></a>`),
      ];
      boite.innerHTML = options.length ? options.join('') : (champ.value.trim() ? '<p class="petit doux">Pas encore de glacier distingué ici.</p>' : '');
      boite.hidden = !champ.value.trim();
    });
    boite.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-q]');
      if (a) suivre('recherche', { destination: a.dataset.q });
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = champ.value.trim();
      if (!q) return;
      suivre('recherche', { destination: q });
      if (surPageRecherche) { rafraichirRecherche(); champ.blur(); return; }
      const d = await donnees();
      const { lieux } = correspondances(d, q);
      const exact = lieux.find((l) => norm(l.nom) === norm(q));
      if (exact) location.href = u(exact.url);
      else allerRecherche(q);
    });
    document.addEventListener('click', (e) => { if (!form.contains(e.target)) boite.hidden = true; });
  });

  // ---------- Filtres ----------

  const etatsFiltres = new Map();
  function etatFiltres(conteneur) {
    const etat = { d: new Set(), prix: new Set(), options: new Set() };
    conteneur.querySelectorAll('.puce[aria-pressed="true"]').forEach((p) => etat[p.dataset.groupe].add(p.dataset.valeur));
    return etat;
  }
  const passe = (g, f) => (!f.d.size || f.d.has(String(g.d)))
    && (!f.prix.size || f.prix.has(g.prix))
    && [...f.options].every((o) => g.options.includes(o));

  function appliquerFiltresDom(id) {
    const f = etatsFiltres.get(id);
    let visibles = 0;
    document.querySelectorAll(`[data-liste="${id}"] .carte-glacier`).forEach((c) => {
      const ok = passe({ d: c.dataset.d, prix: c.dataset.prix, options: (c.dataset.options || '').split(' ').filter(Boolean) }, f);
      c.hidden = !ok;
      if (ok) visibles += 1;
    });
    document.querySelectorAll('.bloc-ville').forEach((b) => { b.hidden = !b.querySelector('.carte-glacier:not([hidden])'); });
    const vide = document.querySelector(`[data-vide="${id}"]`);
    if (vide) vide.hidden = visibles > 0;
  }

  document.querySelectorAll('[data-filtres]').forEach((conteneur) => {
    const id = conteneur.dataset.filtres;
    const effacer = conteneur.querySelector('[data-effacer]');
    const maj = () => {
      const etat = etatFiltres(conteneur);
      etatsFiltres.set(id, etat);
      effacer.hidden = !(etat.d.size || etat.prix.size || etat.options.size);
      if (id === 'recherche') rafraichirRecherche();
      else appliquerFiltresDom(id);
    };
    conteneur.addEventListener('click', (e) => {
      const p = e.target.closest('.puce');
      if (!p) return;
      if (p.hasAttribute('data-effacer')) conteneur.querySelectorAll('.puce[aria-pressed="true"]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      else p.setAttribute('aria-pressed', String(p.getAttribute('aria-pressed') !== 'true'));
      maj();
    });
    if (id === 'recherche' && location.hash === '#trois-boules') {
      conteneur.querySelector('.puce[data-groupe="d"][data-valeur="3"]').setAttribute('aria-pressed', 'true');
    }
    etatsFiltres.set(id, etatFiltres(conteneur));
    effacer.hidden = !etatsFiltres.get(id).d.size;
  });

  async function rafraichirRecherche() {
    const zone = document.querySelector('[data-resultats]');
    if (!zone) return;
    const champ = document.querySelector('.page-recherche [data-recherche] input');
    const d = await donnees();
    const q = champ.value.trim();
    const f = etatsFiltres.get('recherche') || { d: new Set(), prix: new Set(), options: new Set() };
    const base = q ? correspondances(d, q).glaciers : d.glaciers;
    const res = base.filter((g) => passe(g, f));
    const lieux = q ? correspondances(d, q).lieux.filter((l) => norm(l.nom) === norm(q)) : [];
    const compte = document.querySelector('[data-compte]');
    compte.innerHTML = `${res.length} glacier${res.length > 1 ? 's' : ''}${q ? ` pour « ${esc(q)} »` : ' au guide'}${lieux.map((l) => ` · <a href="${esc(u(l.url))}">La page ${esc(l.nom)}</a>`).join('')}`;
    zone.innerHTML = res.length ? res.map((g) => carteGlacier(g)).join('') : `<div class="vide"><p><strong>Pas encore de glacier distingué${q ? ` pour « ${esc(q)} »` : ''}.</strong></p><p class="doux">Le guide grandit au fil des voyages. Essayez une autre ville, ou <a href="${esc(u('/fr/destinations/'))}">parcourez les destinations</a>.</p></div>`;
    majCoeurs();
  }

  if (document.querySelector('[data-resultats]')) {
    let q = new URLSearchParams(location.search).get('q') || '';
    if (!q) { try { q = sessionStorage.getItem('cornetderoute.q') || ''; } catch (e) { /* rien */ } }
    try { sessionStorage.removeItem('cornetderoute.q'); } catch (e) { /* rien */ }
    const champ = document.querySelector('.page-recherche [data-recherche] input');
    champ.value = q;
    rafraichirRecherche();
  }

  // ---------- Cartes ----------

  const COULEUR_FOND = '#A3D5C5';
  function marqueur(p) {
    const { svg, L, H } = cornet(p.d, 12, '#FFFFFF');
    return window.L.divIcon({ className: 'marqueur', html: svg, iconSize: [L, H], iconAnchor: [L / 2, H], popupAnchor: [0, -H] });
  }

  function creerCarte(el, pts, { interactive, centre } = {}) {
    if (!window.L) { dessinerSansFond(el, pts); return null; }
    const conf = window.CARTE || {};
    const carte = window.L.map(el, {
      zoomControl: interactive, dragging: interactive, scrollWheelZoom: interactive, touchZoom: interactive,
      doubleClickZoom: interactive, boxZoom: interactive, keyboard: interactive, attributionControl: true, zoomSnap: 0.5,
    });
    carte.attributionControl.setPrefix(false);
    if (conf.tuiles) window.L.tileLayer(conf.tuiles, { attribution: conf.attribution, maxZoom: 19, className: 'tuiles' }).addTo(carte);
    const couche = window.L.featureGroup();
    pts.forEach((p) => {
      const m = window.L.marker([p.lat, p.lng], { icon: marqueur(p), title: p.nom, keyboard: interactive });
      if (interactive) m.bindPopup(`<a class="bulle" href="${esc(u(p.url))}"><span class="petit">${LABELS[p.d]}</span><strong>${esc(p.nom)}</strong><span class="petit doux">${esc(p.lieu ? `${p.lieu}, ` : '')}${esc(p.ville)}</span></a>`);
      m.addTo(couche);
    });
    if (centre) window.L.circleMarker(centre, { radius: 8, color: '#FFFFFF', weight: 3, fillColor: '#3B2418', fillOpacity: 1 }).addTo(couche);
    couche.addTo(carte);
    if (pts.length + (centre ? 1 : 0) > 1) carte.fitBounds(couche.getBounds(), { padding: [32, 32], maxZoom: 15 });
    else if (pts.length || centre) carte.setView(centre || [pts[0].lat, pts[0].lng], 14);
    else carte.setView([30, 10], 2);
    return { carte, couche };
  }

  // Si la bibliothèque de carte ne charge pas : les points sur l'aplat vert d'eau.
  function dessinerSansFond(el, pts) {
    if (!pts.length) return;
    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    const [la0, la1, lo0, lo1] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
    const W = el.clientWidth || 340;
    const H = el.clientHeight || 220;
    const kx = Math.cos(((la0 + la1) / 2) * Math.PI / 180);
    const echelle = Math.min((W * 0.6) / Math.max((lo1 - lo0) * kx, 1e-6), (H * 0.5) / Math.max(la1 - la0, 1e-6), 9000 * (W / 340));
    el.innerHTML = pts.map((p) => {
      const x = ((W / 2 + (p.lng - (lo0 + lo1) / 2) * kx * echelle) / W) * 100;
      const y = ((H * 0.45 - (p.lat - (la0 + la1) / 2) * echelle) / H) * 100;
      return `<span class="point-simple" style="left:${x}%;top:${y}%">${cornet(p.d, 12, '#FFFFFF').svg}</span>`;
    }).join('');
  }

  const lirePoints = (el) => { try { return JSON.parse(el.dataset.points || '[]'); } catch (e) { return []; } };

  document.querySelectorAll('[data-carte="mini"]').forEach((el) => creerCarte(el.querySelector('.carte-fond'), lirePoints(el), { interactive: false }));

  const pleine = document.querySelector('[data-carte="pleine"]');
  if (pleine) {
    const pts = lirePoints(pleine);
    const res = creerCarte(pleine.querySelector('.carte-fond'), pts, { interactive: true });
    const viser = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (!res || !h) return;
      const cible = pts.filter((p) => p.p === h || `${p.p}-${p.v}` === h);
      if (cible.length) res.carte.fitBounds(window.L.latLngBounds(cible.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 15 });
    };
    viser();
    window.addEventListener('hashchange', viser);
  }

  // ---------- Autour de moi ----------

  const distance = (a, b) => {
    const R = 6371;
    const rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const enClair = (km) => (km < 1 ? `à ${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`
    : `à ${km < 10 ? km.toFixed(1).replace('.', ',') : Math.round(km).toLocaleString('fr-FR')} km`);

  const boutonLocaliser = document.querySelector('[data-localiser]');
  if (boutonLocaliser) {
    const statut = document.querySelector('[data-statut]');
    const zone = document.querySelector('[data-proches]');
    const zoneCarte = document.querySelector('[data-carte="autour"]');
    let carteAutour = null;
    const localiser = () => {
      if (!('geolocation' in navigator)) { statut.textContent = "Votre navigateur ne permet pas la localisation. Cherchez plutôt une ville."; return; }
      statut.textContent = 'Localisation en cours…';
      navigator.geolocation.getCurrentPosition(async (pos) => {
        suivre('autour-de-moi');
        const ici = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const d = await donnees();
        const proches = d.glaciers.map((g) => {
          const km = Math.min(...g.adresses.map((a) => distance(ici, a)));
          return { g, km };
        }).filter((x) => Number.isFinite(x.km)).sort((a, b) => a.km - b.km).slice(0, 20);
        if (!proches.length) { statut.textContent = "Aucun glacier n'est encore localisé."; return; }
        statut.textContent = proches[0].km > 50
          ? `Pas encore de glacier distingué près de vous. Le plus proche est ${enClair(proches[0].km)}.`
          : `${proches.length} glacier${proches.length > 1 ? 's' : ''}, du plus proche au plus loin.`;
        zone.innerHTML = proches.map(({ g, km }) => carteGlacier(g, `<p class="petit distance">${enClair(km)}</p>`)).join('');
        majCoeurs();
        const proximite = proches.filter((x) => x.km <= 50);
        if (proximite.length) {
          zoneCarte.hidden = false;
          const fond = zoneCarte.querySelector('.carte-fond');
          if (carteAutour) carteAutour.carte.remove();
          carteAutour = null;
          fond.innerHTML = '';
          const pts = proximite.flatMap(({ g }) => g.adresses.map((a) => ({ ...a, nom: g.nom, url: g.url, d: g.d, ville: g.ville, lieu: a.nom })));
          carteAutour = creerCarte(fond, pts, { interactive: true, centre: [ici.lat, ici.lng] });
        }
      }, (err) => {
        statut.textContent = err.code === 1
          ? "La localisation a été refusée. Vous pouvez l'autoriser dans les réglages du navigateur, ou chercher une ville."
          : "Impossible de vous localiser pour l'instant. Réessayez dans un instant.";
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    };
    boutonLocaliser.addEventListener('click', localiser);
    if (location.hash === '#maintenant') localiser();
  }

  // ---------- Application installable ----------

  let invite = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    invite = e;
    document.querySelectorAll('.installer').forEach((b) => { b.hidden = false; });
  });
  document.addEventListener('click', async (e) => {
    if (!e.target.closest('.installer') || !invite) return;
    invite.prompt();
    await invite.userChoice;
    invite = null;
    document.querySelectorAll('.installer').forEach((b) => { b.hidden = true; });
  });
  window.addEventListener('appinstalled', () => suivre('installation-app'));
  if (!apercu && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register(u('/sw.js')).catch(() => {}));
  }

  // ---------- Démarrage ----------

  majCoeurs();
  if (document.querySelector('[data-ma-liste]')) afficherMaListe();
}
