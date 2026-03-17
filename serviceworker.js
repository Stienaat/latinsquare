const CACHE_NAME = "latinsquare-v8";

const BASE_PATH = self.location.pathname.replace("serviceworker.js", "");

const FILES_TO_CACHE = [
  "",
  "index.html",
  "ui.js",
  "engine.js",
  "lsquare.css",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "images/NL.png",
  "images/FR.png",
  "images/EN.png",
  "images/DE.png",
  "images/info.png",
  "images/oog.png",
  "images/taal.png",
  "images/new.png",
  "images/logoFS.png",
  "images/joker.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE.map(file => BASE_PATH + file));
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
