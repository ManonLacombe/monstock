/* Service worker — MonStock
 *
 * Stratégie : le réseau d'abord pour tout, le cache uniquement en secours.
 * Le HTML, le CSS et le JavaScript changent à chaque version : les servir
 * depuis le cache donnait l'impression que les correctifs n'arrivaient
 * jamais. Hors ligne, tout reste disponible grâce au cache.
 */

var VERSION = 'monstock-v2';
var CACHE = 'monstock-' + VERSION;
var FICHIERS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './data/foods.js',
  './data/recipes.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(FICHIERS); })
      // active immédiatement : pas d'attente de fermeture de tous les onglets
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (cles) {
      return Promise.all(cles.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/**
 * Réseau d'abord, cache en secours.
 *
 * `cache: 'no-cache'` force la revalidation auprès du serveur : GitHub Pages
 * pose un cache HTTP de dix minutes qui suffisait à masquer un déploiement
 * frais. Une réponse 304 est immédiate, donc cela ne coûte presque rien.
 */
function reseauDAbord(demande) {
  var options = { cache: 'no-cache' };
  return fetch(demande, options).then(function (reponse) {
    if (reponse && reponse.status === 200 && reponse.type === 'basic') {
      var copie = reponse.clone();
      caches.open(CACHE).then(function (c) { c.put(demande, copie); });
    }
    return reponse;
  }).catch(function () {
    return caches.match(demande).then(function (r) {
      if (r) return r;
      if (demande.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    });
  });
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;

  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(reseauDAbord(e.request));
});