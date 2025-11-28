import Api from "@/utils/api";

export async function RequestNotificationPermission() {
  // ❌ Prevent crash: iOS + non-PWA browsers = no push
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isPWA = window.matchMedia("(display-mode: standalone)").matches;

  if (isIOS && !isPWA) {
    console.warn(
      "iOS Safari does not support Web Push unless installed as PWA."
    );
    return;
  }

  // ❌ Prevent crash on unsupported browsers
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications not supported in this browser.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    if (!registration.pushManager) {
      console.warn("Push Manager not available on this device.");
      return;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    const applicationServerKey: any = urlBase64ToUint8Array(vapidKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const token = localStorage.getItem("user-token");

    await Api.post("/push-notification/subscribe", subscription, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Notifications enabled");
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
