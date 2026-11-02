// ============================================================
// CN-Squad PWA Service Worker (sw.js)
// Handles: Caching, Offline Support, Push Notifications (iOS + Android)
// ============================================================

const CACHE_NAME = "cnsquad-cache-v2";
const AUTH_CONFIG_CACHE = "cnsquad-sw-auth-v1";
const AUTH_CONFIG_KEY = "/__sw_auth_config__";

let swAuthConfig = {
  token: null,
  apiBaseUrl: null,
};

async function saveSwAuthConfig(config) {
  swAuthConfig = {
    token: config?.token || swAuthConfig.token || null,
    apiBaseUrl: config?.apiBaseUrl || swAuthConfig.apiBaseUrl || null,
  };
  try {
    const cache = await caches.open(AUTH_CONFIG_CACHE);
    await cache.put(
      AUTH_CONFIG_KEY,
      new Response(JSON.stringify(swAuthConfig), {
        headers: { "Content-Type": "application/json" },
      }),
    );
  } catch (err) {
    console.warn("[SW] Failed to persist auth config in cache:", err);
  }
}

async function loadSwAuthConfig() {
  if (swAuthConfig.token && swAuthConfig.apiBaseUrl) {
    return swAuthConfig;
  }
  try {
    const cache = await caches.open(AUTH_CONFIG_CACHE);
    const cached = await cache.match(AUTH_CONFIG_KEY);
    if (cached) {
      const parsed = await cached.json();
      swAuthConfig = {
        token: parsed?.token || swAuthConfig.token || null,
        apiBaseUrl: parsed?.apiBaseUrl || swAuthConfig.apiBaseUrl || null,
      };
    }
  } catch (err) {
    console.warn("[SW] Failed to load auth config from cache:", err);
  }
  return swAuthConfig;
}
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
            .filter((name) => name !== CACHE_NAME && name !== AUTH_CONFIG_CACHE) // Delete any old cache versions
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

  const isBirthdayNotification =
    data.type === "BIRTHDAY_WISH" || data.data?.type === "BIRTHDAY_WISH";

  // Notification click routing & interactive payload data
  // Note: For birthday notifications, only celebrantUuid is stored (no numeric DB ID exposed)
  const notificationData = isBirthdayNotification
    ? {
        url: data.url || "/chat",
        type: "BIRTHDAY_WISH",
        celebrantUuid: data.data?.celebrantUuid || null,
        celebrantName: data.data?.celebrantName || "Celebrant",
        replyEndpoint: data.data?.replyEndpoint || "/birthday/wish",
        quickWishMessage:
          data.data?.quickWishMessage ||
          "🎉 Happy Birthday! Wishing you a wonderful year ahead filled with joy and success! 🎂🥳",
        emojiSuggestions: data.data?.emojiSuggestions || [
          "🎂",
          "🎉",
          "🥳",
          "🥂",
          "🎈",
          "🎁",
          "❤️",
          "✨",
        ],
      }
    : {
        url: data.url || "/",
        type: data.type || null, // "chat" | "announcement" | "task" etc.
        id: data.id || null,
      };

  const defaultBirthdayActions = [
    {
      action: "REPLY_BIRTHDAY_WISH",
      title: "✍️🎂 Send Birthday Wish",
      type: "text",
      placeholder: "Write a wish with emojis 🎂🎉🥳...",
    },
    {
      action: "QUICK_BIRTHDAY_WISH",
      title: "🎉🎂 Happy Birthday! 🥳",
    },
  ];

  const notificationActions =
    Array.isArray(data.actions) && data.actions.length > 0
      ? data.actions
      : isBirthdayNotification
        ? defaultBirthdayActions
        : [
            { action: "open", title: "Open App" },
            { action: "dismiss", title: "Dismiss" },
          ];

  const notificationOptions = {
    body,
    icon,
    badge,
    data: notificationData,
    tag: isBirthdayNotification
      ? `birthday-${notificationData.celebrantUuid || Date.now()}`
      : undefined,
    renotify: true,
    requireInteraction: true, // Keep notification on screen until user taps
    // iOS Safari supports vibrate in Standalone mode
    vibrate: [200, 100, 200],
    sound: "default",
    // Actions appear as buttons / inline text reply on the notification pop-up
    actions: notificationActions,
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, notificationOptions),
      isBirthdayNotification
        ? self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
              clientList.forEach((client) => {
                client.postMessage({
                  type: "BIRTHDAY_PUSH_RECEIVED",
                  data: notificationData,
                });
              });
            })
        : Promise.resolve(),
    ]),
  );
});

