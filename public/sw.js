self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  return self.clients.claim();
});

// A simple fetch handler making it a valid PWA
self.addEventListener('fetch', (event) => {
  // Let the browser do its default thing
});
