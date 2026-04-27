"use client";
import React, { JSX, useEffect, useState } from "react";
import {
  Tag,
  ClipboardCheck,
  MessageSquare,
  Clock,
  AlertTriangle,
  Layers,
  Trash2,
} from "lucide-react";
import Api from "@/utils/api";
import NotificationModal from "./NotificationModal";
import DeleteConfirmModal from "./DeleteResuableModal";
import { AxiosError } from "axios";
import CustomModal from "@/component/Message/Message";

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
};

const NotificationList: React.FC<NotificationListProps> = ({
  activeTab,
  setSelectedNotification,
}) => {
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await Api.get(
          `/notification/all/notice?recipientId=${userId}`
        );
        const data = res.data?.data || res.data || [];
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // const interval = setInterval(fetchNotifications, 2000);
    // return () => clearInterval(interval);
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
      setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("user-token");
      if (!token) throw new Error("No authorization token found");

      await Promise.all(
        selectedIds.map((id) =>
          Api.delete(`/notification/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      setModal({ type: "success", message: "Selected notifications deleted successfully!" });
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to delete selected notifications.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleSelect = (id: number, isRead: boolean) => {
    if (!isRead) {
      setModal({
        type: "error",
        message: "Only read notifications can be selected for deletion.",
      });
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (nonAnnouncement: Notification[]) => {
    const readNotifications = nonAnnouncement.filter((n) => n.isRead);
    const readIds = readNotifications.map((n) => n.id);

    if (selectedIds.length === readIds.length && readIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(readIds);
    }
  };

  const handleOpenNotification = async (n: Notification) => {
    try {
      const res = await Api.get(`/notification/${n.id}`);
      setSelected(res.data);
    } catch (err) {
      console.error("Failed to fetch notification details:", err);
    }
  };

  if (loading)
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading notifications...</div>
    );

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.isRead);

  const errorMap: any = null; // No longer needed
  const nonAnnouncement = filtered.filter(
    (n) => n.type !== "demo" && n.type !== "announcement" && n.type !== "ceo_message"
  );

  return (
    <>
      <div className="flex flex-col">
        {nonAnnouncement.length > 0 && (
          <div className="flex items-center justify-between py-2 px-2 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg mb-2 transition-colors">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={() => handleSelectAll(nonAnnouncement)}
                checked={
                  selectedIds.length ===
                  nonAnnouncement.filter((n) => n.isRead).length &&
                  selectedIds.length > 0
                }
                className="w-4 h-4 rounded border-gray-300 text-[#FF990C] focus:ring-[#FF990C]"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All Read</span>
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {nonAnnouncement.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 p-3 text-center">
            No notifications found.
          </p>
        )}

        <div className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
          {nonAnnouncement.map((n) => (
            <div
              key={n.id}
              className="flex items-center gap-2 py-3 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors rounded-lg px-2"
            >
              <div
                onClick={() => handleOpenNotification(n)}
                className="flex flex-1 items-start gap-3 cursor-pointer"
              >
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(n.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleToggleSelect(n.id, n.isRead)}
                    className="w-4 h-4 rounded border-gray-300 text-[#FF990C] focus:ring-[#FF990C] cursor-pointer"
                  />
                </div>

                <div className="mt-1">
                  {iconMap[n.type] ?? <Tag className="text-gray-400" size={18} />}
                </div>

                <div className="flex-1">
                  <p
                    className={`text-sm transition-colors ${n.isRead ? "text-gray-400 font-normal" : "text-black dark:text-white font-lighter"
                      }`}
                  >
                    {n.title.replace("_", " ")}
                  </p>
                  <span
                    className={`text-xs mt-1 block transition-colors ${n.isRead ? "text-gray-300 dark:text-gray-600" : "text-gray-500 dark:text-gray-400 font-medium"
                      }`}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <div>
                <button
                  onClick={() => setDeleteTarget(n)}
                  className="text-red-400 hover:text-red-500 p-2 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modal && (
        <CustomModal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      )}

      {selected && (
        <NotificationModal
          onClose={() => setSelected(null)}
          notification={selected}
          icon={
            iconMap[selected.type] ?? (
              <Tag className="text-gray-400" size={18} />
            )
          }
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}

      {showBulkDeleteConfirm && (
        <DeleteConfirmModal
          title="Delete Selected Notifications"
          message={`Are you sure you want to delete ${selectedIds.length} notifications? This action cannot be undone.`}
          onCancel={() => setShowBulkDeleteConfirm(false)}
          onConfirm={handleBulkDelete}
          loading={deleting}
        />
      )}
    </>
  );
};

export default NotificationList;
