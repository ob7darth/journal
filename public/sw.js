const CACHE_NAME = 'life-journal-v1';
const urlsToCache = [
  '/',
  '/assets/index-4e239e1d.js',
  '/assets/index-3eb96ca8.css',
  '/dove icon.png',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.error('Failed to cache resources:', error);
        // Cache what we can, don't fail completely
        return Promise.all(
          urlsToCache.map(url => 
            cache.add(url).catch(err => console.warn(`Failed to cache ${url}:`, err))
          )
        );
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip caching for Supabase requests
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        // Fetch from network with timeout
        return fetch(event.request).catch(() => {
          // If network fails, return a basic offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          throw new Error('Network request failed and no cache available');
        });
      }
    )
  );
});

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