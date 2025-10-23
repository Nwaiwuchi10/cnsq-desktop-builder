"use client";

import { useState, useEffect } from "react";

import NotificationList from "./NotificationList";
import AnnouncementList from "./Announcement";
import Api from "@/utils/api";
import LoadingSpinner from "@/component/Loading/LoadingSpinner";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Notification() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [announcementCount, setAnnouncementCount] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await Api.get(
          `/notification/all/notice?recipientId=${userId}`
        );
        setNotifications(res.data?.data || res.data || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  //Fetch announcement counts (NEW PRODUCT, DEMO, ANNOUNCEMENT)
  useEffect(() => {
    const fetchAnnouncementCount = async () => {
      try {
        const token = localStorage.getItem("user-token");
        if (!token) return;

        const res = await Api.get("/notification/counts/special", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAnnouncementCount(res.data?.unreadCount ?? 0);
      } catch (error) {
        console.error("Failed to fetch announcement count:", error);
      }
    };

    fetchAnnouncementCount();
    const interval = setInterval(fetchAnnouncementCount, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await Api.get("/notification/unread-count/recipient", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch unread count", error);
      }
    };

    fetchUnreadCount();

    // optional: auto-refresh every 60 seconds
    const interval = setInterval(fetchUnreadCount, 2000);
    return () => clearInterval(interval);
  }, []);
  //   const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="mt-24 mb-16 max-w-3xl mx-auto bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
        <span
          className="text-sm font-medium text-white rounded-full px-2 py-0.5"
          style={{ backgroundColor: "#FF990C" }}
        >
          {unreadCount}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`mr-6 pb-2 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "text-[#FF990C] border-b-2 border-[#FF990C]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`pb-2 text-sm font-medium flex items-center gap-1 transition-colors ${
            activeTab === "unread"
              ? "text-[#FF990C] border-b-2 border-[#FF990C]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Announcements
          <span
            className="ml-1 text-xs font-medium text-white rounded-full px-2"
            style={{ backgroundColor: "#FF990C" }}
          >
            {announcementCount}
          </span>
        </button>
      </div>

      {/* Lists */}
      {activeTab === "all" ? (
        <NotificationList
          activeTab="all"
          setSelectedNotification={setSelectedNotification}
        />
      ) : (
        <AnnouncementList />
      )}
    </div>
  );
}