// -------------------------------------------------------
// NOTIFICATION CLICK — Handle what happens when user taps notification
// -------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  if (action === "dismiss") return; // User dismissed — do nothing

  const notificationData = event.notification.data || {};
  const inlineReply =
    typeof event.reply === "string" ? event.reply.trim() : "";

  // 1) If user clicked "Quick Wish" or submitted an inline text reply (Android/iOS/supported OS),
  // send the wish directly in the background WITHOUT opening any window or tab!
  if (
    notificationData.type === "BIRTHDAY_WISH" &&
    (action === "QUICK_BIRTHDAY_WISH" || inlineReply.length > 0)
  ) {
    event.waitUntil(
      (async () => {
        try {
          const config = await loadSwAuthConfig();
          const sub = await self.registration.pushManager.getSubscription();
          const messageToSend =
            inlineReply ||
            notificationData.quickWishMessage ||
            "🎉 Happy Birthday! Wishing you a wonderful year ahead! 🎂🥳";

          const replyEndpoint =
            notificationData.replyEndpoint || "/birthday/wish";
          const fallbackBaseUrl =
            self.location.hostname === "localhost"
              ? "http://localhost:4100"
              : "https://api-cnsquad.c9ja.com";
          const baseUrl = (config.apiBaseUrl || fallbackBaseUrl).replace(
            /\/$/,
            "",
          );
          const targetUrl = `${baseUrl}${replyEndpoint}`;

          const headers = {
            "Content-Type": "application/json",
          };
          if (config.token) {
            headers["Authorization"] = `Bearer ${config.token}`;
          }

          const response = await fetch(targetUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
              celebrantUuid: notificationData.celebrantUuid,
              message: messageToSend,
              subscriptionEndpoint: sub ? sub.endpoint : undefined,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          await self.registration.showNotification(
            "🎂 Birthday wish sent to DM!",
            {
              body: `Your birthday wish was delivered straight to ${notificationData.celebrantName || "the celebrant"}'s DM! 🎉`,
              icon: "/icons/icon-192x192.png",
              badge: "/icons/icon-32x32.png",
              requireInteraction: false,
            },
          );
        } catch (err) {
          console.error("[SW] Failed to send background birthday wish:", err);
          await self.registration.showNotification(
            "⚠️ Could not send birthday wish",
            {
              body: "Tap to open CN-Squad and send your wish in DM.",
              icon: "/icons/icon-192x192.png",
              badge: "/icons/icon-32x32.png",
              data: { url: "/chat" },
            },
          );
        }
      })(),
    );
    return;
  }

  // 2) On Desktop OS (e.g. macOS Chrome) where the OS notification banner does not render
  // an inline <input> inside the OS banner, clicking the notification or "✍️🎂 Send Birthday Wish"
  // opens the floating Birthday Wish Pop-Up input box (with emojis) so the user can type their wish!
  if (notificationData.type === "BIRTHDAY_WISH") {
    const popupParams = new URLSearchParams({
      celebrantUuid: notificationData.celebrantUuid || "",
      celebrantName: notificationData.celebrantName || "Celebrant",
      quickWishMessage: notificationData.quickWishMessage || "",
    });
    const popupUrl = new URL(
      `/birthday-wish-popup?${popupParams.toString()}`,
      self.location.origin,
    ).href;

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if ("focus" in client) {
              client.focus();
              client.postMessage({
                type: "OPEN_BIRTHDAY_WISH_POPUP",
                data: notificationData,
              });
              return;
            }
          }
          return clients.openWindow(popupUrl);
        }),
    );
    return;
  }

  const rawUrl = notificationData?.url || "/";
  const url = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If the app is already open, focus it and navigate
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            // Send message to the client to navigate smoothly via Next.js router
            client.postMessage({
              type: "NAVIGATE_TO",
              url: rawUrl,
            });
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
  } else if (event.data?.type === "SET_AUTH_CONFIG") {
    event.waitUntil(
      saveSwAuthConfig({
        token: event.data.token,
        apiBaseUrl: event.data.apiBaseUrl,
      }),
    );
  }
});
