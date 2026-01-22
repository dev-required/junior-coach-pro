
const CACHE_NAME = 'coach-pro-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './manifest.json',
  './utils/subLogic.ts',
  './components/Court.tsx',
  './components/PlayerTile.tsx',
  './components/BallTile.tsx',
  './components/SubGenerator.tsx',
  './components/RosterManager.tsx',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/lucide-react@^0.562.0',
  'https://esm.sh/react-dom@^19.2.3/',
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react@^19.2.3/'
];

// Install Event: Pre-cache all essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache-First strategy for extreme offline reliability
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).then((fetchResponse) => {
        // Optional: Dynamically cache new requests
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Fallback if both fail (offline and not in cache)
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
