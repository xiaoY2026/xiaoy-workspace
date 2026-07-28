const CACHE = 'xiaoy-v7';
const ASSETS = ['./', './index.html', './app.js', './manifest.json', './bg.jpg', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './news.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 网络优先：每次都先尝试拉取最新文件，失败再回退缓存。
// 这样以后更新 index.html/app.js 时，手机端的 PWA 能自动拿到新版本，不会被旧缓存卡住。
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
