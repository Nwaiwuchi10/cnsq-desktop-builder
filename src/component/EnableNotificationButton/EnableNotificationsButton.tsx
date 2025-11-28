// utils/notifications.ts
export async function enableNotifications(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    alert("Service worker not supported in this browser.");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error("VAPID public key missing");
      return false;
    }

    const applicationServerKey: any = urlBase64ToUint8Array(vapidKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const token = localStorage.getItem("user-token");
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/push-notification/subscribe`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      }
    );

    return true;
  } catch (err) {
    console.error("Failed to enable notifications:", err);
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
