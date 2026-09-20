"use client";

import React, { useEffect, useState } from "react";
import { X, Users, Shield, Trash2, UserMinus, Lock, Unlock, ShieldAlert, ShieldCheck } from "lucide-react";
import Api from "@/utils/api";

interface ChannelMember {
  id: any;
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
  userId?: number;
}

interface ChannelInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  channel: {
    id: string;
    name: string;
    description?: string;
    members?: ChannelMember[];
    isLocked?: boolean;
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [confirmRemoveUserId, setConfirmRemoveUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.staffId || payload.id || payload.sub);
    }
  }, []);

  // Fetch members when drawer opens
  useEffect(() => {
    if (isOpen && channel?.id) {
      setIsLocked(channel.isLocked || false);
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
  }, [isOpen, channel?.id]);

  // Sync real-time role updates from the parent (socket)
  useEffect(() => {
    if (channel?.members && channel.members.length > 0) {
      setMembersList((prev) => {
        if (prev.length === 0) return prev;
        
        const realTimeRoles = new Map();
        channel.members!.forEach((m: any) => {
          realTimeRoles.set(m.id, m.role); // map by ConversationMember ID
        });

        let changed = false;
        const next = prev.map((m) => {
          if (realTimeRoles.has(m.id) && realTimeRoles.get(m.id) !== m.role) {
            changed = true;
            return { ...m, role: realTimeRoles.get(m.id) };
          }
          return m;
        });
        
        return changed ? next : prev;
      });
    }
    
    if (channel?.isLocked !== undefined) {
      setIsLocked(channel.isLocked);
    }
  }, [channel?.members, channel?.isLocked]);

  if (!isOpen || !channel) return null;

  const currentUserMember = membersList.find((m) => m.user?.id == currentUserId || m.id == currentUserId || m.userId == currentUserId);
  const isUserAdmin = currentUserMember?.role === "admin" || currentUserMember?.role === "owner" || currentUserMember?.role === "ADMIN" || currentUserMember?.role === "OWNER";
  const isUserOwner = currentUserMember?.role === "owner" || currentUserMember?.role === "OWNER";

  const handleToggleLock = async () => {
    const token = localStorage.getItem("user-token");
    const newLockState = !isLocked;
    try {
      await Api.patch(`/chat/conversations/${channel.id}/lock`, { isLocked: newLockState }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // The socket will update localIsLocked in the parent, which will update this component via props
    } catch (err) {
      console.error("Failed to toggle channel lock", err);
      alert("Failed to toggle channel lock. Only admins and owners can do this.");
    }
  };

  const handleUpdateRole = async (memberId: any, newRole: string) => {
    const token = localStorage.getItem("user-token");
    try {
      await Api.patch(`/chat/conversations/${channel.id}/members/${memberId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Real-time update is handled by the socket
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Failed to update role. " + (err as any)?.response?.data?.message || "An error occurred.");
    }
  };

  const handleRemove = (userId: number) => {
    setConfirmRemoveUserId(userId);
  };

  const confirmRemoveMember = async () => {
    if (confirmRemoveUserId === null) return;
    const userId = confirmRemoveUserId;
    setConfirmRemoveUserId(null);

    if (onRemoveMember) {
      onRemoveMember(userId);
    } else {
      const token = localStorage.getItem("user-token");
      try {
        await Api.delete(`/chat/channels/${channel.id}/members/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Frontend socket event for member removal would ideally handle this, 
        // but for immediate UI feedback we can also update local state here if needed
        setMembersList((prev) => prev.filter((m) => (m.user?.id || m.id || m.userId) !== userId));
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
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg relative">
            #
            {isLocked && (
              <div className="absolute -bottom-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-md border-2 border-white dark:border-[#141414]">
                <Lock size={14} className="text-white" />
              </div>
            )}
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

        {isUserAdmin && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Lock Group</span>
              <span className="text-xs text-gray-500">Only admins can send messages</span>
            </div>
            <button
              onClick={handleToggleLock}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isLocked 
                  ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" 
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
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
                const userId = m.user?.id || m.id || m.userId;
                const memberRecordId = m.id; // This is the ConversationMember ID

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
                      {m.role === "admin" || m.role === "owner" || m.role === "ADMIN" || m.role === "OWNER" ? (
                        <span className="text-[10px] bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-400 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Shield size={10} />
                          <span>{m.role.toLowerCase() === "owner" ? "Owner" : "Admin"}</span>
                        </span>
                      ) : null}

                      {isUserAdmin && userId !== currentUserId && (
                        <>
                          {m.role === "member" || m.role === "MEMBER" ? (
                            <button
                              onClick={() => handleUpdateRole(memberRecordId, 'admin')}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-lime-600 hover:bg-lime-50 dark:hover:bg-lime-900/40 transition cursor-pointer"
                              title="Make Admin"
                            >
                              <ShieldCheck size={16} />
                            </button>
                          ) : (m.role === "admin" || m.role === "ADMIN") && isUserOwner ? (
                            <button
                              onClick={() => handleUpdateRole(memberRecordId, 'member')}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/40 transition cursor-pointer"
                              title="Remove Admin"
                            >
                              <ShieldAlert size={16} />
                            </button>
                          ) : null}

                          <button
                            onClick={() => handleRemove(userId)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                            title="Remove member"
                          >
                            <UserMinus size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom Member Removal Confirmation Pop Modal */}
      {confirmRemoveUserId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-4 text-red-500">
              <Trash2 size={44} className="animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Remove Member?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to remove this participant from the group?
            </p>
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={() => setConfirmRemoveUserId(null)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition text-sm font-semibold cursor-pointer shadow-md active:scale-95"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelInfoDrawer;
