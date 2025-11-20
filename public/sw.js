// PUSH EVENT
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || "Announcement", {
      body: data.body || "",
      icon: "/CNSQ.png",
      badge: "/CNSQ.png",
      data: {
        // FORCE override any backend URL
        url: "/notifications",
        type: data.type || null,
        id: data.id || null,
      },
    })
  );
});

// NOTIFICATION CLICK
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // FORCE navigation only to /notifications
  const forcedUrl = self.location.origin + "/notifications";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            // Only navigate if already not on /Notification
            if (client.url !== forcedUrl && "navigate" in client) {
              client.navigate(forcedUrl);
            }
            return client.focus();
          }
        }

        // No window open → open a new one
        return clients.openWindow(forcedUrl);
      })
  );
});

// self.addEventListener("push", (event) => {
//   const data = event.data?.json() || {};

//   event.waitUntil(
//     self.registration.showNotification(data.title || "Announcement", {
//       body: data.body || "",
//       icon: "/CNSQ.png",
//       badge: "/CNSQ.png",
//       data: {
//         url: "/Notification", // <<< Force navigation here
//         type: data.type || null,
//         id: data.id || null,
//       },
//     })
//   );
// });

// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();

//   // Force navigation to the Notifications page
//   const url = "/Notification";

//   event.waitUntil(
//     clients
//       .matchAll({ type: "window", includeUncontrolled: true })
//       .then((clientList) => {
//         for (const client of clientList) {
//           if ("focus" in client) {
//             if (client.url !== url && "navigate" in client) {
//               client.navigate(url);
//             }
//             return client.focus();
//           }
//         }
//         return clients.openWindow(url);
//       })
//   );
// });

// // self.addEventListener("push", (event) => {
// //   const data = event.data?.json() || {};

// //   event.waitUntil(
// //     self.registration.showNotification(data.title || "Announcement", {
// //       body: data.body || "",
// //       icon: "/CNSQ.png",
// //       badge: "/CNSQ.png",
// //       data,
// //     })
// //   );
// // });

// // self.addEventListener("notificationclick", (event) => {
// //   event.notification.close();
// //   const url = event.notification.data?.url || "/";

// //   event.waitUntil(
// //     clients
// //       .matchAll({ type: "window", includeUncontrolled: true })
// //       .then((clientList) => {
// //         for (const client of clientList) {
// //           if (client.url === url && "focus" in client) {
// //             return client.focus();
// //           }
// //         }
// //         return clients.openWindow(url);
// //       })
// //   );
// // });
