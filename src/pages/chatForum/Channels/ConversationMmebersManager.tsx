import React, { useEffect, useState } from "react";
import Api from "@/utils/api";
import { useChatStore } from "@/store/ChatStore";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import CustomModal from "@/component/Message/Message";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  conversationId?: string;
  mode: "add" | "view" | "remove" | null;
  onClose: () => void;
}

export default function ConversationMembersManager({
  conversationId,
  mode,
  onClose,
}: Props) {
  const [currentMode, setCurrentMode] = useState<"add" | "view" | "remove" | null>(mode);
  const [members, setMembers] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const onlineStaffs = useChatStore((s) => s.onlineStaffs);

  useEffect(() => {
    setCurrentMode(mode);
    setModal(null);
  }, [mode]);

  // Load existing conversation members
  const loadMembers = async () => {
    if (!conversationId) return;
    const token = localStorage.getItem("user-token");
    try {
      const res = await Api.get(`/chat/channels/${conversationId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to load members", err);
    }
  };

  // Load all staff for adding members
  const loadStaff = async () => {
    try {
      const res = await Api.get(`/staff-register`);
      setStaffs(res.data);
    } catch (err) {
      console.error("Failed to load staff list");
    }
  };

  // Load relevant data per mode
  useEffect(() => {
    if (currentMode === "view" || currentMode === "remove") loadMembers();
    if (currentMode === "add") loadStaff();
  }, [currentMode, conversationId]);

  // Toggle checkbox
  const toggleMember = (staff: Staff) => {
    setSelectedMembers((prev) =>
      prev.find((m) => m.id === staff.id)
        ? prev.filter((m) => m.id !== staff.id)
        : [...prev, staff]
    );
  };

  // ADD MEMBERS
  const addMembers = async () => {
    if (selectedMembers.length === 0) return;

    setLoading(true);
    const token = localStorage.getItem("user-token");
    try {
      const count = selectedMembers.length;
      await Api.post(
        `/chat/channels/${conversationId}/members`,
        {
          memberIds: selectedMembers.map((m) => m.id),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedMembers([]);
      setModal({
        type: "success",
        message: `Successfully added ${count} member(s) to the channel!`,
      });
      await loadMembers();
      setCurrentMode("view");
    } catch (err: any) {
      console.error("Failed to add member", err);
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to add member to channel",
      });
    } finally {
      setLoading(false);
    }
  };

  // REMOVE
  const removeMember = async (id: number) => {
    const token = localStorage.getItem("user-token");
    try {
      await Api.delete(`/chat/channels/${conversationId}/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({
        type: "success",
        message: "Member removed from channel.",
      });
      loadMembers();
    } catch (err: any) {
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to remove member",
      });
    }
  };

  // Filter search list
  const filteredStaff = staffs.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[#FAFAFA]/40 dark:bg-[#0d0d0d]/60 backdrop-blur-sm transition-colors flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#141414] transition-colors p-6 rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-xl capitalize">{currentMode} Member</h2>
            {currentMode !== mode && (
              <button
                onClick={() => {
                  setCurrentMode("add");
                  setModal(null);
                }}
                className="text-xs text-[#95D700] hover:underline font-semibold"
              >
                + Add More
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* --- ADD MEMBERS MODE --- */}
        {currentMode === "add" && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border dark:border-gray-700 bg-transparent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#95D700]"
            />

            {/* Staff List */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Select Staff
              </h3>
              <div className="max-h-48 overflow-y-auto border dark:border-gray-800 rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50 transition-colors">
                {filteredStaff.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 py-2 px-1 border-b dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/80 rounded transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.some((m) => m.id === s.id)}
                      onChange={() => toggleMember(s)}
                      className="accent-[#95D700] w-4 h-4 rounded"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {s.firstName} {s.lastName}
                        </p>
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${onlineStaffs[s.id] ? "bg-green-500" : "bg-gray-400"
                            }`}
                        ></span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {s.email}
                      </p>
                    </div>
                  </label>
                ))}

                {filteredStaff.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                    No staff found
                  </p>
                )}
              </div>
            </div>

            {/* Selected members preview */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Selected Members ({selectedMembers.length})
              </h3>

              {selectedMembers.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-500 text-xs italic">
                  None selected.
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto border dark:border-gray-800 rounded-lg p-2 bg-gray-50 dark:bg-gray-800/30">
                  <ul className="space-y-1.5">
                    {selectedMembers.map((s) => (
                      <li
                        key={s.id}
                        className="border dark:border-gray-800 p-2 rounded-lg bg-white dark:bg-[#181818] transition-colors flex justify-between items-center text-sm"
                      >
                        <span className="truncate pr-2 text-gray-800 dark:text-gray-200">
                          {s.firstName} {s.lastName} <span className="text-xs text-gray-400">({s.email})</span>
                        </span>
                        <button
                          className="text-red-500 hover:text-red-600 font-medium text-xs flex-shrink-0"
                          onClick={() => toggleMember(s)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={addMembers}
              disabled={loading || selectedMembers.length === 0}
              className="w-full cursor-pointer py-3 rounded-lg bg-[#95D700] text-white font-semibold hover:opacity-90 transition disabled:opacity-50 mt-2"
            >
              {loading ? "Adding..." : `Add ${selectedMembers.length > 0 ? `${selectedMembers.length} ` : ""}Members`}
            </button>
          </div>
        )}

        {/* --- VIEW MEMBERS MODE --- */}
        {currentMode === "view" && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[60vh]">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 border rounded dark:border-gray-800"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${m.user && onlineStaffs[m.user.id] ? "bg-green-500" : "bg-gray-400"
                      }`}
                  ></span>
                  <span className="truncate font-medium text-sm text-gray-900 dark:text-gray-100">
                    {m.user ? `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim() || m.user.email : "Unknown Member"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider flex-shrink-0 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {m.role || "Member"}
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">No members found</p>
            )}
          </div>
        )}

        {/* --- REMOVE MEMBERS MODE --- */}
        {currentMode === "remove" && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[60vh]">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 border rounded dark:border-gray-800"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${m.user && onlineStaffs[m.user.id] ? "bg-green-500" : "bg-gray-400"
                      }`}
                  ></span>
                  <span className="truncate font-medium text-sm text-gray-900 dark:text-gray-100">
                    {m.user ? `${m.user.firstName || ""} ${m.user.lastName || ""}`.trim() || m.user.email : "Unknown Member"}
                  </span>
                </div>
                <button
                  className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition flex-shrink-0 font-medium"
                  onClick={() => removeMember(m.user?.id || m.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors rounded text-sm font-medium flex-shrink-0 mt-2"
        >
          Close
        </button>
      </div>

      {modal && (
        <CustomModal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
