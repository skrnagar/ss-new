/* Minimal service worker — enables PWA install criteria; extend with caches as needed. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Default: network-only. Add workbox/caches later for offline shells.
});
