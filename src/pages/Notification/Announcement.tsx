"use client";

import React, { JSX, useEffect, useState } from "react";
import { Package, Layers, Megaphone } from "lucide-react";
import Api from "@/utils/api";
import AnnouncementModal from "./AnnouncementModal";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedProductDemo?: { id: number };
  relatedAnnouncement?: { id: number };
}

const iconMap: Record<string, JSX.Element> = {
  demo: <Layers className="text-indigo-500" size={18} />,
  announcement: <Megaphone className="text-blue-500" size={18} />,
  new_product: <Package className="text-orange-500" size={18} />,
};

const AnnouncementList: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notification | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await Api.get(
          `/notification/special/notice?recipientId=${userId}`
        );
        const data = res.data?.data || res.data || [];
        setAnnouncements(data);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading)
    return (
      <div className="p-4 text-sm text-gray-500">Loading announcements...</div>
    );

  if (announcements.length === 0)
    return (
      <p className="text-sm text-gray-500 p-3 text-center">
        No announcements yet.
      </p>
    );

  return (
    <>
      <div className="flex flex-col divide-y divide-gray-100">
        {announcements.map((n) => (
          <div
            key={n.id}
            onClick={() => setSelected(n)}
            className="flex items-start gap-3 py-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg px-2"
          >
            <div className="mt-1">
              {iconMap[n.type] ?? (
                <Package className="text-gray-400" size={18} />
              )}
            </div>
            <div>
              <p
                className={`text-sm ${
                  n.isRead ? "text-gray-600" : "text-gray-800 font-medium"
                }`}
              >
                {n.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{n.message}</p>
              <span className="text-xs text-gray-400 mt-1 block">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 🪶 Announcement Modal */}
      {selected && (
        <AnnouncementModal
          notification={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default AnnouncementList;
