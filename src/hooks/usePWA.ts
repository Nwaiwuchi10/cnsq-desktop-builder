"use client";

/**
 * usePWA — Custom hook for Progressive Web App functionality
 *
 * Responsibilities:
 * 1. Register the service worker (/sw.js) when the app mounts
 * 2. Request push notification permission from the user
 * 3. Subscribe to Web Push using the VAPID public key
 * 4. Send the push subscription object to the backend for storage
 * 5. Listen for push subscription renewal messages from the SW (iOS requirement)
 * 6. Detect iOS devices and surface the "Add to Home Screen" prompt logic
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// -------------------------------------------------------
// Type Definitions
// -------------------------------------------------------
interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// -------------------------------------------------------
// Helper: Convert base64 VAPID public key to Uint8Array
// Required by the Web Push API's pushManager.subscribe()
// -------------------------------------------------------
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// -------------------------------------------------------
// Helper: Send subscription to the backend
// -------------------------------------------------------
async function sendSubscriptionToServer(
  subscription: PushSubscription
): Promise<void> {
  const payload = subscription.toJSON() as unknown as PushSubscriptionPayload;
  const token = typeof window !== "undefined" ? localStorage.getItem("user-token") : null;

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    await fetch("/api/push-notification/subscribe", {
      method: "POST",
      headers,
      body: JSON.stringify({
        endpoint: payload.endpoint,
        keys: payload.keys,
      }),
    });
    console.log("[usePWA] Push subscription registered with server.");
  } catch (error) {
    console.error("[usePWA] Failed to send subscription to server:", error);
  }
}

// -------------------------------------------------------
// Helper: Detect if running on iOS (iPhone / iPad)
// Used to decide whether to show "Add to Home Screen" instructions
// iOS does NOT support the `beforeinstallprompt` event
// -------------------------------------------------------
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

// -------------------------------------------------------
// Helper: Detect if app is running in standalone mode
// (i.e., already installed to home screen)
// -------------------------------------------------------
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

// -------------------------------------------------------
// Main Hook
// -------------------------------------------------------
export function usePWA() {
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [pushPermission, setPushPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // ---- Step 1: Register the Service Worker ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) {
      console.warn("[usePWA] Service workers are not supported in this browser.");
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          // updateViaCache: 'none' ensures the browser always checks for a new sw.js
          updateViaCache: "none",
        });

        console.log("[usePWA] Service worker registered:", registration.scope);
        setSwRegistration(registration);

        // Check for SW updates and notify
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("[usePWA] New service worker available.");
              // Optionally: prompt the user to refresh for the update
            }
          });
        });
      } catch (error) {
        console.error("[usePWA] Service worker registration failed:", error);
      }
    };

    registerSW();

    // Detect if already in standalone mode (installed)
    setIsInstalled(isStandalone());
  }, []);

  // ---- Step 2: Subscribe to Push Notifications ----
  useEffect(() => {
    if (!swRegistration) return;

    const setupPush = async () => {
      // Check current notification permission
      const permission = Notification.permission;
      setPushPermission(permission);

      if (permission === "denied") {
        console.warn("[usePWA] Push notifications are blocked by the user.");
        return;
      }

      // Check if already subscribed
      const existingSubscription =
        await swRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("[usePWA] Already subscribed to push.");
        setIsSubscribed(true);
        return;
      }

      // Request permission (shows browser prompt)
      const newPermission = await Notification.requestPermission();
      setPushPermission(newPermission);

      if (newPermission !== "granted") {
        console.warn("[usePWA] Push notification permission denied.");
        return;
      }

      // Subscribe using VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error(
          "[usePWA] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set in environment variables."
        );
        return;
      }

      try {
        const subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true, // iOS Safari requirement: must be true
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
        });

        console.log("[usePWA] New push subscription created:", subscription);
        setIsSubscribed(true);
        await sendSubscriptionToServer(subscription);
      } catch (error) {
        console.error("[usePWA] Push subscription failed:", error);
      }
    };

    setupPush();
  }, [swRegistration]);

  const router = useRouter();

  // ---- Step 3: Listen for Subscription Renewal and Navigation from SW (iOS requirement) ----
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "PUSH_SUBSCRIPTION_RENEWED") {
        console.log(
          "[usePWA] Push subscription renewed by SW — re-registering with server."
        );

        // Get the fresh subscription from the SW and re-send to server
        const reg = await navigator.serviceWorker.ready;
        const newSubscription = await reg.pushManager.getSubscription();
        if (newSubscription) {
          await sendSubscriptionToServer(newSubscription);
        }
      } else if (event.data?.type === "NAVIGATE_TO") {
        const path = event.data.url;
        console.log("[usePWA] Received navigation command to:", path);
        router.push(path);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [router]);

  return {
    swRegistration,
    pushPermission,
    isSubscribed,
    isInstalled,
  };
}
