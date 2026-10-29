// Licorería · service worker mínimo
// Siempre pide la versión más nueva a internet (los datos viven en Supabase).
// Solo si no hay conexión muestra la última copia guardada de la pantalla.
const CACHE = 'licoreria-v1';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;          // datos y demás: directo a internet
  e.respondWith(
    fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request))
  );
});
