self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("latin-square-v1").then(cache => {
      return cache.addAll([
        "/latin_square/index.html",
        "/latin_square/ui.js",
        "/latin_square/engine.js",
        "/latin_square/style.css",
        "/latin_square/icons/icon-192.png",
        "/latin_square/icons/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
