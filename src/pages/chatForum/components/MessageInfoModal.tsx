"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCheck, Eye, Clock } from "lucide-react";
import Api from "@/utils/api";

interface StaffUser {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

interface MessageInfoData {
  message: {
    id: string;
    text: string;
    createdAt: string;
    author: StaffUser | null;
  };
  readBy: StaffUser[];
  unreadBy: StaffUser[];
}

interface MessageInfoModalProps {
  messageId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MessageInfoModal: React.FC<MessageInfoModalProps> = ({
  messageId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<MessageInfoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"read" | "unread">("read");

  useEffect(() => {
    if (isOpen && messageId) {
      const token = localStorage.getItem("user-token");
      setLoading(true);
      Api.get<MessageInfoData>(`/chat/messages/${messageId}/info`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => setData(res.data))
        .catch((err) => console.error("Error fetching message info:", err))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [isOpen, messageId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <CheckCheck size={20} className="text-lime-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Message Info
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Content Preview */}
        {data?.message && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800">
            <div className="text-xs font-semibold text-gray-500 mb-1">
              Message Preview
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
              {data.message.text || "(Media Attachment)"}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
              <Clock size={12} />
              <span>
                Sent at {new Date(data.message.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Read / Unread Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
          <button
            onClick={() => setActiveTab("read")}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "read"
                ? "border-lime-500 text-lime-600 dark:text-lime-400 bg-white dark:bg-[#141414]"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Eye size={14} />
            Read by ({data?.readBy?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "unread"
                ? "border-lime-500 text-lime-600 dark:text-lime-400 bg-white dark:bg-[#141414]"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Clock size={14} />
            Delivered / Unread ({data?.unreadBy?.length ?? 0})
          </button>
        </div>

        {/* Staff List Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-lime-500" />
            </div>
          ) : activeTab === "read" ? (
            data?.readBy.length === 0 ? (
              <div className="text-center text-xs text-gray-400 py-8">
                No one has read this message yet.
              </div>
            ) : (
              <div className="space-y-3">
                {data?.readBy.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      {user.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt={user.firstName}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-lime-500 text-black flex items-center justify-center font-bold text-xs shadow-sm">
                          {user.firstName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-[11px] text-gray-400">Read</div>
                      </div>
                    </div>
                    <CheckCheck size={16} className="text-lime-500" />
                  </div>
                ))}
              </div>
            )
          ) : data?.unreadBy.length === 0 ? (
            <div className="text-center text-xs text-gray-400 py-8">
              Everyone in the chat has read this message! 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {data?.unreadBy.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.firstName}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-xs">
                        {user.firstName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Delivered
                      </div>
                    </div>
                  </div>
                  <Clock size={16} className="text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInfoModal;
