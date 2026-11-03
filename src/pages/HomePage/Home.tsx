// export default HomePage;
"use client";
import { useEffect, useState } from "react";
import Api from "@/utils/api";
import Navbar from "@/component/Navbar/Navbar";

import StatsCards from "@/component/AnalysisSection/Analysis";
import Footer from "@/component/Footer/Footer";
import LatestAnniversary from "@/component/LatesAnniversay/LatestAnniversary";
import LatestBirthday from "@/component/LatestBirthday/LatetsBirthday";
import TeamProfiles from "@/component/TeamProfile/TeamProfile";
import QuickActions from "@/component/QuickActions/QuickActions";
import QuickNavigation from "@/component/QuickNavigation/QuickNavigation";
import AnnouncementModal from "../Notification/AnnouncementModal";
import HeroSection from "@/component/HeroSection/Hero";
import ProjectMetricsSection from "@/component/ProjectMetrics/ProjectMetricsSection";

import SubscriptionStatsCards from "@/component/QuoteRequestSubscriptionStat/SubscriptionStatCard";
import { pushNotificationService } from "@/utils/pushNotificationService";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  relatedProductDemo?: { id: number };
  relatedAnnouncement?: { id: number };
}

const HomePage = () => {
  const [activeNotification, setActiveNotification] =
    useState<Notification | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<{
    isEnabled: boolean | null;
    isLoading: boolean;
  }>({
    isEnabled: null,
    isLoading: true,
  });
  const [showToast, setShowToast] = useState(false);

  /**
   * Initialize push notifications on first visit
   * - Check if user is authenticated
   * - Check if already subscribed
   * - Attempt to subscribe if not already subscribed
   */
  useEffect(() => {
    async function initNotifications() {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem("user-token");
        if (!token) {
          setNotificationStatus({
            isEnabled: false,
            isLoading: false,
          });
          return;
        }

        // Check if we've already attempted notification setup
        const notificationCheckDone = localStorage.getItem(
          "notification_init_done",
        );

        if (notificationCheckDone) {
          // Just restore status from last known state
          const wasEnabled =
            localStorage.getItem("notification_last_status") === "true";
          setNotificationStatus({
            isEnabled: wasEnabled,
            isLoading: false,
          });
          return;
        }

        // First time - check if already subscribed
        const isSubscribed = await pushNotificationService.isSubscribed();

        if (isSubscribed) {
          setNotificationStatus({
            isEnabled: true,
            isLoading: false,
          });
          setShowToast(true);
          localStorage.setItem("notification_last_status", "true");
          localStorage.setItem("notification_init_done", "true");
          return;
        }

        // Not subscribed - attempt to subscribe
        try {
          await pushNotificationService.subscribe();
          setNotificationStatus({
            isEnabled: true,
            isLoading: false,
          });
          localStorage.setItem("notification_last_status", "true");
          setShowToast(true);
        } catch (subscribeError) {
          // Subscription failed - could be due to:
          // - User denied permission
          // - Browser not supported
          // - Network error
          console.warn(
            "Push notification subscription failed:",
            subscribeError,
          );
          setNotificationStatus({
            isEnabled: false,
            isLoading: false,
          });
          localStorage.setItem("notification_last_status", "false");
          setShowToast(true);
        }

        // Mark initialization as done
        localStorage.setItem("notification_init_done", "true");
      } catch (error) {
        console.error("Notification initialization error:", error);
        setNotificationStatus({
          isEnabled: false,
          isLoading: false,
        });
      }
    }

    initNotifications();
  }, []);

  // Auto-hide toast after 8 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Fetch special announcement notices
  useEffect(() => {
    const fetchSpecialNotices = async () => {
      try {
        const recipientId = localStorage.getItem("userId");
        if (!recipientId) return;

        const res = await Api.get(
          `/notification/special/notice?recipientId=${recipientId}`,
        );
        const notifications: Notification[] = res.data;

        const now = new Date().getTime();
        const recentNotices = notifications.filter((n) => {
          const createdTime = new Date(n.createdAt).getTime();
          const isWithin24Hrs = now - createdTime <= 24 * 60 * 60 * 1000;

          const closed = localStorage.getItem(`closed_notification_${n.id}`);
          const showCount =
            Number(localStorage.getItem(`shown_count_${n.id}`)) || 0;

          // Show only if within 24h, not closed, and shown less than twice
          return isWithin24Hrs && !closed && showCount < 2;
        });

        if (recentNotices.length > 0) {
          const firstNotice = recentNotices[0];

          // Increment show count each time the modal appears
          const currentCount =
            Number(localStorage.getItem(`shown_count_${firstNotice.id}`)) || 0;
          localStorage.setItem(
            `shown_count_${firstNotice.id}`,
            String(currentCount + 1),
          );

          setActiveNotification(firstNotice);
        }
      } catch (error) {
        console.error("Error fetching special notices:", error);
      }
    };

    fetchSpecialNotices();
  }, []);

  const handleCloseModal = () => {
    if (activeNotification) {
      localStorage.setItem(
        `closed_notification_${activeNotification.id}`,
        "true",
      );
      setActiveNotification(null);
    }
  };

  return (
    <div>
      <Navbar />

      {/* Notification Status Toast */}
      {showToast && notificationStatus.isEnabled !== null && (
        <div
          className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 transition-opacity duration-500 ${showToast ? "opacity-100" : "opacity-0 pointer-events-none"
            } ${notificationStatus.isEnabled ? "bg-green-500" : "bg-amber-500"
            } text-white max-w-sm`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            {notificationStatus.isLoading ? (
              <>
                <div className="animate-spin">⏳</div>
                <span>Setting up notifications...</span>
              </>
            ) : notificationStatus.isEnabled ? (
              <>
                <span>✅</span>
                <span>Push notifications enabled successfully!</span>
              </>
            ) : (
              <>
                <span>⚠️</span>
                <span>
                  Push notifications could not be enabled. You can enable them
                  later in the menu.
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <HeroSection />
      {/* <SubscriptionStatsCards /> */}
      {/* <StatsCards /> */}

      {/* <QuickActions /> */}
      <QuickNavigation />
      <ProjectMetricsSection />
      <LatestBirthday />
      <TeamProfiles />
      <LatestAnniversary />
      <Footer />

      {/* Auto popup modal with friendly display limit */}
      {activeNotification && (
        <AnnouncementModal
          notification={activeNotification}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default HomePage;
