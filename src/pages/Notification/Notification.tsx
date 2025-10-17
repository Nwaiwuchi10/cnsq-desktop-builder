"use client";

import { useState } from "react";
import {
  Tag,
  ClipboardCheck,
  MessageSquare,
  Clock,
  Bell,
  AlertTriangle,
  Layers,
  Package,
} from "lucide-react";
import NotificationModal from "./NotificationModal";

const notifications = [
  {
    id: 1,
    icon: <Tag className="text-green-500" size={18} />,
    message:
      "A new tag has been added to your project — UI Redesign is now tagged as ‘High Priority’",
    time: "Just Now",
    read: false,
  },
  {
    id: 2,
    icon: <ClipboardCheck className="text-yellow-500" size={18} />,
    message: "You’ve been assigned a new project: Website Revamp for Client A",
    time: "30 minutes ago",
    read: false,
  },
  {
    id: 3,
    icon: <MessageSquare className="text-green-500" size={18} />,
    message:
      "Jane Doe commented on Homepage Design: ‘Can we try a lighter background?’",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 4,
    icon: <Clock className="text-green-500" size={18} />,
    message:
      "The status of Marketing Landing Page changed from In Progress → Review",
    time: "Yesterday",
    read: true,
  },
  {
    id: 5,
    icon: <AlertTriangle className="text-yellow-500" size={18} />,
    message:
      "Deadline reached for Mobile App Prototype. Please review or submit final files",
    time: "Yesterday",
    read: true,
  },
  {
    id: 6,
    icon: <Layers className="text-green-500" size={18} />,
    message:
      "Project details updated — E-commerce Dashboard now includes an additional feature: Order Tracking Tab",
    time: "2 days ago",
    read: true,
  },
  {
    id: 7,
    icon: <Package className="text-blue-500" size={18} />,
    message:
      "New product added: Omume Insights Pro — advanced analytics for your events",
    time: "3 days ago",
    read: true,
  },
];

export default function NotificationsList() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [selectedNotification, setSelectedNotification] = useState<any | null>(
    null
  );

  const filtered =
    activeTab === "all" ? notifications : notifications.filter((n) => !n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mt-24 mb-16 max-w-3xl mx-auto bg-white shadow-sm rounded-2xl mt-10 p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
        <span
          className="text-sm font-medium text-white rounded-full px-2 py-0.5"
          style={{ backgroundColor: "#FF990C" }}
        >
          {notifications.length}
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
          All notifications
        </button>
        <button
          style={{ cursor: "pointer" }}
          onClick={() => setActiveTab("unread")}
          className={`pb-2 text-sm font-medium flex items-center gap-1 transition-colors ${
            activeTab === "unread"
              ? "text-[#FF990C] border-b-2 border-[#FF990C]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Annoucement
          <span
            className="ml-1 text-xs font-medium text-white rounded-full px-2"
            style={{ backgroundColor: "#FF990C" }}
          >
            {unreadCount}
          </span>
        </button>
      </div>

      {/* Notification List */}
      <div className="flex flex-col divide-y divide-gray-100">
        {filtered.map((n) => (
          <div
            key={n.id}
            onClick={() =>
              activeTab === "all" ? setSelectedNotification(n) : null
            }
            className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors rounded-lg px-2"
          >
            <div className="mt-1">{n.icon}</div>
            <div>
              <p
                className={`text-sm ${
                  n.read ? "text-gray-600" : "text-gray-800 font-medium"
                }`}
              >
                {n.message}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">{n.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Triggered Here */}
      {selectedNotification && (
        <NotificationModal
          onClose={() => setSelectedNotification(null)}
          notification={selectedNotification}
        />
      )}
    </div>
  );
}
