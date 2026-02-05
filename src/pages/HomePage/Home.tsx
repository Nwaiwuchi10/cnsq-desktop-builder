// export default HomePage;
"use client";
// import { useEffect, useState } from "react";
// import Api from "@/utils/api";
import Navbar from "@/component/Navbar/Navbar";

import StatsCards from "@/component/AnalysisSection/Analysis";
import Footer from "@/component/Footer/Footer";
import LatestAnniversary from "@/component/LatesAnniversay/LatestAnniversary";
import LatestBirthday from "@/component/LatestBirthday/LatetsBirthday";
import TeamProfiles from "@/component/TeamProfile/TeamProfile";
import QuickActions from "@/component/QuickActions/QuickActions";
// import AnnouncementModal from "../Notification/AnnouncementModal";
import HeroSection from "@/component/HeroSection/Hero";

import SubscriptionStatsCards from "@/component/QuoteRequestSubscriptionStat/SubscriptionStatCard";
// import { enableNotifications } from "@/component/EnableNotificationButton/EnableNotificationsButton";

// interface Notification {
//   id: number;
//   type: string;
//   title: string;
//   message: string;
//   createdAt: string;
//   relatedProductDemo?: { id: number };
//   relatedAnnouncement?: { id: number };
// }

const HomePage = () => {
  // const [activeNotification, setActiveNotification] =
  //   useState<Notification | null>(null);
  // const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  // const [showToast, setShowToast] = useState(false);

  // useEffect(() => {
  //   async function initNotifications() {
  //     // Check if toast was already shown before
  //     const toastShown = localStorage.getItem("homepage_toast_shown");

  //     if (!toastShown) {
  //       // First-time visit → run notification logic
  //       const result = await enableNotifications();
  //       setNotificationsEnabled(result);

  //       setShowToast(true);
  //       setTimeout(() => setShowToast(false), 8000);

  //       // Mark as shown so it never displays again
  //       localStorage.setItem("homepage_toast_shown", "true");
  //     }
  //   }

  //   initNotifications();
  // }, []);

  // useEffect(() => {
  //   const fetchSpecialNotices = async () => {
  //     try {
  //       const recipientId = localStorage.getItem("userId");
  //       if (!recipientId) return;

  //       const res = await Api.get(
  //         `/notification/special/notice?recipientId=${recipientId}`
  //       );
  //       const notifications: Notification[] = res.data;

  //       const now = new Date().getTime();
  //       const recentNotices = notifications.filter((n) => {
  //         const createdTime = new Date(n.createdAt).getTime();
  //         const isWithin24Hrs = now - createdTime <= 24 * 60 * 60 * 1000;

  //         const closed = localStorage.getItem(`closed_notification_${n.id}`);
  //         const showCount =
  //           Number(localStorage.getItem(`shown_count_${n.id}`)) || 0;

  //         // Show only if within 24h, not closed, and shown less than twice
  //         return isWithin24Hrs && !closed && showCount < 2;
  //       });

  //       if (recentNotices.length > 0) {
  //         const firstNotice = recentNotices[0];

  //         // Increment show count each time the modal appears
  //         const currentCount =
  //           Number(localStorage.getItem(`shown_count_${firstNotice.id}`)) || 0;
  //         localStorage.setItem(
  //           `shown_count_${firstNotice.id}`,
  //           String(currentCount + 1)
  //         );

  //         setActiveNotification(firstNotice);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching special notices:", error);
  //     }
  //   };

  //   fetchSpecialNotices();
  // }, []);

  // const handleCloseModal = () => {
  //   if (activeNotification) {
  //     localStorage.setItem(
  //       `closed_notification_${activeNotification.id}`,
  //       "true"
  //     );
  //     setActiveNotification(null);
  //   }
  // };

  return (
    <div>
      <Navbar />
      {/* Optional display for notification status */}
      {/* <div
        className={`fixed top-16 right-4 p-3 rounded-md shadow-lg z-50 transition-opacity duration-500 ${
          showToast ? "opacity-100" : "opacity-0"
        } ${notificationsEnabled ? "bg-lime-500" : "bg-red-500"} text-white`}
      >
        {notificationsEnabled
          ? "Notifications Enabled ✅"
          : "Notifications Not Enabled ⚠️"}
      </div> */}

      <HeroSection />
      <SubscriptionStatsCards />
      <StatsCards />

      <QuickActions />
      <LatestBirthday />
      <TeamProfiles />
      <LatestAnniversary />
      <Footer />

      {/* Auto popup modal with friendly display limit */}
      {/* {activeNotification && (
        <AnnouncementModal
          notification={activeNotification}
          onClose={handleCloseModal}
        />
      )} */}
    </div>
  );
};

export default HomePage;
