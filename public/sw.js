// Service worker minimal : rend le site installable et garde en secours les pages déjà vues.
// La consultation hors connexion n'est pas un objectif du lancement.
const CACHE = 'cornetderoute-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/fr/', '/fr/donnees.json'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin || req.url.includes('/admin/')) return;
  e.respondWith(
    fetch(req)
      .then((rep) => {
        if (rep.ok) { const copie = rep.clone(); caches.open(CACHE).then((c) => c.put(req, copie)); }
        return rep;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('/fr/')))
  );
});
