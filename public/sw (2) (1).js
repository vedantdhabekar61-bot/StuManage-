// StuManage PWA Service Worker
// Strategy:
//   - Static assets (fonts, icons, manifest) → Cache First
//   - Supabase API & Razorpay → Network Only (always fresh)
//   - Next.js page navigations → Network First with offline fallback
//   - Everything else → Network First

const CACHE_NAME = 'stumanage-v1';

const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.svg',
];

// Never cache these — always hit the network
const NETWORK_ONLY_PATTERNS = [
  /supabase\.co/,
  /razorpay\.com/,
  /api\.razorpay\.com/,
  /checkout\.razorpay\.com/,
  /\/api\//,          // your own Next.js API routes
];

// ─── Install ───────────────────────────────────────────────────────────────
// Pre-cache static assets so icons & manifest are available offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache what we can; don't block install if an asset is missing
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  // Activate immediately without waiting for old SW to die
  self.skipWaiting();
});

// ─── Activate ──────────────────────────────────────────────────────────────
// Delete old caches from previous SW versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open pages immediately
  self.clients.claim();
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST to Supabase, Razorpay payments, etc.)
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // ── Network Only: Supabase, Razorpay, Next.js API routes ──────────────
  const isNetworkOnly = NETWORK_ONLY_PATTERNS.some((pattern) =>
    pattern.test(url.href)
  );
  if (isNetworkOnly) {
    event.respondWith(fetch(request));
    return;
  }

  // ── Cache First: Static assets (icons, manifest, fonts) ───────────────
  const isStatic =
    url.pathname.match(/\.(png|svg|ico|webp|woff2?|ttf|otf)$/) ||
    url.pathname === '/manifest.json';

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Only cache valid responses
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Network First: HTML navigations (with offline fallback) ────────────
  // This covers all your Next.js pages: /, /students, /add, /seats, etc.
  const isNavigation =
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html');

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a fresh copy of the page shell for offline use
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Offline: serve cached version of this page if we have it,
          // otherwise serve the root (the app will handle auth/routing)
          caches.match(request).then(
            (cached) => cached || caches.match('/')
          )
        )
    );
    return;
  }

  // ── Network First: Everything else (Next.js JS chunks, CSS) ───────────
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
