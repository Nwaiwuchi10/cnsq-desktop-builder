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
  event.notification.close(); // close on click
  let url = event.notification.data?.url || "/";
  // // let url = "/notifications"; // default fallback

  // if (event.notification.data?.type === "chat") {
  //   url = event.notification.data.url; // open specific chat conversation
  // } else if (event.notification.data?.type === "announcement") {
  //   url = "/notifications"; // open announcements page
  // }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window with the same URL
        for (const client of clientList) {
          if (client.url.endsWith(url) && "focus" in client) {
            return client.focus();
          }
        }

        // If not open, open a new window
        if (client.openWindow) return clients.openWindow(url);
        // return clients.openWindow(url);
      })
  );
});

// // sw.js

// // Handle push notifications
// self.addEventListener("push", (event) => {
//   const data = event.data?.json() || {};

//   const title = data.title || "Announcement";
//   const body = data.description || "";
//   const icon = "/CNSQ.png";
//   const badge = "/CNSQ.png";

//   // Store any URL or ID in data for later
//   const notificationData = {
//     url: "/notifications", // frontend fallback
//     id: null,
//     type: data.type || null,
//   };

//   event.waitUntil(
//     self.registration.showNotification(title, {
//       body,
//       icon,
//       badge,
//       data: notificationData,
//     })
//   );
// });

// // Handle notification click
// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();

//   // Use the URL from notification data
//   const url = "/notifications";

//   event.waitUntil(
//     clients
//       .matchAll({ type: "window", includeUncontrolled: true })
//       .then((clientList) => {
//         // Check if a window with the URL is already open
//         for (const client of clientList) {
//           if (client.url.endsWith(url) && "focus" in client) {
//             return client.focus();
//           }
//         }
//         // If not, open a new window with the frontend URL
//         return clients.openWindow(url);
//       })
//   );
// });
