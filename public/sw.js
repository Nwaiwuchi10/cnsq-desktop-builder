// Handle incoming push events
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  console.log("Push received:", data);

  const title = data.title || "Notification";
  const body = data?.body || "";

  // Store metadata for click handling
  const notificationData = {
    url: data.url,
    // || "/notifications",
    type: data.type || null, // "chat" or "announcement"
    id: data.id || null,
  };

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/CNSQ.png",
      badge: "/CNSQ.png",
      data: notificationData,
      requireInteraction: true, // <-- keeps notification on screen until user interacts
    })
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a window with the target URL is already open, focus it
        for (const client of clientList) {
          if (client.url.endsWith(url) && "focus" in client) {
            return client.focus();
          }
        }

        // Otherwise, open a new window
        return clients.openWindow(url);
      })
  );
});
