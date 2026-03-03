self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("latin-square-v1").then(cache => {
      return cache.addAll([
        "/latin-square/index.html",
        "/latin-square/ui.js",
        "/latin-square/engine.js",
        "/latin-square/style.css",
        "/latin-square/icons/icon-192.png",
        "/latin-square/icons/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
