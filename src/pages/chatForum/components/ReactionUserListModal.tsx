"use client";

import React, { useState, useEffect } from "react";
import { X, Smile } from "lucide-react";
import Api from "@/utils/api";

interface ReactorUser {
  id: string;
  emoji: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
}

interface ReactionUserListModalProps {
  messageId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReactionUserListModal: React.FC<ReactionUserListModalProps> = ({
  messageId,
  isOpen,
  onClose,
}) => {
  const [reactors, setReactors] = useState<ReactorUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeEmojiFilter, setActiveEmojiFilter] = useState<string>("all");

  useEffect(() => {
    if (isOpen && messageId) {
      const token = localStorage.getItem("user-token");
      setLoading(true);
      Api.get<ReactorUser[]>(`/chat/messages/${messageId}/reaction-users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => setReactors(res.data || []))
        .catch((err) => console.error("Error fetching reaction users:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, messageId]);

  if (!isOpen) return null;

  const uniqueEmojis = Array.from(new Set(reactors.map((r) => r.emoji)));

  const filteredReactors =
    activeEmojiFilter === "all"
      ? reactors
      : reactors.filter((r) => r.emoji === activeEmojiFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Smile size={20} className="text-lime-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              Reactions ({reactors.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Emoji Filter Tabs */}
        {uniqueEmojis.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
            <button
              onClick={() => setActiveEmojiFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                activeEmojiFilter === "all"
                  ? "bg-lime-500 text-black"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              All ({reactors.length})
            </button>
            {uniqueEmojis.map((emoji) => {
              const count = reactors.filter((r) => r.emoji === emoji).length;
              return (
                <button
                  key={emoji}
                  onClick={() => setActiveEmojiFilter(emoji)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition ${
                    activeEmojiFilter === emoji
                      ? "bg-lime-500 text-black"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Reactor List */}
        <div className="max-h-72 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-6">
              Loading reactions...
            </p>
          ) : filteredReactors.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">
              No reactions found.
            </p>
          ) : (
            filteredReactors.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
              >
                <div className="flex items-center gap-3">
                  {r.user.avatar ? (
                    <img
                      src={r.user.avatar}
                      alt={r.user.firstName}
                      className="w-9 h-9 rounded-xl object-cover border border-gray-100 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white font-bold text-sm">
                      {r.user.firstName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {r.user.firstName} {r.user.lastName}
                    </p>
                  </div>
                </div>
                <span className="text-xl bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
                  {r.emoji}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactionUserListModal;
