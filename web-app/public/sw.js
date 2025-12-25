// Service Worker for Claexa AI PWA
const CACHE_VERSION = "claexa-v2";
const CACHE_NAME = `${CACHE_VERSION}::static`;
const RUNTIME_CACHE = `${CACHE_VERSION}::runtime`;

// Assets to precache during install
const PRECACHE_URLS = [
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/offline.html",
];

// Install event - precache assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Precaching static assets...");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log("Precaching complete");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Precaching failed:", error);
      })
  );
});

// Activate event - take control and clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches that don't match current version
              return !cacheName.startsWith(CACHE_VERSION);
            })
            .map((cacheName) => {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - Network first, fallback to cache, then offline page
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed - try cache first
          return caches.match(event.request).then((cachedResponse) => {
            // If page is cached, return it
            if (cachedResponse) {
              return cachedResponse;
            }
            // Otherwise show offline page
            return caches.match("/offline.html");
          });
        })
    );
    return;
  }

  // For all other requests (images, scripts, styles, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If found in cache, return immediately
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (
            response &&
            response.status === 200 &&
            response.type !== "opaque"
          ) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed and not in cache - return empty response
          return new Response("", {
            status: 408,
            statusText: "Request Timeout",
          });
        });
    })
  );
});

// Handle messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
