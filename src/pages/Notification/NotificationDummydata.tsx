"use client";

import React, { JSX, useEffect, useState } from "react";
import {
  Tag,
  ClipboardCheck,
  MessageSquare,
  Clock,
  AlertTriangle,
  Layers,
  Package,
} from "lucide-react";
import Api from "@/utils/api";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedProject?: { projectName: string };
}

interface NotificationListProps {
  activeTab: "all" | "unread";
  setSelectedNotification: (n: Notification) => void;
}

const iconMap: Record<string, JSX.Element> = {
  project_tag: <Tag className="text-green-500" size={18} />,
  assignment: <ClipboardCheck className="text-blue-500" size={18} />,
  comment: <MessageSquare className="text-green-500" size={18} />,
  task_assignment: <ClipboardCheck className="text-yellow-500" size={18} />,
  task_comment: <MessageSquare className="text-purple-500" size={18} />,
  task_update: <Layers className="text-blue-500" size={18} />,
  status_change: <Clock className="text-indigo-500" size={18} />,
  deadline: <AlertTriangle className="text-red-500" size={18} />,
  project_update: <Layers className="text-teal-500" size={18} />,
  new_product: <Package className="text-orange-500" size={18} />,
};

const NotificationDummy: React.FC<NotificationListProps> = ({
  activeTab,
  setSelectedNotification,
}) => {
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

        // const data = await response.json();
        setNotifications(res.data.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading)
    return (
      <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
    );

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.isRead);

  // Exclude announcements (handled separately)
  const nonAnnouncement = filtered.filter(
    (n) => n.type !== "demo" && n.type !== "announcement"
  );

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {nonAnnouncement.length === 0 && (
        <p className="text-sm text-gray-500 p-3 text-center">
          No notifications found.
        </p>
      )}

      {nonAnnouncement.map((n) => (
        <div
          key={n.id}
          onClick={() => setSelectedNotification(n)}
          className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors rounded-lg px-2 cursor-pointer"
        >
          <div className="mt-1">
            {iconMap[n.type] ?? <Tag className="text-gray-400" size={18} />}
          </div>
          <div>
            <p
              className={`text-sm ${
                n.isRead ? "text-gray-600" : "text-gray-800 font-medium"
              }`}
            >
              {n.title}
            </p>
            <span className="text-xs text-gray-400 mt-1 block">
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationDummy;
