"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/component/Navbar/Navbar";
import Footer from "@/component/Footer/Footer";
import ConversationList from "./ConversationList";
import ConversationView from "./ConversationView";
import Api from "@/utils/api";

import { Msg } from "./ConversationItems";
import io from "socket.io-client";
import MessagesTabs from "./MessageLayoutSwitchTabs";
import CreateChannelForm from "../Channels/CreateChannel";

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
  createdAt: string; // Backend now provides this field
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
  const [channels, setChannels] = useState([]);
  const [selecteds, setSelecteds] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [staffMatches, setStaffMatches] = useState<Msg[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("all");
  // const [activeTab, setActiveTab] = useState<
  //   "all" | "unread" | "channels" | "create"
  // >("all");

  // const socketRef = useRef<Socket | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // const socketRef = useRef<Socket | null>(null);

  // === Fetch conversations and staff matches ===
  useEffect(() => {
    if (activeTab === "channels") {
      Api.get(`/chat/channels/all/user`, { params: { search } })
        .then((res) => setChannels(res.data))
        .catch((err) => console.error(err));
    }
  }, [activeTab, search]);
  const fetchConversations = async () => {
    const token = localStorage.getItem("user-token");
    try {
      setLoading(true);
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
          createdAt: c.lastMessage?.createdAt || new Date().toISOString(),
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
          createdAt: "",

          time: "",
        }));

      setStaffMatches(staff);
    } catch (err) {
      console.error("Failed fetching conversations:", err);
    } finally {
      setLoading(false); // <--- STOP LOADING
    }
  };

  // === Initialize socket connection ===
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
      query: { token },
    });

    socketRef.current.on("connect", () => console.log("Socket connected"));

    // === 1️⃣ New conversation appears ===
    socketRef.current.on("conversation:new", (conv: any) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conv.id);
        if (exists) return prev;

        const peer = conv.members.find(
          (m: any) => m.user.id !== currentUserId
        )?.user;

        const msg: Msg = {
          id: conv.id,
          name: peer ? `${peer.firstName} ${peer.lastName}` : "Unknown User",
          avatar: peer?.photoUrl || "https://via.placeholder.com/40",
          preview: conv.lastMessage?.text || "",
          text: conv.lastMessage?.text || "",
          me: false,
          createdAt: conv.lastMessage?.createdAt || new Date().toISOString(),
          time: conv.lastMessage?.createdAt
            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          unread: conv.unreadCount ?? 0,
          // unread: 1,
        };

        return [msg, ...prev];
      });
    });

    // === 2️⃣ New message in existing conversation ===
    socketRef.current.on("message:new", (msg: any) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== msg.conversationId) return c;

          const isOpen = selected === msg.conversationId;

          return {
            ...c,
            preview: msg.text,
            text: msg.text,
            // If user has conversation open, unread = 0, else increment
            unread: isOpen ? 0 : (c.unread || 0) + 1,
            createdAt: msg.createdAt || c.createdAt,
            time: msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : c.time,
          };
        })
      );

      if (selected === msg.conversationId) {
        markConversationAsRead(msg.conversationId);
      }
    });

    // === 3️⃣ Backend emits full conversation updates including unread counts ===
    socketRef.current.on(
      "dmConversationsUpdated",
      (data: { conversations: any[] }) => {
        setConversations((prev) => {
          const mapped: Msg[] = data.conversations.map((c) => {
            const peer = c.members.find(
              (m: any) => m.user.id !== currentUserId
            )?.user;

            return {
              id: c.id,
              name: peer
                ? `${peer.firstName} ${peer.lastName}`
                : "Unknown User",
              avatar: peer?.photoUrl || "https://via.placeholder.com/40",
              preview: c.lastMessage?.text || "",
              text: c.lastMessage?.text || "",
              me: false,
              createdAt: c.lastMessage?.createdAt || new Date().toISOString(),
              time: c.lastMessage?.createdAt
                ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
              unread: c.unreadCount || 0, // sync unread count from backend
            };
          });

          return mapped;
        });
      }
    );

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUserId, selected]);

  // useEffect(() => {
  //   const token = localStorage.getItem("user-token");
  //   socketRef.current = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
  //     query: { token },
  //   });

  //   socketRef.current.on("connect", () => console.log("Socket connected"));

  //   // === SOCKET EVENT: new conversation appears ===
  //   socketRef.current.on("conversation:new", (conv: any) => {
  //     setConversations((prev) => {
  //       const exists = prev.some((c) => c.id === conv.id);
  //       if (exists) return prev;

  //       const peer = conv.members.find((m: any) => m.id !== currentUserId);

  //       const msg: Msg = {
  //         id: conv.id,
  //         name: `${peer.firstName} ${peer.lastName}`,
  //         avatar: peer.avatar,
  //         preview: conv.lastMessage?.text || "",
  //         text: conv.lastMessage?.text || "",
  //         me: false,
  //         createdAt: conv.createdAt,
  //         time: conv.lastMessage?.createdAt
  //           ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
  //               hour: "2-digit",
  //               minute: "2-digit",
  //             })
  //           : "",
  //         unread: 1,
  //       };

  //       return [msg, ...prev];
  //     });
  //   });
  //   socketRef.current.on("message:new", (msg: any) => {
  //     setConversations((prev) =>
  //       prev.map((c) => {
  //         if (c.id !== msg.conversationId) return c;

  //         const isOpen = selected === msg.conversationId;

  //         return {
  //           ...c,
  //           preview: msg.text,
  //           unread: isOpen ? 0 : (c.unread || 0) + 1,
  //         };
  //       })
  //     );

  //     if (selected === msg.conversationId) {
  //       markConversationAsRead(msg.conversationId);
  //     }
  //   });
  //   socketRef.current.on(
  //     "chat:unreadCount",
  //     ({
  //       total,
  //       conversationId,
  //     }: {
  //       total: number;
  //       conversationId: number;
  //     }) => {
  //       const convId = conversationId.toString(); // convert to string
  //       setConversations((prev) =>
  //         prev.map((c) => (c.id === convId ? { ...c, unread: total } : c))
  //       );
  //     }
  //   );

  //   return () => {
  //     socketRef.current?.disconnect();
  //   };
  // }, []);

  // === Fetch on mount and when search changes ===
  useEffect(() => {
    const t = setTimeout(() => fetchConversations(), 300);
    return () => clearTimeout(t);
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
        socketRef.current?.emit("joinConversation", id);
        await markConversationAsRead(id);
      } catch (err) {
        console.error("Failed to start DM:", err);
      }
    } else {
      setSelected(id);
      await markConversationAsRead(id);
    }
  };
  const filteredConversations = conversations.filter((c: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return c.unread > 0;
    if (activeTab === "channels") return c.isChannel === true; // optional
    return true;
  });

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#FAFAFA] text-gray-600 p-0 pt-20 md:p-8 md:pt-32">
        <div
          className="mx-auto
    max-w-full  
    sm:max-w-full
    md:max-w-5xl
    lg:max-w-6xl"
        >
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
                <div className="hidden md:block col-span-1">
                  <MessagesTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />
                </div>
                {loading ? (
                  <div className="space-y-4">Loading....</div>
                ) : (
                  <ConversationList
                    // items={conversations}
                    items={filteredConversations}
                    onSelect={handleSelect}
                  />
                )}
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

            {/* <div className="col-span-3 md:col-span-2 bg-white rounded-lg h-[80vh] overflow-hidden shadow-sm">
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
            </div> */}
            <div
              className={`col-span-3 md:col-span-2 bg-white rounded-lg overflow-hidden shadow-sm
    ${activeTab === "create" ? "h-auto" : "h-[80vh]"}`}
            >
              {activeTab === "create" ? (
                <CreateChannelForm /> // Show channel creation UI
              ) : selected ? (
                <ConversationView
                  conversation={
                    filteredConversations.find((c) => c.id === selected) || null
                  }
                  onBack={() => setSelected(null)}
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
            {activeTab === "create" ? (
              <CreateChannelForm /> // Show channel creation UI
            ) : (
              !selected && (
                <div className="p-8">
                  <h1 className="text-2xl font-semibold text-gray-700">
                    Your Messages
                  </h1>
                  <p className="text-sm text-gray-500 mt-1 mb-4">
                    Tap to open a conversation.
                  </p>
                  <div>
                    <MessagesTabs
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                    />
                  </div>
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
              )
            )}

            {selected && (
              <div
                className="bg-white h-[90vh] w-[100vw] fixed top-0 left-0 z-50 md:static md:h-[80vh] md:w-full md:rounded-lg overflow-hidden shadow-sm"
                //           className="bg-white rounded-lg h-[80vh] overflow-hidden shadow-sm
                // w-full"
              >
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
