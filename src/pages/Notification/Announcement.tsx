"use client";

import React, { JSX, useEffect, useState } from "react";
import { Package, Layers, Megaphone, Trash2 } from "lucide-react";
import Api from "@/utils/api";
import AnnouncementModal from "./AnnouncementModal";
import { AxiosError } from "axios";
import CustomModal from "@/component/Message/Message";
import DeleteConfirmModal from "./DeleteResuableModal";

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
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [announcements, setAnnouncements] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await Api.get(
          `/notification/special/notice?recipientId=${userId}`
        );
        const data = res.data?.data || res.data || [];

        console.log("announcement", data);
        setAnnouncements(data);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Get the stored token
      const token = localStorage.getItem("user-token");
      if (!token) {
        throw new Error("No authorization token found");
      }

      // Send DELETE request with Authorization header
      await Api.delete(`/notification/${deleteTarget.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state after successful deletion
      setAnnouncements((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      setDeleteTarget(null);
      setModal({ type: "success", message: "Message deleted successfully!" });
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to Delete.",
      });
    } finally {
      setDeleting(false);
    }
  };

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
          <div className="flex items-center gap-8 py-3">
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
            {/* Delete Button */}
            <div>
              <button
                onClick={() => setDeleteTarget(n)}
                className="text-red-500 hover:text-red-600 p-2"
                title="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <CustomModal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      )}

      {/* 🪶 Announcement Modal */}
      {selected && (
        <AnnouncementModal
          notification={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </>
  );
};

export default AnnouncementList;
