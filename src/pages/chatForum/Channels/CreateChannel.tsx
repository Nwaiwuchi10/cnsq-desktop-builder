"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Api from "@/utils/api";
import CustomModal from "@/component/Message/Message";
import { initChatSocket } from "@/utils/chatSocket";
import { useChatStore } from "@/store/ChatStore";
import {
  ConversationMember,
  ConversationType,
  MemberRole,
} from "@/dataTypes/Data-Types";
import Link from "next/link";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employment?: {
    jobTitle?: string[];
  };
}

const CHANNEL_TYPES = [
  { label: "Public Channel", value: "channel" },
  { label: "Private Channel", value: "private" },
  { label: "Direct Message", value: "dm" },
  { label: "Group DM", value: "group_dm" },
];

export default function CreateChannelForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

  // Step 1: Channel details
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [channelType, setChannelType] = useState("channel");

  // Step 2: Members
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Staff[]>([]);
  const [createdChannelId, setCreatedChannelId] = useState<string | null>(null);

  // Zustand store
  const addConversation = useChatStore.getState().addConversation;
  const updateMembers = useChatStore.getState().updateMembers;

  // Auth token & socket init
  useEffect(() => {
    const t = localStorage.getItem("user-token");
    if (!t) router.push("/login");
    else {
      setToken(t);
      setSocket(initChatSocket());
    }
  }, []);

  // Load staff list when entering step 2
  useEffect(() => {
    if (step === 2 && token) {
      Api.get("/staff-register", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => setStaffs(res.data))
        .catch(() =>
          setModal({ type: "error", message: "Failed to load staff list." })
        );
    }
  }, [step, token]);

  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const toggleMember = (staff: Staff) => {
    setSelectedMembers((prev) =>
      prev.find((s) => s.id === staff.id)
        ? prev.filter((s) => s.id !== staff.id)
        : [...prev, staff]
    );
  };

  // CREATE CHANNEL
  const handleCreateChannel = async () => {
    if (!channelName) {
      setModal({ type: "error", message: "Channel name is required." });
      return;
    }
    if (!token) return;

    setSubmitting(true);

    try {
      const res = await Api.post(
        "/chat/conversations",
        {
          type: channelType,
          name: channelName,
          description,
          slug: channelName.toLowerCase().replace(/\s+/g, "-"),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const id = res.data.id;
      setCreatedChannelId(id);

      // Update Zustand store immediately
      addConversation({
        id,
        name: channelName,
        type: channelType as ConversationType, // ✅ cast to enum
        description,
        isArchived: false,
        members: [],
        createdBy: { token } as any, // populate with logged-in user if available
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setModal({ type: "success", message: "Channel created. Add members." });
      socket?.emit("channel_created", { channelId: id });
      next();
    } catch (err: any) {
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to create channel.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ADD MEMBERS
  const handleAddMembers = async () => {
    if (!createdChannelId || !token) return;
    setSubmitting(true);

    try {
      await Api.post(
        `/chat/conversations/${createdChannelId}/members`,
        { memberIds: selectedMembers.map((s) => s.id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const membersToAdd: any = selectedMembers.map((staff: any) => ({
        id: staff.id.toString(),
        user: staff,
        role: MemberRole.MEMBER,
        notificationsEnabled: true,
        unreadCount: 0,
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        conversation: createdChannelId!,
      }));

      updateMembers(createdChannelId, membersToAdd);

      socket?.emit("channel_members_added", {
        conversationId: createdChannelId,
        members: selectedMembers,
      });

      setModal({ type: "success", message: "Channel created successfully!" });

      setTimeout(() => {
        window.location.reload();
        // router.push(`/chat`);
      }, 1200);
    } catch (err: any) {
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to add members.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffs.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email} ${
      s.employment?.jobTitle?.join(" ") || ""
    }`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="h-full w-full bg-[#FAFAFA] py-4 mb-10">
      {/* HEADER */}
      <div className="max-w-xl mx-auto px-4 mb-8 mt-14 flex items-center justify-between">
        <button
          onClick={step > 1 ? back : () => router.back()}
          className="flex items-center gap-2 text-black hover:opacity-75"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        <h2 className="text-lg md:text-2xl font-semibold text-gray-900">
          {step === 1 ? "Create Channel" : "Add Members"}
        </h2>
        <div className="w-[84px]" />
      </div>

      {/* CARD */}
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6 hover:border-lime-500 transition-shadow transition-colors">
          {/* STEP 1 — CHANNEL DETAILS */}
          {step === 1 && (
            <>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Channel Name *
                </label>
                <input
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="e.g. General, Dev Team"
                  className="w-full border rounded-lg px-3 py-2 hover:border-lime-500 transition-shadow transition-colors"
                />

                <label className="block text-sm font-medium text-gray-700 ">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Channel description..."
                  className="w-full border rounded-lg px-3 py-2 hover:border-lime-500 transition-shadow transition-colors"
                />
              </div>
            </>
          )}

          {/* STEP 2 — ADD MEMBERS */}
          {step === 2 && (
            <>
              <input
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />

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
                  <p className="text-gray-500 text-center py-4">
                    No staff found
                  </p>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
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
            </>
          )}

          {modal && (
            <CustomModal
              type={modal.type}
              message={modal.message}
              onClose={() => setModal(null)}
            />
          )}

          {/* ACTION BUTTON */}
          <div className="mt-4">
            {step === 1 ? (
              <button
                onClick={handleCreateChannel}
                disabled={submitting}
                className="w-full cursor-pointer py-3 rounded-lg bg-[#95D700] text-white font-semibold hover:opacity-90"
              >
                {submitting ? "Creating..." : "Next"}
              </button>
            ) : (
              <button
                onClick={handleAddMembers}
                disabled={submitting}
                className="w-full cursor-pointer py-3 rounded-lg bg-[#95D700] text-white font-semibold hover:opacity-90"
              >
                {submitting ? "Submitting..." : "Create Channel"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
