// sw.js — Offline-first cache strategies
var CACHE = 'aha-contactos-v1';
var ASSETS = [
  '/',
  'index.html',
  'manifest.json',
  'core/env.js',
  'core/db.js',
  'core/crypto.js',
  'core/ui.js',
  'core/theme.js',
  'core/network.js',
  'core/app.js',
  'core/search-palette.js',
  'core/file-store.js',
  'core/sync.js',
  'core/license.js',
  'core/seed.js',
  'core/main.js',
  'modules/dashboard/module.html',
  'modules/dashboard/module.js',
  'modules/contactos/module.html',
  'modules/contactos/module.js',
  'modules/historial/module.html',
  'modules/historial/module.js',
  'modules/plantillas/module.html',
  'modules/plantillas/module.js',
  'modules/recordatorios/module.html',
  'modules/recordatorios/module.js',
  'assets/css/tailwind.min.css',
  'assets/css/daisyui.min.css',
  'assets/css/bootstrap-icons.css',
  'assets/css/animate.min.css',
  'assets/js/libs/alpine.js',
  'assets/js/libs/dexie.js',
  'assets/js/libs/crypto-js.js',
  'assets/js/libs/pako.js',
  'assets/js/libs/chart.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () { return caches.match('index.html'); })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function (r) { return r || fetch(req); })
  );
});
