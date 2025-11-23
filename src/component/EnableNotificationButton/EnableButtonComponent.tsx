"use client";
import Api from "@/utils/api";
import { useState } from "react";

export default function EnableNotificationsButton() {
  const [enabled, setEnabled] = useState(false);

  async function enableNotifications() {
    if (!("serviceWorker" in navigator)) {
      alert("Service worker not supported in this browser.");
      return;
    }

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

    // If Api is axios-style
    const token = localStorage.getItem("user-token");
    await Api.post("/push-notification/subscribe", subscription, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setEnabled(true);
  }

  return (
    <div>
      <button
        onClick={enableNotifications}
        className="px-4 py-2 bg-lime-500 text-white rounded-lg cursor-pointer"
      >
        {enabled ? "Notifications Enabled" : "Enable Notifications"}
      </button>
    </div>
  );
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
