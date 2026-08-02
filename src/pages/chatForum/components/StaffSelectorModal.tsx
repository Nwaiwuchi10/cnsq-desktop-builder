"use client";

import React, { useState, useEffect } from "react";
import { Search, X, User, UserCheck } from "lucide-react";
import Api from "@/utils/api";

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

interface StaffSelectorModalProps {
  currentUserId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectStaff: (staffId: number) => void;
}

export const StaffSelectorModal: React.FC<StaffSelectorModalProps> = ({
  currentUserId,
  isOpen,
  onClose,
  onSelectStaff,
}) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("user-token");
      setLoading(true);
      Api.get("/staff-register", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : res.data.staffMatches || [];
          setStaffList(list);
        })
        .catch(() => {
          // Fallback to DM endpoint
          Api.get("/chat/dms/all/user", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => setStaffList(res.data.staffMatches || []))
            .catch((err) => console.error("Failed to load staff list:", err));
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStaff = staffList.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              New Message / Chat Staff
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select a staff member or chat with yourself
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search staff name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-lime-500"
            />
          </div>
        </div>

        {/* Option to Chat Yourself (WhatsApp Style) */}
        {currentUserId && (
          <div className="px-3 pt-2">
            <button
              onClick={() => {
                onSelectStaff(currentUserId);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-900/60 hover:bg-lime-100 dark:hover:bg-lime-900/50 transition text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-lime-500 flex items-center justify-center text-black font-bold text-sm shadow-sm">
                <UserCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-lime-800 dark:text-lime-300">
                  Message Yourself (You)
                </p>
                <p className="text-[11px] text-lime-600 dark:text-lime-400">
                  Save notes, reminders, or draft messages
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Staff List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-6">
              Loading staff...
            </p>
          ) : filteredStaff.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">
              No staff members found.
            </p>
          ) : (
            filteredStaff.map((staff) => (
              <button
                key={staff.id}
                onClick={() => {
                  onSelectStaff(staff.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition text-left group"
              >
                {staff.photoUrl ? (
                  <img
                    src={staff.photoUrl}
                    alt={staff.firstName}
                    className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {staff.firstName?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition">
                    {staff.firstName} {staff.lastName}
                  </p>
                  <p className="text-xs text-gray-400">Click to start direct message</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffSelectorModal;
