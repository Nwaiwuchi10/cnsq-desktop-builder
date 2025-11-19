import Api from "@/utils/api";

export async function RequestNotificationPermission() {
  if (!("serviceWorker" in navigator)) {
    alert("Service worker not supported in this browser.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error("VAPID public key missing");
      return;
    }

    const applicationServerKey: any = urlBase64ToUint8Array(vapidKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // send subscription to backend
    await Api.post("/push-notification/subscribe", subscription);
    console.log("Notifications enabled automatically");
  } catch (err) {
    console.error("Notification permission error:", err);
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
