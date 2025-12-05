"use client";

import React, { useEffect, useState } from "react";
import Api from "@/utils/api";

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
  const [members, setMembers] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);

  // Load existing conversation members
  const loadMembers = async () => {
    const token = localStorage.getItem("user-token");
    const res = await Api.get(`/chat/channels/${conversationId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMembers(res.data);
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
    if (mode === "view" || mode === "remove") loadMembers();
    if (mode === "add") loadStaff();
  }, [mode]);

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
      await Api.post(
        `/chat/conversations/${conversationId}/members`,
        {
          memberIds: selectedMembers.map((m) => m.id),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onClose();
    } catch (err) {
      console.error("Failed to add member", err);
    } finally {
      setLoading(false);
    }
  };

  // REMOVE
  const removeMember = async (id: number) => {
    const token = localStorage.getItem("user-token");
    await Api.delete(`/chat/channels/${conversationId}/members/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadMembers();
  };

  // Filter search list
  const filteredStaff = staffs.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[#FAFAFA] bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-xl capitalize">{mode} Member</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            ✕
          </button>
        </div>

        {/* --- ADD MEMBERS MODE --- */}
        {mode === "add" && (
          <>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />

            {/* Staff List */}
            <div className="max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50 mt-2">
              {filteredStaff.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 py-2 border-b last:border-0 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.some((m) => m.id === s.id)}
                    onChange={() => toggleMember(s)}
                  />

                  <div>
                    <p className="font-medium">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{s.email}</p>
                  </div>
                </label>
              ))}

              {filteredStaff.length === 0 && (
                <p className="text-gray-500 text-center py-4">No staff found</p>
              )}
            </div>

            {/* Selected members preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-2">
                Selected Members
              </h3>

              {selectedMembers.length === 0 ? (
                <p className="text-gray-500 text-sm">None selected.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedMembers.map((s) => (
                    <li
                      key={s.id}
                      className="border p-2 rounded-lg bg-white flex justify-between"
                    >
                      <span>
                        {s.firstName} {s.lastName} ({s.email})
                      </span>
                      <button
                        className="text-red-500"
                        onClick={() => toggleMember(s)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={addMembers}
              disabled={loading}
              className="w-full cursor-pointer py-3 rounded-lg bg-[#95D700] text-white font-semibold hover:opacity-90 mt-4"
            >
              {loading ? "Adding..." : "Add Members"}
            </button>
          </>
        )}

        {/* --- VIEW MEMBERS MODE --- */}
        {mode === "view" && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  {m.user.firstName} {m.user.lastName}
                </div>
                <div className="text-sm text-gray-500">{m.role}</div>
              </div>
            ))}
          </div>
        )}

        {/* --- REMOVE MEMBERS MODE --- */}
        {mode === "remove" && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  {m.user.firstName} {m.user.lastName}
                </div>
                <button
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                  onClick={() => removeMember(m.user.id)}
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
          className="w-full py-2 bg-gray-200 rounded mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
}
