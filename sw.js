// Simple offline cache: app shell + most-recently-fetched API responses.
// Bump VERSION on every release, in lockstep with APP_VERSION in app.js.
const VERSION = "2026.07.20-1";
const CACHE = "flyfish-" + VERSION;
const SHELL = ["./", "./index.html", "./app.js", "./manifest.json", "./icon.svg"];

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
  // Never cache Supabase (auth + sync API) — always go to network so data stays live.
  if (url.hostname.endsWith("supabase.co") || url.hostname.endsWith("supabase.in")) {
    return; // let the browser handle it normally
  }
  // Stale-while-revalidate for shell + tiles + APIs
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request);
    const fetched = fetch(e.request).then((resp) => {
      if (resp.ok && (e.request.method === "GET")) cache.put(e.request, resp.clone());
      return resp;
    }).catch(() => cached);
    return cached || fetched;
  })());
});
