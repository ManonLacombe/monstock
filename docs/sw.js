/* Service worker — MonStock
 *
 * Stratégie :
 *  - navigation (le HTML) : réseau d'abord, cache en secours → l'application
 *    se met à jour dès qu'il y a du réseau, et reste utilisable hors ligne ;
 *  - ressources statiques : « stale-while-revalidate » → réponse immédiate
 *    depuis le cache, rafraîchissement en arrière-plan.
 *
 * Un cache « cache-first » sur tout empêcherait l'application de se mettre
 * à jour une fois installée : à ne pas faire.
 */
var VERSION = 'monstock-v1';
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
      // active immédiatement : pas d'attente de fermeture de toutes les onglets
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

function depuisCache(demande) {
  return caches.match(demande).then(function (r) {
    var copie = r && r.clone();
    var rafraichir = fetch(demande).then(function (reponse) {
      if (reponse && reponse.status === 200 && reponse.type === 'basic') {
        caches.open(CACHE).then(function (c) { c.put(demande, reponse.clone()); });
      }
      return reponse;
    }).catch(function () { return copie; });
    return copie || rafraichir;
  });
}

function reseauDAbord(demande) {
  return fetch(demande).then(function (reponse) {
    if (reponse && reponse.status === 200 && reponse.type === 'basic') {
      var copie = reponse.clone();
      caches.open(CACHE).then(function (c) { c.put(demande, copie); });
    }
    return reponse;
  }).catch(function () {
    return caches.match(demande).then(function (r) {
      return r || caches.match('./index.html');
    });
  });
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;

  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(reseauDAbord(e.request));
  } else {
    e.respondWith(depuisCache(e.request));
  }
});