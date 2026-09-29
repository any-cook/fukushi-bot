// エニクックの事について - Service Worker
// 方針：常にネットから最新を取得し、オフライン時だけ保存済みの画面を使う
var CACHE_NAME = 'anycook-bot-2026.09.29';

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  // 自分のサイトのGETだけ扱う（Firebase・Gemini等の通信には触らない）
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req, {cache: 'no-store'}).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, {ignoreSearch: true});
    })
  );
});
