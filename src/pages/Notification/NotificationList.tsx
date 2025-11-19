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
      <div className="p-4 text-sm text-gray-500">Loading notifications...</div>
    );

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.isRead);

  const nonAnnouncement = filtered.filter(
    (n) => n.type !== "demo" && n.type !== "announcement"
  );

  return (
    <>
      <div className="flex flex-col divide-y divide-gray-100">
        {nonAnnouncement.length === 0 && (
          <p className="text-sm text-gray-500 p-3 text-center">
            No notifications found.
          </p>
        )}

        {nonAnnouncement.map((n) => (
          <div className="flex items-center gap-8 py-3 ">
            <div
              key={n.id}
              onClick={() => handleOpenNotification(n)}
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
                  {n.title.replace("_", " ")}
                </p>
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
    </>
  );
};

export default NotificationList;
