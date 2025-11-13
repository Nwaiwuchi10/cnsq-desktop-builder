"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/component/Navbar/Navbar";
import Footer from "@/component/Footer/Footer";
import ConversationList from "./ConversationList";
import ConversationView from "./ConversationView";
import Api from "@/utils/api";
import { io, Socket } from "socket.io-client";
import { Msg } from "./ConversationItems";

interface Member {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string | null;
  };
}

interface LastMessage {
  text: string;
  createdAt: string; // Backend now provides this
}

interface ConversationResponse {
  id: string;
  members: Member[];
  lastMessage?: LastMessage;
  unreadCount: number;
}
interface StaffResponse {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

interface DMResponse {
  currentUserId: number;
  conversations: ConversationResponse[];
  staffMatches: StaffResponse[];
}

const MessagesLayout: React.FC = () => {
  const [conversations, setConversations] = useState<Msg[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [staffMatches, setStaffMatches] = useState<Msg[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // === Fetch conversations and staff matches ===
  const fetchConversations = async () => {
    const token = localStorage.getItem("user-token");
    try {
      const res = await Api.get<DMResponse>("/chat/dms/all/user", {
        params: { search: search || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentUserId(res.data.currentUserId);

      const convs: Msg[] = res.data.conversations.map((c) => {
        const peer =
          c.members.find((m) => m.user.id !== res.data.currentUserId)?.user ||
          null;

        const name = peer
          ? `${peer.firstName} ${peer.lastName}`
          : "Unknown User";

        const avatar =
          peer?.photoUrl && peer.photoUrl.trim() !== ""
            ? peer.photoUrl
            : "https://via.placeholder.com/40";

        return {
          id: c.id,
          name,
          avatar,
          preview: c.lastMessage?.text || "",
          text: c.lastMessage?.text || "", // <-- add text
          me: false, // <-- add me
          time: c.lastMessage?.createdAt
            ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          unread: c.unreadCount,
        };
      });

      setConversations(convs);

      const staff: Msg[] = res.data.staffMatches
        .filter(
          (s) =>
            !convs.some((c) =>
              (c.name ?? "").includes(`${s.firstName} ${s.lastName}`)
            )
        )
        .map((s) => ({
          id: `staff-${s.id}`,
          name: `${s.firstName} ${s.lastName}`,
          avatar: s.photoUrl || "https://via.placeholder.com/40",
          preview: "",
          text: "", // <-- add text
          me: false, // <-- add me
          time: "",
        }));

      setStaffMatches(staff);
    } catch (err) {
      console.error("Failed fetching conversations:", err);
    }
  };

  // === Initialize socket connection ===
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
      query: { token },
    });

    socketRef.current.on("connect", () => console.log("Socket connected"));

    socketRef.current.on("message:new", (msg: any) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, preview: msg.text, unread: (c.unread || 0) + 1 }
            : c
        )
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // === Fetch on mount and when search changes ===
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 1000);
    return () => clearInterval(interval);
  }, [search]);
  ////hanle  mark conversation as read
  // Inside MessagesLayout component
  const markConversationAsRead = async (conversationId: string) => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    try {
      await Api.patch(
        `/chat/mark-read/${conversationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local unread count in conversations state
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))
      );
    } catch (err) {
      console.error("Failed to mark conversation as read:", err);
    }
  };

  // === Handle select (conversation or staff) ===
  const handleSelect = async (id: string) => {
    const token = localStorage.getItem("user-token");

    if (id.startsWith("staff-")) {
      const targetId = parseInt(id.replace("staff-", ""));
      try {
        const res = await Api.post(
          "/chat/conversations/dm",
          { targetUserId: targetId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const conv = res.data;
        const otherMember = conv.members.find(
          (m: any) => m.user.id !== currentUserId
        );

        setConversations((prev: any) => {
          if (!prev.some((c: any) => c.id === conv.id)) {
            return [
              ...prev,
              {
                id: conv.id,
                name: `${otherMember.user.firstName} ${otherMember.user.lastName}`,
                avatar: otherMember.user.photoUrl,
                preview: "",
                unread: 0,
              },
            ];
          }
          return prev;
        });

        setSelected(conv.id);
        setStaffMatches([]); // clear search results
        await markConversationAsRead(id);
      } catch (err) {
        console.error("Failed to start DM:", err);
      }
    } else {
      setSelected(id);
      await markConversationAsRead(id);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#FAFAFA] text-gray-600 p-8 pt-32">
        <div className="max-w-6xl mx-auto">
          {/* Desktop layout */}
          <div className="hidden md:grid grid-cols-3 gap-8">
            <div className="col-span-1">
              <h1 className="text-3xl font-semibold text-gray-700">
                Your Messages
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Manage your conversations and connect with fellow members.
              </p>

              <div className="mt-6">
                <input
                  className="placeholder-gray-400 block w-full rounded-lg border border-gray-200 bg-white p-3 shadow-inner mb-4 hover:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
                  placeholder="Search all staff and conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex gap-3 mt-6 mb-4">
                  <button className="px-4 py-1 rounded-full bg-lime-500 text-white text-sm">
                    All
                  </button>
                  <button className="px-4 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
                    Unread
                  </button>
                  <button className="px-4 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
                    Archived
                  </button>
                  <button className="px-4 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
                    Channels
                  </button>
                </div>
                <ConversationList
                  items={conversations}
                  onSelect={handleSelect}
                />

                {staffMatches.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-gray-500 text-sm mb-2">
                      Search Results
                    </h2>
                    <ConversationList
                      items={staffMatches}
                      onSelect={handleSelect}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 bg-white rounded-lg h-[80vh] overflow-hidden shadow-sm">
              {selected ? (
                <ConversationView
                  conversation={
                    conversations.find((c) => c.id === selected) || null
                  }
                  onBack={() => setSelected(null)}
                  //   id={selected}
                  //   onBack={() => setSelected(null)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                  <p>Select a conversation to start chatting 💬</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile layout */}
          <div className="block md:hidden">
            {!selected && (
              <div>
                <h1 className="text-2xl font-semibold text-gray-700">
                  Your Messages
                </h1>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Tap to open a conversation.
                </p>
                <input
                  className="placeholder-gray-400 block w-full rounded-lg border border-gray-200 bg-white p-3 shadow-inner mb-4 hover:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
                  placeholder="Search all staff and conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <ConversationList
                  items={conversations}
                  onSelect={handleSelect}
                />
                {staffMatches.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-gray-500 text-sm mb-2">
                      Search Results
                    </h2>
                    <ConversationList
                      items={staffMatches}
                      onSelect={handleSelect}
                    />
                  </div>
                )}
              </div>
            )}

            {selected && (
              <div className="bg-white rounded-lg h-[80vh] overflow-hidden shadow-sm">
                <ConversationView
                  conversation={
                    conversations.find((c) => c.id === selected) || null
                  }
                  onBack={() => setSelected(null)}
                  //   id={selected}
                  //   onBack={() => setSelected(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default MessagesLayout;
