"use client";

import React, { useEffect, useState } from "react";
import { X, Users, Shield, Trash2, UserMinus } from "lucide-react";
import Api from "@/utils/api";

interface ChannelMember {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  role?: string;
  email?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string | null;
  };
}

interface ChannelInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  channel: {
    id: string;
    name: string;
    description?: string;
    members?: ChannelMember[];
  } | null;
  onRemoveMember?: (memberId: number) => void;
}

export const ChannelInfoDrawer: React.FC<ChannelInfoDrawerProps> = ({
  isOpen,
  onClose,
  channel,
  onRemoveMember,
}) => {
  const [membersList, setMembersList] = useState<ChannelMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && channel?.id) {
      const token = localStorage.getItem("user-token");
      setLoading(true);
      Api.get(`/chat/channels/${channel.id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          setMembersList(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => {
          setMembersList(channel.members || []);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, channel]);

  if (!isOpen || !channel) return null;

  const handleRemove = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this member from the channel?")) return;
    if (onRemoveMember) {
      onRemoveMember(userId);
    } else {
      const token = localStorage.getItem("user-token");
      try {
        await Api.delete(`/chat/channels/${channel.id}/members/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembersList((prev) => prev.filter((m) => (m.user?.id || m.id) !== userId));
      } catch (err) {
        console.error("Failed to remove member:", err);
      }
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-[#141414] border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base">
          Group Info
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Profile Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            #
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
            #{channel.name}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {membersList.length || channel.members?.length || 0} Members
          </p>
        </div>

        {channel.description && (
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 font-medium">Description</p>
            <p className="text-sm font-normal text-gray-700 dark:text-gray-300 mt-1">
              {channel.description}
            </p>
          </div>
        )}

        {/* Member List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-lime-500" />
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                Group Members ({membersList.length})
              </h4>
            </div>
          </div>

          {loading ? (
            <p className="text-xs text-gray-400 text-center py-4">Loading group members...</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {membersList.map((m: any) => {
                const firstName = m.user?.firstName || m.firstName || "Member";
                const lastName = m.user?.lastName || m.lastName || "";
                const email = m.user?.email || m.email || "";
                const avatar = m.user?.photoUrl || m.photoUrl;
                const userId = m.user?.id || m.id;

                return (
                  <div
                    key={userId}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition group border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={firstName}
                          className="w-9 h-9 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xs">
                          {firstName?.charAt(0) || "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {firstName} {lastName}
                        </p>
                        {email && (
                          <p className="text-[11px] text-gray-400 truncate">{email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {m.role === "admin" || m.role === "owner" ? (
                        <span className="text-[10px] bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-400 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Shield size={10} />
                          <span>Admin</span>
                        </span>
                      ) : null}

                      <button
                        onClick={() => handleRemove(userId)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                        title="Remove member"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelInfoDrawer;
