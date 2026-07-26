// Tappy Friends 서비스워커 - 오프라인에서도 실행되도록 핵심 파일을 캐시합니다.
// 주의: 항상 "네트워크 우선(network-first)"으로 동작합니다.
// 즉, 인터넷이 되면 무조건 최신 파일을 받아오고, 오프라인일 때만 캐시를 사용합니다.
// (예전 버전은 캐시를 먼저 쓰는 방식이라 새로고침할 때마다 최신/이전 버전이
//  번갈아 보이는 버그가 있었습니다.)
const CACHE_NAME = 'tappy-friends-v3'; // 버전 올릴 때 이 이름만 바꾸면 예전 캐시는 자동 정리됩니다.
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
