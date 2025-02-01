const cacheName = 'pwaname'; // PWA id here
const appFiles = [
  'index.html',
  'app.js',
  'favicon.png',
  'manifest.json',
  'pwaicon.png',
  'style.css',
  'sw.js',
  './resources/icons/inform.svg',
  './resources/icons/error.svg'
  // add all PWA files here (except pwaversion.txt)
];

const dontCache = [
  'pwaversion.txt',
  '/isLogged',
  '/getNoteById',
  '/getTheme',
  '/getName',
  '/getCustomTheme',
  '/logout',
  '/login',
  '/register',
  '/deleteNote',
  '/addNote',
  '/updatePassword',
  '/updateTheme',
  '/updateName',
  '/updateCustomTheme',
  '/getDayNotes',
  '/updateNote',
  'pocketserver'
  // add all files that should not be cached here
]
// Caches all the PWA shell files (appFiles array) when the app is launched
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      try {
        await cache.addAll(appFiles);
      } catch (error) {
        console.error('Failed to cache app files:', error);
      }
    })()
  );
});

// Called when the app fetches a resource like an image, caches it automatically except for pwaversion.txt, which is always fetched
self.addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      if (dontCache.some((url) => e.request.url.includes(url))) {
        return fetch(e.request);
      } else {
        const cachedResponse = await caches.match(e.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const response = await fetch(e.request);
          const cache = await caches.open(cacheName);
          cache.put(e.request, response.clone());
          return response;
        } catch (error) {
          console.error('Fetch failed:', error);
          throw error;
        }
      }
    })()
  );
});

// Called when the service worker is activated
self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== cacheName) {
            return caches.delete(name);
          }
        })
      );
    })()
  );
});
