/**
 * Push Notification Service Utility
 * Handles service worker registration, subscription management, and API communication
 * Production-ready with comprehensive error handling
 */

import Api from "./api";

// Types matching backend DTO
interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface PushSubscriptionPayload {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

interface PushSubscriptionResponse {
  success: boolean;
  data: {
    id: string;
    endpoint: string;
    data: PushSubscriptionKeys;
    userId: number;
    createdAt: string;
    updatedAt: string | null;
  };
  message: string;
}

interface UserSubscriptionsResponse {
  success: boolean;
  data: PushSubscriptionResponse["data"][];
  count: number;
  message?: string;
}

class PushNotificationService {
  private vapidKey: string | null = null;
  private isServiceWorkerSupported: boolean =
    typeof navigator !== "undefined" && "serviceWorker" in navigator;

  constructor() {
    if (typeof window !== "undefined") {
      this.vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
    }
  }

  /**
   * Convert VAPID key from URL-safe Base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    try {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const rawData = atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    } catch (error) {
      throw new Error(
        "Invalid VAPID key format. Failed to convert Base64 to Uint8Array.",
      );
    }
  }

  /**
   * Check if browser supports Service Workers and Push Notifications
   */
  isBrowserSupported(): boolean {
    if (!this.isServiceWorkerSupported) {
      console.warn("Service Worker not supported in this browser");
      return false;
    }

    const hasNotificationAPI = "Notification" in window;
    if (!hasNotificationAPI) {
      console.warn("Notification API not supported in this browser");
      return false;
    }

    return true;
  }

  /**
   * Get user's current notification permission status
   */
  getNotificationPermission(): NotificationPermission {
    if (!this.isBrowserSupported()) {
      return "denied";
    }
    return Notification.permission;
  }

  /**
   * Request notification permission if needed
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.isBrowserSupported()) {
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return "denied";
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isServiceWorkerSupported) {
      throw new Error("Service Workers are not supported in this browser");
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      throw new Error(
        "Failed to register Service Worker. Push notifications may not work.",
      );
    }
  }

  /**
   * Subscribe to push notifications and save subscription to backend
   */
  async subscribe(): Promise<boolean> {
    try {
      // Step 1: Validate environment and browser support
      if (!this.isBrowserSupported()) {
        throw new Error(
          "Your browser does not support push notifications. Please use a modern browser.",
        );
      }

      if (!this.vapidKey) {
        throw new Error("VAPID public key is not configured. Contact support.");
      }

      // Step 2: Validate authentication token
      const token = localStorage.getItem("user-token");
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      // Step 3: Request notification permission
      const permission = await this.requestNotificationPermission();
      if (permission !== "granted") {
        throw new Error(
          "Notification permission denied. Please enable notifications in your browser settings.",
        );
      }

      // Step 4: Register service worker
      const registration = await this.registerServiceWorker();

      // Step 5: Check if already subscribed
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        // Verify with backend if still valid, if so, return true
        try {
          const subs = await this.getUserSubscriptions();
          const isValidSubscription = subs.some(
            (sub) => sub.endpoint === existingSubscription.endpoint,
          );

          if (isValidSubscription) {
            console.log("Device is already subscribed to push notifications");
            return true;
          }
        } catch (error) {
          console.warn("Could not verify existing subscription:", error);
          // Continue with new subscription
        }
      }

      // Step 6: Create push subscription
      const applicationServerKey = this.urlBase64ToUint8Array(
        this.vapidKey,
      ) as BufferSource;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      if (!subscription) {
        throw new Error("Failed to create push subscription");
      }

      // Step 7: Send subscription to backend
      const subscriptionJSON = subscription.toJSON();
      const payload: PushSubscriptionPayload = {
        endpoint: subscriptionJSON.endpoint!,
        keys: {
          p256dh: subscriptionJSON.keys!.p256dh,
          auth: subscriptionJSON.keys!.auth,
        },
      };

      const response = await Api.post<PushSubscriptionResponse>(
        "/push-notification/subscribe",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to save subscription on server",
        );
      }

      console.log("Push notification subscribed successfully", response.data);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Failed to enable push notifications:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all push subscriptions for current user
   */
  async getUserSubscriptions(): Promise<PushSubscriptionResponse["data"][]> {
    try {
      const token = localStorage.getItem("user-token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await Api.get<UserSubscriptionsResponse>(
        "/push-notification/user/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch subscriptions",
        );
      }
      return response.data.data || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch subscriptions";
      console.error("Error fetching push subscriptions:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Unsubscribe from push notifications by subscription ID
   */
  async unsubscribeById(subscriptionId: string): Promise<void> {
    try {
      if (!subscriptionId || typeof subscriptionId !== "string") {
        throw new Error("Invalid subscription ID");
      }

      const token = localStorage.getItem("user-token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await Api.delete(
        `/push-notification/unsubscribe/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Push subscription removed successfully", response.data);
      return response.data.data || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch subscriptions";
      console.error("Error fetching push subscriptions:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Unsubscribe from push notifications by subscription ID
   */

  /**
   * Unsubscribe all push subscriptions for user
   */
  async unsubscribeAll(): Promise<void> {
    try {
      const token = localStorage.getItem("user-token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await Api.delete("/push-notification/unsubscribe/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("All push subscriptions removed successfully", response.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to unsubscribe all";
      console.error("Error unsubscribing all:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current browser subscription
   */
  async getCurrentBrowserSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.isServiceWorkerSupported) {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Error getting current subscription:", error);
      return null;
    }
  }

  /**
   * Check if device is already subscribed
   */
  async isSubscribed(): Promise<boolean> {
    try {
      const browserSubscription = await this.getCurrentBrowserSubscription();
      if (!browserSubscription) {
        return false;
      }

      // Verify with backend
      const userSubscriptions = await this.getUserSubscriptions();
      const endpoint = browserSubscription.endpoint;

      return userSubscriptions.some((sub) => sub.endpoint === endpoint);
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
