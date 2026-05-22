const CACHE_NAME = "prompt-gallery-v1";

const STARTER_ASSETS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/images/prompt-cinematic-luxury.webp",
  "/images/prompt-cyberpunk-street.webp",
  "/images/prompt-fashion-realism.webp",
  "/images/prompt-iphone-studio.webp",
  "/images/prompt-anime-rooftop.webp",
  "/images/prompt-food-commercial.webp",
  "/images/prompt-space-corridor.webp",
  "/images/prompt-business-workspace.webp",
  "/images/prompt-marble-architecture.webp",
  "/images/prompt-night-car.webp",
  "/images/prompt-skincare-macro.webp",
  "/images/prompt-travel-drone.webp",
  "/images/prompt-tiktok-studio.webp",
  "/images/prompt-youtube-creator.webp",
  "/images/prompt-anime-character.webp",
  "/images/prompt-luxury-watch.webp",
  "/images/prompt-restaurant-interior.webp",
  "/images/prompt-robot-portrait.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => Promise.all(STARTER_ASSETS.map((asset) => cache.add(asset).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (response.ok && request.url.startsWith(self.location.origin)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }

        return response;
      });
    })
  );
});
