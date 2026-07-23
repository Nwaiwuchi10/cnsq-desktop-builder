// ============================================================
// CN-Squad PWA Service Worker (sw.js)
// Handles: Caching, Offline Support, Push Notifications (iOS + Android)
// ============================================================

const CACHE_NAME = "cnsquad-cache-v2";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/CNSQ.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
];

// -------------------------------------------------------
// INSTALL — Pre-cache the app shell (critical static assets)
// -------------------------------------------------------
self.addEventListener("install", (event) => {
  console.log("[SW] Installing CN-Squad service worker...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Pre-caching app shell assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()), // Activate immediately without waiting
  );
});

// -------------------------------------------------------
// ACTIVATE — Clean up old/stale caches from previous SW versions
// -------------------------------------------------------
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating CN-Squad service worker...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME) // Delete any old cache versions
            .map((name) => {
              console.log("[SW] Deleting stale cache:", name);
              return caches.delete(name);
            }),
        ),
      )
      .then(() => self.clients.claim()), // Take control of all open tabs immediately
  );
});

// -------------------------------------------------------
// FETCH — Intercept network requests and apply caching strategy
//
// Strategy:
//   - API routes (/api/*) → Network-first (fresh data, fallback to cache)
//   - Static assets      → Cache-first (fast load, fallback to network)
//   - Navigation (HTML)  → Network-first with offline fallback
// -------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension/data URLs
  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  // API routes → Network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache a fresh copy
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)), // Return cached version on network failure
    );
    return;
  }

  // Next.js chunks → Network-first strategy (to avoid stale module errors)
  if (url.pathname.includes("/_next/static/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)), // Fallback to cache if offline
    );
    return;
  }

  // Other static assets → Cache-first strategy
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff|woff2|ttf|webp)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      }),
    );
    return;
  }

  // Navigation (HTML pages) → Network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              // Absolute last resort — serve the root page
              caches.match("/"),
          ),
        ),
    );
    return;
  }
});

// -------------------------------------------------------
// PUSH — Handle incoming push notifications
//
// iOS Safari (16.4+) requirements:
//   1. App must be installed to Home Screen
//   2. Notification must call self.registration.showNotification()
//   3. Payload must be valid JSON
//   4. VAPID keys must be set on the server
// -------------------------------------------------------
self.addEventListener("push", (event) => {
  // Safely parse the push payload
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    console.warn("[SW] Push payload was not valid JSON:", err);
    data = {
      title: "CN-Squad",
      body: event.data ? event.data.text() : "You have a new notification",
    };
  }

  console.log("[SW] Push received:", data);

  const title = data.title || "CN-Squad";
  const body = data.body || "You have a new notification";
  const icon = data.icon || "/icons/icon-192x192.png";
  const badge = data.badge || "/icons/icon-32x32.png";

  // Notification click routing data
  const notificationData = {
    url: data.url || "/",
    type: data.type || null, // "chat" | "announcement" | "task" etc.
    id: data.id || null,
  };

  const notificationOptions = {
    body,
    icon,
    badge,
    data: notificationData,
    requireInteraction: true, // Keep notification on screen until user taps
    // iOS Safari supports vibrate in Standalone mode
    vibrate: [200, 100, 200],
    // Actions appear as buttons below the notification (Android/macOS Safari)
    actions: [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions),
  );
});

// -------------------------------------------------------
// NOTIFICATION CLICK — Handle what happens when user taps notification
// -------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  if (action === "dismiss") return; // User dismissed — do nothing

  const rawUrl = event.notification.data?.url || "/";
  const url = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If the app is already open, focus it and navigate
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            // Navigate the existing window to the target URL
            if ("navigate" in client) {
              return client.navigate(url);
            }
            return;
          }
        }
        // App is not open — open a new window/tab
        return clients.openWindow(url);
      }),
  );
});

// -------------------------------------------------------
// PUSH SUBSCRIPTION CHANGE
// iOS Safari requirement: When the push subscription expires or
// rotates, re-subscribe automatically and notify the server.
// Without this handler, iOS may silently stop delivering notifications.
// -------------------------------------------------------
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW] Push subscription changed — re-subscribing...");

  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        // NOTE: applicationServerKey is set from the VAPID public key
        // handled by the client-side usePWA hook on re-subscribe
      })
      .then((newSubscription) => {
        console.log("[SW] Re-subscribed:", newSubscription);
        // Notify the app client so it can send the new subscription to the server
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) =>
            client.postMessage({
              type: "PUSH_SUBSCRIPTION_RENEWED",
              subscription: newSubscription.toJSON(),
            }),
          );
        });
      })
      .catch((err) =>
        console.error("[SW] Failed to re-subscribe to push:", err),
      ),
  );
});

// -------------------------------------------------------
// MESSAGE — Handle messages sent from the app to the SW
// -------------------------------------------------------
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting(); // Force the new SW to activate immediately
  }
});
