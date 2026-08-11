"use client";
import React, { useEffect, useState, useRef, ReactNode } from "react";
import Api from "@/utils/api";
// import { io, Socket } from "socket.io-client";
import io from "socket.io-client";
import MessageBubble from "./MessageBuble";
import EmojiPicker from "emoji-picker-react";
import NativeVoiceRecorder from "@/component/VoiceRecorder/NativeVoiceRecorder";
import { useChatStore } from "@/store/ChatStore";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import { ReactionsState } from "../Channels/ChannelMessageBuble";
import DMHeaderMenu from "../components/DMHeaderMenu";
import ContactInfoDrawer from "../components/ContactInfoDrawer";
import ImageZoomModal from "../components/ImageZoomModal";
import TruncatedText from "../components/TruncatedText";
import ReactionUserListModal from "../components/ReactionUserListModal";
import MessageInfoModal from "../components/MessageInfoModal";

// Slight update to trigger deployment/build verification (v3)
type ConversationViewProps = {
  conversation: Msg | null;
  onBack?: () => void;
  onRead?: (conversationId: string) => void;
};

type Attachment = {
  id: string;
  url: string;
  filename?: string;
  mimeType?: string;
};

type Reaction = {
  id: string;
  emoji: string;
};

type Msg = {
  id: string;
  name: string;
  avatar?: string;
  text: string;
  me: boolean;
  createdAt: string;
  edited?: boolean;
  pinned?: boolean;
  time: string;
  attachments?: Attachment[];
  reactions?: ReactionsState;
  repliesInThreadCount?: number;
  threadUnreadCount?: number;
  lastThreadReplyTime?: string;
  threadParticipants?: Array<{ id?: number; photoUrl?: string | null; firstName?: string; name?: string }>;
  parent?: Partial<Msg>; // allow minimal parent info
  peerId?: number;
};

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  onBack,
  onRead,
}) => {
  const onlineStaffs = useChatStore((s) => s.onlineStaffs);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<Msg | null>(null);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editMessage, setEditMessage] = useState<Msg | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [deletingMessageIds, setDeletingMessageIds] = useState<Set<string>>(new Set());
  const [reactorsModalMessageId, setReactorsModalMessageId] = useState<string | null>(null);

  // ======= Helper: Normalize raw reactions array → ReactionsState =======
  const normalizeReactions = (rawReactions: any[]): ReactionsState | undefined => {
    if (!Array.isArray(rawReactions) || rawReactions.length === 0) return undefined;
    const state: ReactionsState = {};
    for (const r of rawReactions) {
      const emoji = r.emoji;
      if (!emoji) continue;
      if (!state[emoji]) {
        state[emoji] = { count: 0, me: false, users: [] };
      }
      state[emoji].count++;
      if (r.author || r.user) {
        const u = r.author || r.user;
        state[emoji].users.push(Number(u.id));
        if (Number(u.id) === currentUserId) {
          state[emoji].me = true;
        }
      }
    }
    return state;
  };

  console.log("currentUserId", currentUserId);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );

  const [messageInfoId, setMessageInfoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [isForwardingModalOpen, setIsForwardingModalOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Msg | null>(null);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [zoomUrl, setZoomUrl] = useState("");
  const [zoomFilename, setZoomFilename] = useState("attachment");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactingToMessageId, setReactingToMessageId] = useState<string | null>(null);
  const prevConversationId = useRef<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageSize = 30;
  const hasUserScrolled = useRef(false);
  const shouldScrollToUnread = useRef(false);

  // const socketRef = useRef<Socket | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileTextareaRef = useRef<HTMLTextAreaElement>(null);
  const desktopTextareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!conversation?.id) return;

    // If conversation changed, reset scroll flag
    if (prevConversationId.current !== conversation.id) {
      prevConversationId.current = conversation.id;
      hasUserScrolled.current = false;
      
      const unreadCount = (conversation as any)?.unread || 0;
      if (unreadCount > 0) {
        shouldScrollToUnread.current = true;
      } else {
        shouldScrollToUnread.current = false;
        // scroll immediately after opening conversation
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 50);
      }
    }
  }, [conversation?.id]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      const topReached = container.scrollTop === 0;

      if (topReached) {
        loadMoreMessages();
      }

      const bottomReached =
        container.scrollHeight - container.scrollTop === container.clientHeight;

      if (!bottomReached) {
        hasUserScrolled.current = true;
      }
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-expand textarea
  useEffect(() => {
    const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
      if (ref.current) {
        ref.current.style.height = "auto";
        const newHeight = Math.min(ref.current.scrollHeight, 200);
        ref.current.style.height = `${newHeight}px`;
      }
    };
    adjustHeight(mobileTextareaRef);
    adjustHeight(desktopTextareaRef);
  }, [text]);

  useEffect(() => {
    if (shouldScrollToUnread.current) {
      const unreadCount = (conversation as any)?.unread || 0;
      if (unreadCount > 0 && unreadCount <= messages.length) {
        const firstUnreadMsg = messages[messages.length - unreadCount];
        if (firstUnreadMsg) {
          setTimeout(() => {
            const element = document.getElementById(`msg-${firstUnreadMsg.id}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
              shouldScrollToUnread.current = false;
              hasUserScrolled.current = true;
            }
          }, 100);
          return;
        }
      }
    }

    const lastMsg = messages[messages.length - 1];
    const sentByMe = lastMsg && (lastMsg.me || (lastMsg as any).author?.id === currentUserId || (lastMsg as any).authorId === currentUserId);

    if (!hasUserScrolled.current || sentByMe) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      if (sentByMe) {
        hasUserScrolled.current = false;
      }
    }
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.staffId || payload.id || payload.sub);
    }
  }, []);

  const fetchMessages = async () => {
    if (!conversation?.id) return;
    const token = localStorage.getItem("user-token");
    if (!token) return;

    try {
      const res = await Api.get(
        `/chat/conversations/${conversation.id}/messages?limit=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Mark conversation as read on fetch
      try {
        await Api.patch(
          `/chat/mark-read/${conversation.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onRead?.(conversation.id);
      } catch (err) {
        console.error("Failed to mark conversation as read on fetch:", err);
      }

      const messagesData = Array.isArray(res.data.messages)
        ? res.data.messages
        : [];

      const nextCursor = res.data.nextCursor;
      setCursor(nextCursor);
      setHasMore(Boolean(nextCursor));

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.staffId || payload.id || payload.sub;
      setCurrentUserId(userId);

      const mapped = messagesData.map((m: any) => ({
        id: m.id,
        text: m.text,
        me: m.author.id === userId,
        createdAt: m.createdAt,
        time: new Date(m.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachments: m.attachments,
        reactions: m.reactions && typeof m.reactions === 'object' && !Array.isArray(m.reactions)
          ? m.reactions
          : normalizeReactions(m.reactions || []),
        parent: m.parent
          ? {
            id: m.parent.id,
            text: m.parent.text,
            attachments: m.parent.attachments,
          }
          : undefined,
        name: m.author.firstName + " " + m.author.lastName,
        edited: m.edited,
        pinned: m.pinned,
        type: m.type,
      }));

      // backend returns DESC, reverse to ASC for display
      setMessages(mapped.reverse());
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };
  const loadMoreMessages = async () => {
    if (!conversation?.id) return;
    if (!cursor || loadingMore || !hasMore) return;

    const token = localStorage.getItem("user-token");
    if (!token) return;

    try {
      setLoadingMore(true);

      const res = await Api.get(
        `/chat/conversations/${conversation.id}/messages?cursor=${cursor}&limit=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const messagesData = Array.isArray(res.data.messages)
        ? res.data.messages
        : [];

      const newCursor = res.data.nextCursor;
      setCursor(newCursor);
      setHasMore(Boolean(newCursor));

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.staffId || payload.id || payload.sub;

      // map results
      const mapped = messagesData.map((m: any) => ({
        id: m.id,
        text: m.text,
        me: m.author.id === userId,
        createdAt: m.createdAt,
        time: new Date(m.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachments: m.attachments,
        reactions: m.reactions && typeof m.reactions === 'object' && !Array.isArray(m.reactions)
          ? m.reactions
          : normalizeReactions(m.reactions || []),
        parent: m.parent
          ? {
            id: m.parent.id,
            text: m.parent.text,
            attachments: m.parent.attachments,
          }
          : undefined,
        name: m.author.firstName + " " + m.author.lastName,
        edited: m.edited,
      }));

      // append to TOP (older messages)
      setMessages((prev) => [...mapped.reverse(), ...prev]);

      // maintain scroll position after items prepend
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 200; // keeps user near the same place
        }
      }, 50);
    } catch (err) {
      console.error("Load more failed", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!conversation?.id) return;

    // === 1️ Connect socket ===
    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
      query: { token: localStorage.getItem("user-token") },
    });

    socketRef.current.emit("joinConversation", conversation?.id);

    // === 2️⃣ Initial fetch ===
    fetchMessages();

    // === 3️ Listen for new messages ===
    socketRef.current.on("message:new", (msg: any) => {
      if (msg.conversationId !== conversation?.id) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id,
            text: msg.text,
            me: msg.authorId === currentUserId,
            createdAt: msg.createdAt,
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            name: msg.author.firstName + " " + msg.author.lastName,
            attachments: msg.attachments,
            reactions: normalizeReactions(msg.reactions || []),
            parent: msg.parent,
          },
        ];
      });

      if (msg.authorId !== currentUserId && onRead && conversation?.id) {
        onRead(conversation.id);
      }
    });

    /////for edit message
    socketRef.current.on("message:edit", (msg: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, text: msg.text, edited: true } : m,
        ),
      );
    });
    socketRef.current.on("message:delete", (msg: any) => {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    });

    socketRef.current.on("message:pin", (data: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.id ? { ...m, pinned: data.pinned } : m,
        ),
      );
    });

    socketRef.current.on("message:reaction", (data: any) => {
      const normalizeIncoming = (r: any) => {
        if (r && typeof r === 'object' && !Array.isArray(r)) {
          return r.emojis ? r.emojis : r;
        }
        return normalizeReactions(Array.isArray(r) ? r : []);
      };

      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId ? { ...m, reactions: normalizeIncoming(data.reactions) } : m,
        ),
      );
    });

    return () => {
      socketRef.current?.emit("leaveConversation", conversation?.id);
      socketRef.current?.disconnect();
    };
  }, [conversation?.id, currentUserId]);

  const togglePin = async (messageId: string) => {
    const token = localStorage.getItem("user-token");
    if (!token) return;
    try {
      await Api.post(`/chat/messages/${messageId}/pin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Pin toggle failed", err);
    }
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-green-50/50", "dark:bg-green-950/20", "ring-2", "ring-green-400", "rounded-2xl");
      setTimeout(() => {
        element.classList.remove("bg-green-50/50", "dark:bg-green-950/20", "ring-2", "ring-green-400", "rounded-2xl");
      }, 2000);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    const token = localStorage.getItem("user-token");
    if (!token) return;
    try {
      await Api.post(`/chat/reaction`, {
        emoji,
        messageId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Reaction toggle failed", err);
    }
  };

  const fetchForwardConversations = async () => {
    const token = localStorage.getItem("user-token");
    if (!token) return;
    try {
      const [dmsRes, channelsRes] = await Promise.all([
        Api.get("/chat/dms/all/user", { headers: { Authorization: `Bearer ${token}` } }),
        Api.get("/chat/channels/all/user", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const dms = dmsRes.data.conversations || [];
      const channels = channelsRes.data || [];
      setAllConversations([...dms, ...channels]);
      setIsForwardingModalOpen(true);
    } catch (err) {
      console.error("Fetch forward convs failed", err);
    }
  };

  const forwardMessage = async (targetConversationId: string) => {
    if (!forwardingMessage) return;
    const token = localStorage.getItem("user-token");
    if (!token) return;
    try {
      await Api.post(`/chat/messages/${forwardingMessage.id}/forward`, {
        targetConversationId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsForwardingModalOpen(false);
      setForwardingMessage(null);
    } catch (err) {
      console.error("Forwarding failed", err);
    }
  };
  //// close emoji picker
  const handleEmojiSelect = (emoji: any) => {
    setText((prev) => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };
  //////record voice
  const sendVoiceNote = async () => {
    if (!voiceBlob || !conversation?.id) return;

    const token = localStorage.getItem("user-token");
    if (!token) return;

    const formData = new FormData();
    formData.append(
      "dto",
      JSON.stringify({
        conversationId: conversation.id,
        text: "",
        parentId: replyingTo?.id ?? null,
      }),
    );

    formData.append("file", voiceBlob, "voice-note.webm");

    try {
      setUploadingVoice(true);
      await Api.post(`/chat/messages`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // reset
      setVoiceBlob(null);
      setVoiceUrl(null);
      setReplyingTo(null);
    } catch (err) {
      console.error("Voice upload failed", err);
    } finally {
      setUploadingVoice(false);
    }
  };

  ///post message

  const postMessage = async () => {
    if (!text.trim() && files.length === 0 && !voiceBlob) return;

    const token = localStorage.getItem("user-token");
    if (!token) return;

    const formData = new FormData();
    formData.append(
      "dto",
      JSON.stringify({
        conversationId: conversation?.id,
        text,
        parentId: replyingTo?.id ?? null,
      }),
    );

    files.forEach((f) => formData.append("file", f));
    if (voiceBlob) {
      formData.append("file", voiceBlob, "voice-note.webm");
    }

    try {
      setIsSaving(true);
      await Api.post("/chat/messages", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Clear input, files and voice recording after sending
      setText("");
      setFiles([]);
      setVoiceBlob(null);
      setVoiceUrl(null);
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  ///// edit and delete conversation

  const saveEdit = async (messageId: string) => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    try {
      setIsSaving(true);
      await Api.patch(
        `/chat/messages/${messageId}/edit`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, text, edited: true } : m)),
      );

      // Clear edit state
      setEditMessage(null);
      setText("");
      setReplyTo(null);
      setReplyingTo(null);
      setSelectedMessageId(null);

      // frontend will get updated via socket 'message:edit'
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };
  // component-level state

  // function to delete
  const deleteMessage = async (messageId: string) => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    // optimistic: mark as deleting (used to disable button / show spinner)
    setDeletingMessageIds((prev) => new Set(prev).add(messageId));

    try {
      await Api.delete(`/chat/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Option A (optimistic removal): immediately remove message from UI
      setMessages((prev) => prev.filter((m) => m.id !== messageId));

      // The socket will also emit message:delete — the handler filtering by id is idempotent.
    } catch (err) {
      console.error("Delete failed", err);
      // you may show a toast here
    } finally {
      setDeletingMessageIds((prev) => {
        const copy = new Set(prev);
        copy.delete(messageId);
        return copy;
      });
    }
  };
  /////format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  /////parse links in message text

  const parseLinks = (text: string, isMe = false): ReactNode => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, idx) =>
      urlRegex.test(part) ? (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline break-all ${isMe ? 'text-white/90 hover:text-white' : 'text-blue-600 dark:text-blue-400 hover:text-blue-700'}`}
        >
          {part}
        </a>
      ) : (
        part
      ),
    );
  };
  let lastDate = "";
  /////render file preview
  const renderFilePreview = (fileItem: File, idx: number) => {
    const ext = fileItem.name.split(".").pop()?.toLowerCase();
    const isImage = ext && ["png", "jpg", "jpeg", "gif"].includes(ext);
    const isVideo = ext && ["mp4", "mov", "webm"].includes(ext);
    const isAudio = ext && ["mp3", "wav", "ogg", "m4a"].includes(ext);

    return (
      <div
        key={idx}
        className="relative border p-1 rounded flex items-center gap-2"
      >
        {isImage && (
          <img
            src={URL.createObjectURL(fileItem)}
            alt={fileItem.name}
            className="w-16 h-16 object-cover rounded"
          />
        )}
        {isVideo && (
          <video
            src={URL.createObjectURL(fileItem)}
            className="w-20 h-20 rounded"
            controls
          />
        )}
        {isAudio && (
          <audio
            src={URL.createObjectURL(fileItem)}
            className="w-20 h-20 rounded"
            controls
          />
        )}
        {!isImage && !isVideo && (
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-colors text-xs text-gray-700 dark:text-gray-300 rounded">
            {ext?.toUpperCase() || "FILE"}
          </div>
        )}

        <div className="text-xs truncate max-w-[100px]">{fileItem.name}</div>

        <button
          onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
          className="absolute -top-2 -right-2 text-red-500 bg-white dark:bg-[#141414] transition-colors rounded-full px-1 text-sm cursor-pointer"
        >
          ✖
        </button>
      </div>
    );
  };
  const pinnedMessages = messages.filter((m) => m.pinned);
  const latestPinnedMessage = pinnedMessages[pinnedMessages.length - 1];

  return (

    <div className="flex flex-col w-full h-full text-gray-600 dark:text-gray-400">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            ◀
          </button>
          <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600">
            {conversation?.avatar ? (
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                {conversation?.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {conversation?.name}
            </div>
            {conversation?.peerId && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${onlineStaffs[conversation.peerId] ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {onlineStaffs[conversation.peerId] ? 'Online' : 'Offline'}
              </div>
            )}
          </div>
        </div>
        <DMHeaderMenu
          onContactInfo={() => setIsContactInfoOpen(true)}
          onSearch={() => setIsSearchOpen((prev) => !prev)}
          onSelectMessages={() => alert("Message selection mode active")}
          onMuteNotifications={() => alert("Notifications muted for this chat")}
          onDisappearingMessages={() => alert("Disappearing messages timer set")}
          onAddToFavorites={() => alert("Chat added to Favorites")}
          onAddToList={() => alert("Added to custom list")}
          onCloseChat={() => onBack?.()}
          onSendCallLink={() => alert("Call link generated and copied")}
          onNewGroupCall={() => alert("Group call initiated")}
          onReport={() => alert("User reported")}
          onBlock={() => alert("User blocked")}
          onClearChat={() => {
            if (confirm("Are you sure you want to clear chat messages?")) {
              setMessages([]);
            }
          }}
          onDeleteChat={() => {
            if (confirm("Are you sure you want to delete this chat?")) {
              onBack?.();
            }
          }}
        />
      </div>

      {/* Pinned Message Banner */}
      {latestPinnedMessage && (
        <div
          onClick={() => scrollToMessage(latestPinnedMessage.id)}
          className="flex items-center justify-between px-5 py-2.5 bg-gray-50 dark:bg-[#1c1d1e] border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 z-10 shadow-sm"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-lime-500 flex-shrink-0 rotate-45"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11V22H13V16H18V14L16 12Z"/></svg>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider mb-0.5">
                Pinned Message
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                <span className="font-semibold mr-1">
                  {latestPinnedMessage.me ? "You" : (conversation?.name || "User")}:
                </span>
                {latestPinnedMessage.text || (latestPinnedMessage.attachments?.length ? `📎 Sent ${latestPinnedMessage.attachments.length} attachment(s)` : "Sent a message")}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePin(latestPinnedMessage.id);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            title="Unpin message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Message Search Bar Header */}
      {isSearchOpen && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#141414] border-b border-gray-200 dark:border-gray-800 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages in this chat..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder-gray-400"
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              Clear
            </button>
          )}
          <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            ✕
          </button>
        </div>
      )}

      <ContactInfoDrawer
        isOpen={isContactInfoOpen}
        onClose={() => setIsContactInfoOpen(false)}
        contact={{
          name: conversation?.name || "User",
          avatar: conversation?.avatar,
          online: conversation?.peerId ? onlineStaffs[conversation.peerId] : false,
        }}
      />

      <ImageZoomModal
        isOpen={isImageZoomOpen}
        onClose={() => setIsImageZoomOpen(false)}
        url={zoomUrl}
        filename={zoomFilename}
      />

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-white dark:bg-[#141414] transition-colors"
      >
        {loadingMore && (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
            Loading more...
          </div>
        )}
        {(() => {
          const seen = new Set();
          return messages
            .filter((m) => {
              if (!m.id) return true;
              if (seen.has(m.id)) return false;
              seen.add(m.id);
              return true;
            })
            .filter((m) => !searchQuery.trim() || (m.text || "").toLowerCase().includes(searchQuery.toLowerCase()))
            .map((m) => {
          const msgDate = formatDate(m.createdAt);
          const showDateSeparator = msgDate !== lastDate;
          lastDate = msgDate;

          const isReplyPreviewSpot = replyingTo && replyingTo.id === m.id;

          return (
            <div key={m.id} id={`msg-${m.id}`} className="mb-2">
              {/* DATE SEPARATOR */}
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-800">
                    {msgDate}
                  </div>
                </div>
              )}

              {/* ======================================================
         REPLYING-TO PREVIEW (appears only above the clicked message)
         ====================================================== */}
              {isReplyPreviewSpot && (
                <div className="p-2 border-l-4 border-green-400 bg-green-50/40 mb-1 rounded">
                  <div className="font-semibold text-sm">Replying to:</div>

                  {/* Text */}
                  <div className="text-gray-700 dark:text-gray-300 text-sm">
                    {replyingTo.text}
                  </div>

                  {/* Attachments */}
                  {(replyingTo.attachments?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(replyingTo.attachments ?? []).map((a) => (
                        <a
                          key={a.id}
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-blue-600 text-xs"
                        >
                          {a.filename || "Attachment"}
                        </a>
                      ))}
                    </div>
                  )}

                  <button
                    className="ml-2 text-red-500 text-xs"
                    onClick={() => setReplyingTo(null)}
                  >
                    ✖
                  </button>
                </div>
              )}

              {/* ======================================================
   PARENT MESSAGE (Teams/Slack-style reply container)
====================================================== */}
              {m.parent ? (
                <div className="max-w-[85%] mb-2 ml-2 mb-6">
                  <div className="border border-lime-500 bg-gray-100 dark:bg-gray-800 transition-colors rounded-xl p-3 text-xs shadow-sm">
                    {/* ---------- PARENT (replied-to message) ---------- */}
                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Replying to:
                    </div>

                    <div className="text-gray-700 dark:text-gray-300 mb-2">
                      {m.parent.text}
                    </div>

                    {(m.parent.attachments?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(m.parent.attachments ?? []).map((a) => (
                          <a
                            key={a.id}
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-600 text-xs"
                          >
                            {a.filename || "Attachment"}
                          </a>
                        ))}
                      </div>
                    )}

                    <hr className="border-gray-300 dark:border-gray-700 my-2" />

                    {/* ---------- CHILD MESSAGE TEXT ---------- */}
                    {m.text && (
                      <MessageBubble
                        text={
                          <>
                            {parseLinks(m.text, m.me)}
                            {m.edited && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {" "}
                                (edited)
                              </span>
                            )}
                          </>
                        }
                        me={m.me}
                        time={m.time}
                        pinned={m.pinned}
                        reactions={m.reactions}
                        threadRepliesCount={m.repliesInThreadCount}
                        threadUnreadCount={m.threadUnreadCount}
                        lastThreadReplyTime={m.lastThreadReplyTime}
                        threadParticipants={m.threadParticipants}
                        selected={selectedMessageId === m.id}
                        onClick={() =>
                          setSelectedMessageId(
                            selectedMessageId === m.id ? null : m.id,
                          )
                        }
                        onTogglePin={() => togglePin(m.id)}
                        onReact={(emoji) => toggleReaction(m.id, emoji)}
                        onViewThread={() => {
                          // Handle opening thread in DM
                        }}
                        onViewReactors={() => setReactorsModalMessageId(m.id)}
                        currentUserId={currentUserId}
                      />
                    )}
                    {selectedMessageId === m.id && (
                      <div
                        className={`flex flex-col gap-2 mt-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 w-auto max-w-full shadow-md border border-gray-100 dark:border-gray-700
                          ${m.me ? "ml-auto" : "mr-auto"}
                        `}
                      >
                        {/* Quick Reaction Emojis Row for Mobile & Desktop */}
                        <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-gray-700/80 overflow-x-auto no-scrollbar">
                          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-400 mr-1 flex-shrink-0">React:</span>
                          {["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥"].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReaction(m.id, emoji);
                                setSelectedMessageId(null);
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-base transition-transform active:scale-125 hover:scale-110 flex-shrink-0"
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReactingToMessageId(m.id);
                            }}
                            className="px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-[11px] font-bold text-blue-500 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-700 flex-shrink-0 flex items-center gap-0.5"
                            title="More Emojis"
                          >
                            <span>➕</span>
                            <span>More</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          {m.me && (
                            <>
                              <button
                                onClick={() => {
                                  setEditMessage(m);
                                  setText(m.text);
                                  setReplyTo(null);
                                }}
                                className="flex items-center gap-1 text-blue-500 active:text-blue-700 transition-colors py-1"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                <span className="text-xs font-medium">Edit</span>
                              </button>

                              <button
                                onClick={() => deleteMessage(m.id)}
                                disabled={deletingMessageIds.has(m.id)}
                                className="flex items-center gap-1 text-red-500 active:text-red-700 transition-colors disabled:opacity-50 py-1"
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                <span className="text-xs font-medium">{deletingMessageIds.has(m.id) ? "..." : "Delete"}</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => {
                              setReplyingTo(m);
                              setSelectedMessageId(null);
                            }}
                            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 active:text-green-500 transition-colors py-1"
                            title="Reply"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                            <span className="text-xs font-medium">Reply</span>
                          </button>

                          <button
                            onClick={() => {
                              togglePin(m.id);
                              setSelectedMessageId(null);
                            }}
                            className={`flex items-center gap-1 transition-colors py-1 ${m.pinned ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400 active:text-blue-500'}`}
                            title={m.pinned ? "Unpin" : "Pin"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m16 4-4 4-4-4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 12H9"/></svg>
                            <span className="text-xs font-medium">{m.pinned ? "Unpin" : "Pin"}</span>
                          </button>

                          <button
                            onClick={() => {
                              setForwardingMessage(m);
                              fetchForwardConversations();
                            }}
                            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 active:text-blue-500 transition-colors py-1"
                            title="Forward"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 10 5 5-5 5" /><path d="M4 4v7a4 4 0 0 0 4 4h12" /></svg>
                            <span className="text-xs font-medium">Forward</span>
                          </button>

                          <button
                            onClick={() => {
                              setMessageInfoId(m.id);
                              setSelectedMessageId(null);
                            }}
                            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 active:text-[#95D700] transition-colors py-1"
                            title="Message Info (Read Receipts)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            <span className="text-xs font-medium">Info</span>
                          </button>
                        </div>
                      </div>
                    )}
                    {/* ---------- CHILD ATTACHMENTS ---------- */}
                    {(m.attachments?.length ?? 0) > 0 && (
                      <div
                        className={`flex flex-col mt-2 ${m.me ? "items-end" : "items-start"
                          }`}
                      >
                        <div className="flex flex-wrap gap-2">
                          {(m.attachments ?? []).map((a) => {
                            const ext = a.filename
                              ?.split(".")
                              .pop()
                              ?.toLowerCase();
                            const time = (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                                {m.time}
                              </div>
                            );

                            if (a.mimeType?.startsWith("audio/")) {
                              return (
                                <div key={a.id} className="relative cursor-pointer" onClick={() => setSelectedMessageId(selectedMessageId === m.id ? null : m.id)}>
                                  <audio controls className="w-64">
                                    <source src={a.url} type={a.mimeType} />
                                  </audio>
                                  {time}
                                </div>
                              );
                            }

                            if (
                              ext &&
                              ["png", "jpg", "jpeg", "gif"].includes(ext)
                            ) {
                              return (
                                <div key={a.id} className="relative cursor-pointer" onClick={() => setSelectedMessageId(selectedMessageId === m.id ? null : m.id)}>
                                  <img
                                    src={a.url}
                                    className="w-32 h-32 object-cover rounded"
                                  />
                                  {time}
                                </div>
                              );
                            }

                            if (ext && ["mp4", "mov", "webm"].includes(ext)) {
                              return (
                                <div key={a.id} className="relative cursor-pointer" onClick={() => setSelectedMessageId(selectedMessageId === m.id ? null : m.id)}>
                                  <video
                                    src={a.url}
                                    controls
                                    className="w-40 rounded"
                                  />
                                  {time}
                                </div>
                              );
                            }

                            return (
                              <div key={a.id} className="relative cursor-pointer" onClick={() => setSelectedMessageId(selectedMessageId === m.id ? null : m.id)}>
                                <a
                                  href={a.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-blue-600"
                                >
                                  {a.filename || "Attachment"}
                                </a>
                                {time}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* MESSAGE BUBBLE */}
                  {(m.text || (m.attachments?.length ?? 0) > 0) && (
                    <MessageBubble
                      text={
                        m.text ? (
                          <>
                            {parseLinks(m.text, m.me)}
                            {m.edited && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {" "}
                                (edited)
                              </span>
                            )}
                          </>
                        ) : null
                      }
                      me={m.me}
                      time={m.time}
                      pinned={m.pinned}
                      reactions={m.reactions}
                      selected={selectedMessageId === m.id}
                      onClick={() =>
                        setSelectedMessageId(
                          selectedMessageId === m.id ? null : m.id,
                        )
                      }
                      onTogglePin={() => togglePin(m.id)}
                      onReact={(emoji) => toggleReaction(m.id, emoji)}
                      onViewReactors={() => setReactorsModalMessageId(m.id)}
                      currentUserId={currentUserId}
                      attachments={m.attachments}
                    />
                  )}

                  {/* ======================================================
         ACTION BUTTONS (Edit / Delete / Reply)
         ====================================================== */}
                    {selectedMessageId === m.id && (
                      <div
                        className={`flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 w-auto shadow-md border border-gray-100 dark:border-gray-700
                          ${m.me ? "ml-auto" : "mr-auto"}
                        `}
                      >
                        {m.me && (
                          <>
                            <button
                              onClick={() => {
                                setEditMessage(m);
                                setText(m.text);
                                setReplyTo(null);
                              }}
                              className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              <span className="text-xs font-medium">Edit</span>
                            </button>

                            <button
                              onClick={() => deleteMessage(m.id)}
                              disabled={deletingMessageIds.has(m.id)}
                              className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              <span className="text-xs font-medium">{deletingMessageIds.has(m.id) ? "..." : "Delete"}</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setReplyingTo(m);
                            setSelectedMessageId(null);
                          }}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors"
                          title="Reply"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                          <span className="text-xs font-medium">Reply</span>
                        </button>

                        <button
                          onClick={() => {
                            togglePin(m.id);
                            setSelectedMessageId(null);
                          }}
                          className={`flex items-center gap-1 transition-colors ${m.pinned ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400 hover:text-blue-500'}`}
                          title={m.pinned ? "Unpin" : "Pin"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m16 4-4 4-4-4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 12H9"/></svg>
                          <span className="text-xs font-medium">{m.pinned ? "Unpin" : "Pin"}</span>
                        </button>

                        <button
                          onClick={() => {
                            setForwardingMessage(m);
                            fetchForwardConversations();
                          }}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                          title="Forward"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 10 5 5-5 5" /><path d="M4 4v7a4 4 0 0 0 4 4h12" /></svg>
                          <span className="text-xs font-medium">Forward</span>
                        </button>

                        <button
                          onClick={() => {
                            setMessageInfoId(m.id);
                            setSelectedMessageId(null);
                          }}
                          className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-[#95D700] transition-colors"
                          title="Message Info (Read Receipts)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                          <span className="text-xs font-medium">Info</span>
                        </button>
                      </div>
                    )}

                  {reactingToMessageId === m.id && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReactingToMessageId(null);
                      }}
                    >
                      <div
                        className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between w-full px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">React with Emoji</span>
                          <button
                            onClick={() => setReactingToMessageId(null)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            toggleReaction(m.id, emojiData.emoji);
                            setReactingToMessageId(null);
                            setSelectedMessageId(null);
                          }}
                          width="100%"
                          height={340}
                          skinTonesDisabled
                          searchDisabled
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })
      })()}
      </div>

      {/* Input */}
      {/* ================ MOBILE + TABLET VIEW ================ */}
      <div className="p-4 pb-safe pb-6 border-t bg-white dark:bg-[#141414] transition-colors md:hidden flex-shrink-0">
        <div className="flex flex-col gap-3">
          {/* File Previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {files.map((f, idx) => renderFilePreview(f, idx))}
            </div>
          )}

          {/* Edit / Reply Indicators */}
          {editMessage && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-xl mb-2 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Editing Message</span>
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{editMessage.text}</span>
              </div>
              <button onClick={() => { setEditMessage(null); setText(""); }} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}

          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-xl mb-2 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Replying to {replyingTo.name}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{replyingTo.text}</span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}

          <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 border border-gray-200 dark:border-gray-700 shadow-inner">
            <div className="flex items-end gap-2">
              <textarea
                ref={mobileTextareaRef}
                className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200 text-sm resize-none px-2 py-1.5 min-h-[40px] max-h-[150px] overflow-y-auto"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (editMessage) saveEdit(editMessage.id);
                    else postMessage();
                  }
                }}
              />

              <button
                onClick={() => {
                  if (editMessage) saveEdit(editMessage.id);
                  else postMessage();
                }}
                disabled={isSaving || (!text.trim() && files.length === 0 && !voiceBlob)}
                className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 cursor-pointer disabled:opacity-30 disabled:bg-gray-400 transition-all shadow-md active:scale-95 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>

            <div className="flex items-center gap-1 border-t border-gray-200 dark:border-gray-700 mt-2.5 pt-2">
              {/* File Button */}
              <label className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.mp3,.wav,.m4a,.pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e: any) => {
                    if (e.target.files) {
                      setFiles((prev: any) => [
                        ...prev,
                        ...Array.from(e.target.files),
                      ]);
                    }
                  }}
                />
              </label>

              {/* Voice recording */}
              <NativeVoiceRecorder
                onRecorded={(blob, url) => {
                  setVoiceBlob(blob);
                  setVoiceUrl(url);
                }}
              />

              {/* Emoji Button */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker((p) => !p)}
                  className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all text-xl"
                >
                  😀
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 z-50 bg-white dark:bg-gray-900 transition-all shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <EmojiPicker onEmojiClick={handleEmojiSelect} />
                  </div>
                )}
              </div>

              {voiceUrl && (
                <div className="ml-2 flex items-center gap-2 bg-lime-50 dark:bg-lime-950/60 rounded-full px-3 py-1 border border-lime-200 dark:border-lime-900 shadow-sm">
                  <audio src={voiceUrl} controls className="h-6 w-32" />
                  <button
                    onClick={postMessage}
                    className="px-2.5 py-1 bg-lime-500 hover:bg-lime-600 text-black text-xs font-bold rounded-full transition shadow-sm"
                  >
                    Send Voice Note
                  </button>
                  <button
                    onClick={() => { setVoiceUrl(null); setVoiceBlob(null); }}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors text-red-500"
                    title="Cancel Recording"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================ DESKTOP VIEW ================ */}
      <div className="p-4 border-t bg-white dark:bg-[#141414] transition-colors hidden md:flex flex-col gap-2">
        {/* File Previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 px-4">
            {files.map((f, idx) => renderFilePreview(f, idx))}
          </div>
        )}

        {/* Edit / Reply Indicators */}
        {editMessage && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-xl mb-2 mx-4 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Editing Message</span>
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[500px]">{editMessage.text}</span>
            </div>
            <button onClick={() => { setEditMessage(null); setText(""); }} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}

        {replyingTo && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-xl mb-2 mx-4 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Replying to {replyingTo.name}</span>
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[500px]">{replyingTo.text}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}

        <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-inner mx-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={desktopTextareaRef}
              className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200 text-sm resize-none px-2 py-1.5 min-h-[40px] max-h-[200px] overflow-y-auto"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (editMessage) saveEdit(editMessage.id);
                  else postMessage();
                }
              }}
            />

            <button
              onClick={() => {
                if (editMessage) saveEdit(editMessage.id);
                else postMessage();
              }}
              disabled={isSaving || (!text.trim() && files.length === 0 && !voiceBlob)}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 cursor-pointer disabled:opacity-30 disabled:bg-gray-400 transition-all shadow-md active:scale-95 flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>

          <div className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 mt-3 pt-2">
            {/* File Button */}
            <label className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.mp3,.wav,.m4a,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e: any) => {
                  if (e.target.files) {
                    setFiles((prev: any) => [
                      ...prev,
                      ...Array.from(e.target.files),
                    ]);
                  }
                }}
              />
            </label>

            {/* Mic */}
            <NativeVoiceRecorder
              onRecorded={(blob, url) => {
                setVoiceBlob(blob);
                setVoiceUrl(url);
              }}
            />

            {/* Emoji */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker((p) => !p)}
                className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all text-xl"
              >
                😀
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-50 bg-white dark:bg-gray-900 transition-all shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <EmojiPicker onEmojiClick={handleEmojiSelect} />
                </div>
              )}
            </div>

            {voiceUrl && (
              <div className="ml-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1.5 pr-1.5 border border-gray-200 dark:border-gray-700">
                <audio src={voiceUrl} controls className="h-7 w-48" />
                <button
                  onClick={() => { setVoiceUrl(null); setVoiceBlob(null); }}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Forwarding Modal */}
      {isForwardingModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Forward message</h3>
              <button onClick={() => setIsForwardingModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {allConversations.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => forwardMessage(c.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold text-gray-500">
                    {c.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.type}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reactors User List Modal */}
      <ReactionUserListModal
        messageId={reactorsModalMessageId}
        isOpen={!!reactorsModalMessageId}
        onClose={() => setReactorsModalMessageId(null)}
      />

      {/* Message Info Modal (Read Receipts) */}
      <MessageInfoModal
        messageId={messageInfoId}
        isOpen={!!messageInfoId}
        onClose={() => setMessageInfoId(null)}
      />
    </div>
  );
};


export default ConversationView;
