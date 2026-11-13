const V = "lab-v2";
const S = self.registration.scope;   // funciona na raiz ou em /nome-do-repositorio/
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(V).then((c) => c.addAll([S, S + "login/", S + "icon-192.png"])).catch(() => {})); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;   // nunca intercepta o Supabase
  if (r.mode === "navigate") { e.respondWith(fetch(r).catch(() => caches.match(r).then((m) => m || caches.match(S)))); return; }
  if (u.pathname.includes("/_next/static") || /\.(png|ico|svg|webmanifest|woff2?)$/.test(u.pathname))
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { const c = res.clone(); caches.open(V).then((x) => x.put(r, c)); return res; })));
});
