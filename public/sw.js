// sw.js

// Handle push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const title = data.title || "Announcement";
  const body = data.description || "";
  const icon = "/CNSQ.png";
  const badge = "/CNSQ.png";

  // Store any URL or ID in data for later
  const notificationData = {
    url: "/notifications", // frontend fallback
    id: null,
    type: data.type || null,
  };

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: notificationData,
    })
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Use the URL from notification data
  const url = "/notifications";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if a window with the URL is already open
        for (const client of clientList) {
          if (client.url.endsWith(url) && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window with the frontend URL
        return clients.openWindow(url);
      })
  );
});
