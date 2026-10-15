// Service worker — Objets trouvés AABD (GSM femmes de chambre)
// Changer CACHE à chaque publication pour forcer la mise à jour des fichiers.
const PREFIXE = 'aabd-objets-trouves-';
const CACHE = PREFIXE + 'v1.1.0';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    // caches.keys() couvre tout le site : ne supprimer que les anciennes versions de CETTE app
    .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIXE) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return; // les envois vers le relais Apps Script ne passent jamais par le cache
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // relais Google : toujours en direct
  // Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne.
  e.respondWith(fetch(req)
    .then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
    .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
});
