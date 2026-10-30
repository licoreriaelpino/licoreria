// Licorería · service worker v2
// Siempre pide la versión más nueva a internet (los datos viven en Supabase).
// Si internet falla: muestra la última copia guardada o, si no hay, un aviso con botón "Reintentar".
const CACHE = 'licoreria-v2';
const OFFLINE = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Licorería</title><body style="margin:0;background:#0E1210;color:#EDE8DD;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center">
<div style="padding:24px"><div style="font-size:56px">📶</div><h2>Sin conexión a internet</h2>
<p style="color:#8A9388">Revisa el wifi o los datos y vuelve a intentar.</p>
<button onclick="location.reload()" style="background:#E8A33D;color:#1a1408;border:0;border-radius:12px;padding:14px 28px;font-size:16px;font-weight:700">Reintentar</button></div></body></html>`;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;            // datos, íconos, etc.: directo a internet
  e.respondWith((async () => {
    try {
      const r = await fetch(e.request);
      if (r.redirected) return Response.redirect(r.url, 302);   // p. ej. /licoreria → /licoreria/
      if (r.ok) { const c = await caches.open(CACHE); c.put(e.request, r.clone()); }
      return r;
    } catch (err) {
      const guardada = await caches.match(e.request, { ignoreSearch: true }) || await caches.match('./');
      return guardada || new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
  })());
});
