// Simple service worker to prevent cache errors
const CACHE_NAME = 'hostel-ladger-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Skip chrome-extension and other non-http(s) schemes
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Skip caching for chrome-extension URLs
  if (event.request.url.includes('chrome-extension')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline scenarios
        return new Response('Offline', { status: 503 });
      })
  );
});