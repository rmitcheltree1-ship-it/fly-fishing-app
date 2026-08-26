// Offline cache for the versioned app shell. Live conditions stay network-first
// so an old cached response is never presented as a current river reading.
// Bump VERSION on every release, in lockstep with APP_VERSION in app.js.
const VERSION = "2026.08.26-5";
const CACHE = "riffle-" + VERSION;
const SHELL = ["./", "./index.html", "./sync-core.js", "./app.js", "./manifest.json", "./icon.svg", "./icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  const isAppShell = url.origin === self.location.origin &&
    SHELL.some(path => new URL(path, self.location.href).href === url.href);

  // Cache only the local shell. Supabase, live conditions, geocoding, map tiles,
  // and CDN libraries remain network-managed and cannot grow this cache forever.
  if (!isAppShell) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
