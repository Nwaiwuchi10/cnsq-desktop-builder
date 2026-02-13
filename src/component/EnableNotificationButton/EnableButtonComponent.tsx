"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { pushNotificationService } from "@/utils/pushNotificationService";

interface NotificationStatus {
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

/**
 * EnableNotificationsButton Component
 * Production-ready push notification subscription button with:
 * - Comprehensive error handling
 * - Loading states
 * - Toast notifications
 * - Subscription status checking
 * - Proper accessibility attributes
 */
export default function EnableNotificationsButton() {
  const [status, setStatus] = useState<NotificationStatus>({
    isSubscribed: false,
    isLoading: true,
    error: null,
    success: null,
  });

  const [showMessage, setShowMessage] = useState(false);

  /**
   * Check subscription status on mount
   */
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setStatus((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        const isSubscribed = await pushNotificationService.isSubscribed();
        setStatus((prev) => ({
          ...prev,
          isSubscribed,
          isLoading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to check subscription status";

        setStatus((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        console.error("Subscription check error:", errorMessage);
      }
    };

    checkSubscriptionStatus();
  }, []);

  /**
   * Clear messages after 5 seconds
   */
  useEffect(() => {
    if (status.error || status.success) {
      const timer = setTimeout(() => {
        setStatus((prev) => ({
          ...prev,
          error: null,
          success: null,
        }));
        setShowMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status.error, status.success]);

  /**
   * Handle subscription toggle
   */
  const handleToggleSubscription = useCallback(async () => {
    try {
      setStatus((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        success: null,
      }));

      if (status.isSubscribed) {
        // Unsubscribe all subscriptions
        await pushNotificationService.unsubscribeAll();

        setStatus((prev) => ({
          ...prev,
          isSubscribed: false,
          isLoading: false,
          success: "Notifications disabled successfully",
        }));

        setShowMessage(true);
      } else {
        // Subscribe to push notifications
        await pushNotificationService.subscribe();

        setStatus((prev) => ({
          ...prev,
          isSubscribed: true,
          isLoading: false,
          success: "Notifications enabled successfully ✅",
        }));

        setShowMessage(true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      setShowMessage(true);
      console.error("Notification toggle error:", errorMessage);
    }
  }, [status.isSubscribed]);

  // Show loading state during initial check
  if (status.isLoading && !status.isSubscribed && !status.error) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-600 cursor-not-allowed"
        aria-label="Checking notification permissions"
      >
        <Loader size={18} className="animate-spin" />
        <span className="text-sm">Checking...</span>
      </button>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={handleToggleSubscription}
        disabled={status.isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 w-full ${
          status.isSubscribed
            ? "bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-red-100"
            : "bg-lime-100 text-lime-700 hover:bg-lime-200 disabled:bg-lime-100"
        } disabled:opacity-60 disabled:cursor-not-allowed`}
        aria-label={
          status.isSubscribed
            ? "Disable push notifications"
            : "Enable push notifications"
        }
        aria-pressed={status.isSubscribed}
      >
        {status.isLoading ? (
          <>
            <Loader size={18} className="animate-spin" />
            <span className="text-sm">
              {status.isSubscribed ? "Disabling..." : "Enabling..."}
            </span>
          </>
        ) : status.isSubscribed ? (
          <>
            <BellOff size={18} />
            <span className="text-sm">Disable Notifications</span>
          </>
        ) : (
          <>
            <Bell size={18} />
            <span className="text-sm">Enable Notifications</span>
          </>
        )}
      </button>

      {/* Inline messages */}
      {showMessage && status.success && (
        <div
          className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-green-50 border border-green-200"
          role="alert"
          aria-live="polite"
        >
          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700">{status.success}</span>
        </div>
      )}

      {showMessage && status.error && (
        <div
          className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-red-50 border border-red-200"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{status.error}</span>
        </div>
      )}

      {/* Browser support warning */}
      {!pushNotificationService.isBrowserSupported() && !status.isLoading && (
        <div
          className="flex items-center gap-2 mt-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200"
          role="alert"
        >
          <AlertCircle size={16} className="text-yellow-600 flex-shrink-0" />
          <span className="text-sm text-yellow-700">
            Push notifications are not supported in your browser
          </span>
        </div>
      )}
    </div>
  );
}
