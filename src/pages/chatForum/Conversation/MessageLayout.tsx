"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/component/Navbar/Navbar";
import Footer from "@/component/Footer/Footer";
import ConversationList from "./ConversationList";

import ConversationView from "./ConversationView";
import CreateChannelForm from "../Channels/CreateChannel";
import MessagesTabs from "./MessageLayoutSwitchTabs";
import Api from "@/utils/api";
import { Msg } from "./ConversationItems";
import io from "socket.io-client";
import ChannelConversationList from "../Channels/ConversationList";
import ChannelConversationView from "../Channels/ChannelConverationView";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import { useChatStore } from "@/store/ChatStore";
import StaffSelectorModal from "../components/StaffSelectorModal";

import { PanelLeftClose, PanelLeftOpen, MessageSquare, Users, Plus } from "lucide-react";

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
  createdAt: string;
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
  const [channels, setChannels] = useState<Msg[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [staffMatches, setStaffMatches] = useState<Msg[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const onlineStaffs = useChatStore((s) => s.onlineStaffs);

  // Fetch DMs
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
        return {
          id: c.id,
          name: peer ? `${peer.firstName} ${peer.lastName}` : "Unknown User",
          avatar: peer?.photoUrl || "https://via.placeholder.com/40",
          preview: c.lastMessage?.text || "",
          text: c.lastMessage?.text || "",
          me: false,
          createdAt: c.lastMessage?.createdAt || new Date().toISOString(),
          peerId: peer?.id,
          time: c.lastMessage?.createdAt
            ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "",
          unread: c.unreadCount,
          isChannel: false,
          online: peer ? (onlineStaffs[peer.id] ?? false) : false,
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
          text: "",
          me: false,
          createdAt: "",
          time: "",
          peerId: s.id,
          online: onlineStaffs[s.id] ?? false,
        }));

      setStaffMatches(staff);
    } catch (err) {
      console.error("Failed fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const [isStaffSelectorOpen, setIsStaffSelectorOpen] = useState(false);

  // Fetch channels on mount & search change
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    Api.get(`/chat/channels/all/user`, {
      params: { search },
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const mapped: Msg[] = res.data.map((c: any) => ({
          id: c.id,
          name: `# ${c.name}`,
          avatar: "",
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
          unread: c.unreadCount ?? 0,
          isChannel: true,
        }));
        setChannels(mapped);
      })
      .catch((err) => console.error(err));
  }, [search]);

  // Fetch DMs on mount & search change
  useEffect(() => {
    if (activeTab === "all") {
      const t = setTimeout(() => fetchConversations(), 300);
      return () => clearTimeout(t);
    }
  }, [search, activeTab]);

  // Socket connection
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
      query: { token },
    });

    socketRef.current.on("connect", () => console.log("Socket connected"));

    socketRef.current.on("conversation:new", (conv: any) => {
      setConversations((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
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
          peerId: peer?.id,
          time: conv.lastMessage?.createdAt
            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "",
          unread: conv.unreadCount ?? 0,
          online: peer ? (onlineStaffs[peer.id] ?? false) : false,
        };
        return [msg, ...prev];
      });
    });

    // Real-time channel creation: instantly show new channel in the channels tab
    socketRef.current.on("channel:new", (conv: any) => {
      setChannels((prev: any[]) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
        const newChannel: Msg = {
          id: conv.id,
          name: conv.name || "Unnamed Channel",
          avatar: "",
          preview: "",
          text: "",
          me: false,
          createdAt: conv.createdAt || new Date().toISOString(),
          time: "",
          unread: conv.unreadCount ?? 0,
          online: false,
          isChannel: true,
        };
        return [newChannel, ...prev];
      });
    });

    // Real-time: staff added to a channel → refresh channel list
    socketRef.current.on("conversation:addedToConversation", () => {
      // Re-fetch channels to get the newly joined channel
      const token = localStorage.getItem("user-token");
      if (!token) return;
      Api.get(`/chat/channels/all/user`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (res.data) setChannels(res.data);
      }).catch(() => {});
    });

    const playNotificationChime = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc2.frequency.setValueAtTime(880.00, ctx.currentTime);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      } catch (e) {
        console.error("Audio chime error:", e);
      }
    };

    socketRef.current.on("message:new", (msg: any) => {
      if (msg.authorId !== currentUserId && msg.author?.id !== currentUserId) {
        playNotificationChime();
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== msg.conversationId) return c;
          const isOpen = selected === msg.conversationId;
          return {
            ...c,
            preview: msg.text,
            text: msg.text,
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

      if (selected === msg.conversationId)
        markConversationAsRead(msg.conversationId);
    });

    socketRef.current.on("message:channelnew", (msg: any) => {
      if (msg.authorId !== currentUserId && msg.author?.id !== currentUserId) {
        playNotificationChime();
      }

      setChannels((prev) =>
        prev.map((c) => {
          if (c.id !== msg.conversationId) return c;
          const isOpen = selected === msg.conversationId;
          return {
            ...c,
            preview: msg.text,
            text: msg.text,
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

    socketRef.current.on("thread:reply_new", (msg: any) => {
      if (msg.authorId !== currentUserId && msg.author?.id !== currentUserId) {
        playNotificationChime();
      }

      const updateConv = (c: any) => {
        if (c.id !== msg.conversationId) return c;
        const isOpen = selected === msg.conversationId;
        return {
          ...c,
          preview: msg.text || "Thread reply",
          unread: isOpen ? 0 : (c.unread || 0) + 1,
          createdAt: msg.createdAt || c.createdAt,
          time: msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : c.time,
        };
      };

      setConversations((prev) => prev.map(updateConv));
      setChannels((prev) => prev.map(updateConv));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUserId, selected]);

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    const token = localStorage.getItem("user-token");
    if (!token) return;
    try {
      await Api.patch(
        `/chat/mark-read/${conversationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))
      );
      setChannels((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))
      );
    } catch (err) {
      console.error("Failed to mark conversation as read:", err);
    }
  };

  // Handle select
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
        const peerUser =
          conv.members.find((m: any) => m.user?.id !== currentUserId)?.user ||
          conv.members[0]?.user;
        const isSelf = targetId === currentUserId;

        const newConvItem = {
          id: conv.id,
          name: isSelf
            ? `${peerUser?.firstName || "You"} ${peerUser?.lastName || ""} (You)`
            : `${peerUser?.firstName || ""} ${peerUser?.lastName || ""}`.trim() || "Direct Message",
          avatar: peerUser?.photoUrl || null,
          peerId: peerUser?.id,
          preview: "",
          unread: 0,
        };

        setConversations((prev: any) => {
          if (!prev.some((c: any) => c.id === conv.id)) {
            return [newConvItem, ...prev];
          }
          return prev;
        });

        setSelected(conv.id);
        setStaffMatches([]);
        socketRef.current?.emit("joinConversation", conv.id);
      } catch (err) {
        console.error("Failed to start DM:", err);
      }
    } else {
      setSelected(id);
    }
  };

  // Tab filters
  const allConversationsList = [...conversations, ...channels].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  const sortedChannels = [...channels].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  const unreadConversationsList = allConversationsList.filter(
    (c: any) => (c.unread || 0) > 0
  );

  const mentionsConversationsList = allConversationsList.filter(
    (c: any) =>
      c.text?.includes("@") ||
      c.preview?.includes("@") ||
      c.isMentioned
  );

  const dmsUnread = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);
  const channelsUnread = channels.reduce((acc, c) => acc + (c.unread || 0), 0);
  const totalUnread = dmsUnread + channelsUnread;

  useEffect(() => {
    if (typeof navigator !== "undefined" && "setAppBadge" in navigator) {
      if (totalUnread > 0) {
        navigator.setAppBadge(totalUnread).catch((err) => {
          console.error("Failed to set app badge:", err);
        });
      } else {
        navigator.clearAppBadge().catch((err) => {
          console.error("Failed to clear app badge:", err);
        });
      }
    }
  }, [totalUnread]);

  const unreadCounts = {
    all: totalUnread,
    dms: dmsUnread,
    channels: channelsUnread,
    mentions: 0,
    unread: totalUnread,
  };

  return (
    <StaffLayout>
      <StaffSelectorModal
        currentUserId={currentUserId}
        isOpen={isStaffSelectorOpen}
        onClose={() => setIsStaffSelectorOpen(false)}
        onSelectStaff={(staffId) => handleSelect(`staff-${staffId}`)}
      />

      <div className="absolute inset-0 bg-[#FAFAFA] dark:bg-[#0d0d0d] transition-colors text-gray-600 dark:text-gray-400 flex flex-col overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 h-full w-full overflow-hidden transition-all duration-300">
          {/* Left Sidebar */}
          <div
            className={`transition-all duration-300 flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#141414] border-r border-gray-200 dark:border-gray-800 ${
              isSidebarCollapsed ? "w-16" : "w-80 lg:w-[340px]"
            }`}
          >
            {isSidebarCollapsed ? (
              /* Collapsed Mini Sidebar */
              <div className="flex flex-col items-center p-3 gap-4 h-full">
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  title="Expand Messages Sidebar"
                  className="p-2.5 rounded-xl bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-400 hover:bg-lime-200 dark:hover:bg-lime-900/60 transition shadow-sm"
                >
                  <PanelLeftOpen size={20} />
                </button>

                <div className="w-full border-t border-gray-200 dark:border-gray-800 my-1"></div>

                <button
                  onClick={() => {
                    setIsStaffSelectorOpen(true);
                  }}
                  title="New Chat / Staff List"
                  className="p-2.5 rounded-lg transition text-lime-600 bg-lime-50 dark:bg-lime-950/40 hover:bg-lime-100"
                >
                  <Plus size={18} />
                </button>

                <button
                  onClick={() => {
                    setActiveTab("all");
                    setIsSidebarCollapsed(false);
                  }}
                  title="All Messages"
                  className={`p-2.5 rounded-lg transition ${
                    activeTab === "all"
                      ? "bg-[#95D700] text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <MessageSquare size={18} />
                </button>

                <button
                  onClick={() => {
                    setActiveTab("channels");
                    setIsSidebarCollapsed(false);
                  }}
                  title="Channels"
                  className={`p-2.5 rounded-lg transition ${
                    activeTab === "channels"
                      ? "bg-[#95D700] text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Users size={18} />
                </button>
              </div>
            ) : (
              /* Expanded Sidebar */
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Your Messages
                      </h1>
                      <button
                        onClick={() => setIsStaffSelectorOpen(true)}
                        title="New Chat / Chat Yourself (+)"
                        className="p-1.5 rounded-xl bg-lime-500 hover:bg-lime-600 text-black shadow-md transition transform hover:scale-105"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button
                      onClick={() => setIsSidebarCollapsed(true)}
                      title="Collapse sidebar"
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition"
                    >
                      <PanelLeftClose size={20} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Connect, message staff, or chat with yourself.
                  </p>

                  <input
                    className="placeholder-gray-400 dark:placeholder-gray-500 block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] transition-colors text-gray-900 dark:text-gray-100 p-2.5 text-sm shadow-inner mt-4 mb-3 hover:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
                    placeholder="Search staff and conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <MessagesTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    unreadCounts={unreadCounts}
                  />
                </div>

                {/* Scrollable Conversation List */}
                <div className="flex-1 overflow-y-auto p-4 pt-2">
                  {loading ? (
                    <div className="space-y-4 text-center py-6 text-sm text-gray-400">Loading messages...</div>
                  ) : activeTab === "channels" ? (
                    <ChannelConversationList
                      items={sortedChannels}
                      onSelect={handleSelect}
                    />
                  ) : activeTab === "dms" ? (
                    <ConversationList
                      items={sortedConversations.map((c: any) => ({
                        ...c,
                        online: c.peerId ? (onlineStaffs[c.peerId] ?? false) : c.online
                      }))}
                      onSelect={handleSelect}
                    />
                  ) : activeTab === "mentions" ? (
                    <ConversationList
                      items={mentionsConversationsList.map((c: any) => ({
                        ...c,
                        online: c.peerId ? (onlineStaffs[c.peerId] ?? false) : c.online
                      }))}
                      onSelect={handleSelect}
                    />
                  ) : activeTab === "unread" ? (
                    <ConversationList
                      items={unreadConversationsList.map((c: any) => ({
                        ...c,
                        online: c.peerId ? (onlineStaffs[c.peerId] ?? false) : c.online
                      }))}
                      onSelect={handleSelect}
                    />
                  ) : (
                    /* "all" Tab: DM & Channels combined */
                    <ConversationList
                      items={allConversationsList.map((c: any) => ({
                        ...c,
                        online: c.peerId ? (onlineStaffs[c.peerId] ?? false) : c.online
                      }))}
                      onSelect={handleSelect}
                    />
                  )}

                  {staffMatches.length > 0 && (
                    <div className="mt-6">
                      <h2 className="text-gray-500 dark:text-gray-400 text-xs font-semibold mb-2 uppercase">
                        Staff Matches
                      </h2>
                      <ConversationList
                        items={staffMatches.map((c: any) => ({
                          ...c,
                          online: c.peerId ? (onlineStaffs[c.peerId] ?? false) : c.online
                        }))}
                        onSelect={handleSelect}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat Conversation View Container */}
          <div
            className="flex-1 min-w-0 bg-white dark:bg-[#141414] overflow-hidden relative h-full flex flex-col"
          >
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                title="Expand Messages Sidebar"
                className="absolute top-3 left-3 z-30 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition shadow-sm flex items-center gap-1.5 text-xs font-semibold"
              >
                <PanelLeftOpen size={16} />
                <span>Messages</span>
              </button>
            )}

            {activeTab === "create" ? (
              <CreateChannelForm onClose={() => setActiveTab("all")} />
            ) : selected ? (
              (() => {
                const conv: any =
                  activeTab === "channels"
                    ? channels.find((c: any) => c.id === selected) || null
                    : allConversationsList.find((c) => c.id === selected) ||
                    null;

                if (!conv) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400">
                      <p>Conversation not found</p>
                    </div>
                  );
                }

                return conv.isChannel ? (
                  <ChannelConversationView
                    conversation={conv}
                    onBack={() => setSelected(null)}
                    onRead={markConversationAsRead}
                  />
                ) : (
                  <ConversationView
                    conversation={conv}
                    onBack={() => setSelected(null)}
                    onRead={markConversationAsRead}
                  />
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400">
                <p>Select a conversation to start chatting 💬</p>
              </div>
            )}
          </div>
        </div>

          {/* Mobile */}
          <div className="block md:hidden h-full overflow-hidden">
            {activeTab === "create" ? (
              <CreateChannelForm onClose={() => setActiveTab("all")} />
            ) : (
              !selected && (
                <div className="flex flex-col h-full overflow-hidden p-4 sm:p-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          Your Messages
                        </h1>
                        <button
                          onClick={() => setIsStaffSelectorOpen(true)}
                          title="New Chat / Chat Yourself (+)"
                          className="p-1.5 rounded-xl bg-lime-500 hover:bg-lime-600 text-black shadow-md transition transform hover:scale-105 cursor-pointer"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                      Connect, message staff, or chat with yourself.
                    </p>
                    <MessagesTabs
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      unreadCounts={unreadCounts}
                    />

                    <input
                      className="placeholder-gray-400 dark:placeholder-gray-500 block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] transition-colors text-gray-900 dark:text-gray-100 p-3 shadow-inner mb-4 hover:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500"
                      placeholder="Search all staff and conversations..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {/* Scrollable Mobile List */}
                  <div className="flex-1 overflow-y-auto pr-1 pb-10">
                    {loading ? (
                      <div>Loading...</div>
                    ) : activeTab === "channels" ? (
                      <ChannelConversationList
                        items={sortedChannels}
                        onSelect={handleSelect}
                      />
                    ) : activeTab === "dms" ? (
                      <ConversationList
                        items={sortedConversations.map((c: any) => ({
                          ...c,
                          online: c.peerId ? (onlineStaffs[c.peerId] ?? false) : c.online
                        }))}
                        onSelect={handleSelect}
                      />
                    ) : activeTab === "mentions" ? (
                      <ConversationList
                        items={mentionsConversationsList.map((c: any) => ({
                          ...c,
                          online: c.peerId ? (onlineStaffs[c.peerId] ?? false) : c.online
                        }))}
                        onSelect={handleSelect}
                      />
                    ) : activeTab === "unread" ? (
                      <ConversationList
                        items={unreadConversationsList.map((c: any) => ({
                          ...c,
                          online: c.peerId ? (onlineStaffs[c.peerId] ?? false) : c.online
                        }))}
                        onSelect={handleSelect}
                      />
                    ) : (
                      <ConversationList
                        items={allConversationsList.map((c: any) => ({
                          ...c,
                          online: c.peerId ? (onlineStaffs[c.peerId] ?? false) : c.online
                        }))}
                        onSelect={handleSelect}
                      />
                    )}

                    {staffMatches.length > 0 && (
                      <div className="mt-6">
                        <h2 className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                          Search Results
                        </h2>
                        <ConversationList
                          items={staffMatches.map((c: any) => ({
                            ...c,
                            online: c.peerId ? (onlineStaffs[c.peerId] ?? false) : c.online
                          }))}
                          onSelect={handleSelect}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {selected && (
              <div className="bg-white dark:bg-[#141414] transition-colors h-[90vh] w-[100vw] fixed top-0 left-0 z-50 md:static md:h-[80vh] md:w-full md:rounded-lg overflow-hidden shadow-sm">
                {(() => {
                  const conv: any =
                    activeTab === "channels"
                      ? channels.find((c) => c.id === selected) || null
                      : allConversationsList.find((c) => c.id === selected) ||
                      null;

                  if (!conv) return null;

                  return conv.isChannel ? (
                    <ChannelConversationView
                      conversation={conv}
                      onBack={() => setSelected(null)}
                    />
                  ) : (
                    <ConversationView
                      conversation={conv}
                      onBack={() => setSelected(null)}
                    />
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </StaffLayout>
  );
};

export default MessagesLayout;
