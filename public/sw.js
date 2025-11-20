// PUSH EVENT
self.addEventListener("push", (event) => {
  let data = event.data?.json() || {};

  // DELETE backend URL fully so Chrome cannot use it
  if (data.url) delete data.url;
  if (data.actions) delete data.actions; // especially this if backend sends actions

  const payload = {
    title: data.title || "Announcement",
    body: data.body || "",
    icon: "/CNSQ.png",
    badge: "/CNSQ.png",
    data: {
      url: "/notifications", // ONLY THIS WILL BE USED
      type: data.type || null,
    },
  };

  // Flush any previous SW cached values
  event.waitUntil(Promise.resolve());

  event.waitUntil(self.registration.showNotification(payload.title, payload));
});

// NOTIFICATION CLICK EVENT
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const forcedUrl = self.location.origin + "/notifications";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            if (client.url !== forcedUrl && "navigate" in client) {
              client.navigate(forcedUrl);
            }
            return client.focus();
          }
        }

        return clients.openWindow(forcedUrl);
      })
  );
});
