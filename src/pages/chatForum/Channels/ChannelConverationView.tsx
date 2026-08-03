"use client";
import React, { useEffect, useState, useRef, ReactNode } from "react";
import Api from "@/utils/api";

import io from "socket.io-client";

import EmojiPicker from "emoji-picker-react";

import ChannelMessageBubble from "./ChannelMessageBuble";
import VerticalOptionsMenu from "./VerticalOptionMenu";
import ConversationMembersManager from "./ConversationMmebersManager";
import parseMentions from "@/utils/ParseMention";
// import parseLinks from "@/utils/ParseLink";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import { useChatStore } from "@/store/ChatStore";
import { ReactionsState } from "./ChannelMessageBuble";
import ChannelHeaderMenu from "../components/ChannelHeaderMenu";
import ChannelInfoDrawer from "../components/ChannelInfoDrawer";
import MessageReminderModal from "../components/MessageReminderModal";
import ImageZoomModal from "../components/ImageZoomModal";
import TruncatedText from "../components/TruncatedText";
import NativeVoiceRecorder from "@/component/VoiceRecorder/NativeVoiceRecorder";
import ReactionUserListModal from "../components/ReactionUserListModal";
import MessageInfoModal from "../components/MessageInfoModal";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

type ConversationViewProps = {
  conversation: Msg | null;
  onBack?: () => void;
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
  type?: string;
  parent?: Partial<Msg>; // allow minimal parent info
  author?: {
    id?: number;
    firstName: string;
    photoUrl: string | null;
  };
};

const ChannelConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  onBack,
}) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [replyingTo, setReplyingTo] = useState<Msg | null>(null);
  const [editMessage, setEditMessage] = useState<Msg | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [threadParent, setThreadParent] = useState<Msg | null>(null);
  const threadParentRef = React.useRef<Msg | null>(null);

  const updateThreadParent = (val: Msg | null) => {
    setThreadParent(val);
    threadParentRef.current = val;
    if (val !== null) setIsChatCollapsed(false); // always expand when opening new thread
  };
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [threadText, setThreadText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [deletingMessageIds, setDeletingMessageIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [forwardingMessage, setForwardingMessage] = useState<Msg | null>(null);
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [isForwardingModalOpen, setIsForwardingModalOpen] = useState(false);

  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);
  const [zoomUrl, setZoomUrl] = useState("");
  const [zoomFilename, setZoomFilename] = useState("attachment");

  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [uploadingVoice, setUploadingVoice] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const prevConversationId = useRef<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  // const [loadingMore, setLoadingMore] = useState(false);
  const [threadFiles, setThreadFiles] = useState<File[]>([]);
  const [threadVoiceBlob, setThreadVoiceBlob] = useState<Blob | null>(null);
  const [threadVoiceUrl, setThreadVoiceUrl] = useState<string | null>(null);
  const [showThreadEmojiPicker, setShowThreadEmojiPicker] = useState(false);
  const [mode, setMode] = useState<"add" | "view" | "remove" | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [search, setSearch] = useState("");
  const [staffList, setStaffList] = useState<any[]>([]);
  const onlineStaffs = useChatStore((s) => s.onlineStaffs);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editThreadMessage, setEditThreadMessage] = useState<any>(null);
  const [threadReplyingTo, setThreadReplyingTo] = useState<any>(null);
  const [deletingThreadReplyIds, setDeletingThreadReplyIds] = useState<Set<string>>(new Set());
  const [selectedThreadMessageId, setSelectedThreadMessageId] = useState<string | null>(null);
  const [reactorsModalMessageId, setReactorsModalMessageId] = useState<string | null>(null);
  const [messageInfoId, setMessageInfoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isThreadGroupInfoOpen, setIsThreadGroupInfoOpen] = useState(false);
  const [threadMessageInfoId, setThreadMessageInfoId] = useState<string | null>(null);
  const [threadReactorsModalMessageId, setThreadReactorsModalMessageId] = useState<string | null>(null);

  const pageSize = 30;
  const hasUserScrolled = useRef(false);
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
      // scroll immediately after opening conversation
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
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

  // Auto-expand textareas
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
    if (!hasUserScrolled.current) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  // ================== Initialize User ID ==================
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.staffId || payload.id || payload.sub);
      setCurrentUser({
        id: payload.staffId || payload.id || payload.sub,
        firstName: payload.firstName,
        lastName: payload.lastName,
        photoUrl: payload.photoUrl || null,
      });
    }
  }, []);

  ////fetch staff for hashtag
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const query = `/staff-register/all/staffs/dept?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""
          }`;
        const res = await Api.get(query);
        setStaffList(res.data.data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };

    fetchStaff();
  }, [page, limit, search]);

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
      if (r.author) {
        state[emoji].users.push(Number(r.author.id));
        if (Number(r.author.id) === currentUserId) {
          state[emoji].me = true;
        }
      }
    }
    return state;
  };

  // ================== Fetch Messages ==================
  const fetchMessages = async () => {
    if (!conversation?.id) return;
    const token = localStorage.getItem("user-token");
    if (!token) return;

    try {
      const res = await Api.get(
        `/chat/conversations/${conversation.id}/messages?limit=${pageSize}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

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
          ? m.reactions  // Already normalized ReactionsState from backend
          : normalizeReactions(m.reactions || []),
        parent: m.parent
          ? {
            id: m.parent.id,
            text: m.parent.text,
            attachments: m.parent.attachments,
          }
          : undefined,
        name: `${m.author?.firstName || ""} ${m.author?.lastName || ""}`.trim() || "Staff Member",

        author: {
          id: m.author?.id,
          firstName: m.author?.firstName || "",
          lastName: m.author?.lastName || "",
          photoUrl: m.author?.photoUrl || null,
        },
        edited: m.edited,
        pinned: m.pinned,
        type: m.type,
        repliesInThreadCount: m.repliesInThreadCount ?? 0,
      }));

      setMessages(mapped.reverse());
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // ================== Load More Messages on Scroll ==================
  const loadMoreMessages = async () => {
    if (!conversation?.id || !cursor || loadingMore || !hasMore) return;
    const token = localStorage.getItem("user-token");
    if (!token) return;

    try {
      setLoadingMore(true);
      const res = await Api.get(
        `/chat/conversations/${conversation.id}/messages?cursor=${cursor}&limit=${pageSize}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const messagesData = Array.isArray(res.data.messages)
        ? res.data.messages
        : [];
      const newCursor = res.data.nextCursor;
      setCursor(newCursor);
      setHasMore(Boolean(newCursor));

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.staffId || payload.id || payload.sub;

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
        name: `${m.author?.firstName || ""} ${m.author?.lastName || ""}`.trim() || "Staff Member",
        author: {
          id: m.author?.id,
          firstName: m.author?.firstName || "",
          lastName: m.author?.lastName || "",
          photoUrl: m.author?.photoUrl || null,
        },
        edited: m.edited,
        pinned: m.pinned,
        type: m.type,
        repliesInThreadCount: m.repliesInThreadCount ?? 0,
      }));

      setMessages((prev) => [...mapped.reverse(), ...prev]);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 200;
      }, 50);
    } catch (err) {
      console.error("Load more failed", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ================== Socket Setup ==================
  useEffect(() => {
    if (!conversation?.id) return;

    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
      query: { token: localStorage.getItem("user-token") },
    });
    socketRef.current.emit("joinConversation", conversation?.id);

    fetchMessages();

    socketRef.current.on("message:new", (msg: any) => {
      if (msg.conversationId !== conversation?.id) return;

      setMessages((prev: any) => [
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
          author: {
            id: msg.authorId || msg.author?.id,
            firstName: msg.author?.firstName || "",
            lastName: msg.author?.lastName || "",
            photoUrl: msg.author?.photoUrl || null,
          },
          name: `${msg.author?.firstName || ""} ${msg.author?.lastName || ""}`.trim() || "Staff Member",
          attachments: msg.attachments || [],
          reactions: undefined,
          pinned: false,
          repliesInThreadCount: 0,
          type: msg.type,
          parent: msg.parent,
        },
      ]);
    });

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
      if (threadParentRef.current?.id === data.id) {
        updateThreadParent({ ...threadParentRef.current, pinned: data.pinned } as any);
      }
    });

    socketRef.current.on("message:reaction", (data: any) => {
      // Normalize incoming reactions — backend may send ReactionsState or raw array
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
      if (threadParentRef.current?.id === data.messageId) {
        updateThreadParent({ ...threadParentRef.current, reactions: normalizeIncoming(data.reactions) } as any);
      }
      if (data.threadReplyId) {
        setThreadMessages((prev) =>
          prev.map((m: any) =>
            m.id === data.threadReplyId ? { ...m, reactions: normalizeIncoming(data.reactions) } : m,
          ),
        );
      }
    });

    socketRef.current.on("thread:reply_new", (data: any) => {
      if (threadParentRef.current?.id === data.messageId) {
        setThreadMessages((prev) => [...prev, data]);
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, repliesInThreadCount: (m.repliesInThreadCount || 0) + 1 }
            : m,
        ),
      );
    });

    socketRef.current.on("thread:reply_edit", (data: any) => {
      if (threadParentRef.current?.id === data.messageId) {
        setThreadMessages((prev) =>
          prev.map((m: any) =>
            m.id === data.id ? { ...m, text: data.text, edited: true } : m,
          ),
        );
      }
    });

    socketRef.current.on("thread:reply_delete", (data: any) => {
      setThreadMessages((prev) => prev.filter((m: any) => m.id !== data.id));
      // Decrement reply count on main message
      setMessages((prev) =>
        prev.map((m) => {
          // We don't have messageId in delete payload from gateway, 
          // but we can find which message had this reply if we kept a mapping.
          // Alternatively, we can just assume it was the current thread if open.
          if (threadParentRef.current && m.id === threadParentRef.current.id) {
            return { ...m, repliesInThreadCount: Math.max(0, (m.repliesInThreadCount || 0) - 1) };
          }
          return m;
        }),
      );
    });

    return () => {
      socketRef.current?.emit("leaveConversation", conversation?.id);
      socketRef.current?.disconnect();
    };
  }, [conversation?.id, currentUserId]);

  // ================== Staff Hashtag Mentions ==================
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Detect @mentions
    const match = value.match(/@(\w*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const allItem = { id: 'all', firstName: 'all', lastName: '(Notify everyone in channel)', isAll: true };
      const filtered = staffList.filter((s) =>
        `${s.firstName}${s.lastName}`.toLowerCase().includes(query) ||
        s.firstName.toLowerCase().includes(query) ||
        s.lastName.toLowerCase().includes(query)
      );
      setSuggestions("all".includes(query) ? [allItem, ...filtered] : filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSelectStaff = (staff: any) => {
    if (staff.isAll) {
      setText((prev) => prev.replace(/@\w*$/, `@all `));
    } else {
      setText((prev) =>
        prev.replace(/@\w*$/, `@${staff.firstName}${staff.lastName} `),
      );
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };
  const extractMentionedStaffIds = (): number[] => {
    const mentionedIds: number[] = [];
    staffList.forEach((s) => {
      const tag = `@${s.firstName}${s.lastName}`;
      if (text.includes(tag)) mentionedIds.push(s.id);
    });
    return mentionedIds;
  };
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
      await Api.post(`/chat/channels/${conversation?.id}/messages/`, formData, {
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

  const toggleReaction = async (messageId: string, emoji: string, isThreadReply = false) => {
    const token = localStorage.getItem("user-token");
    if (!token) return;
    try {
      await Api.post(`/chat/reaction`, {
        emoji,
        messageId: !isThreadReply ? messageId : undefined,
        threadReplyId: isThreadReply ? messageId : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Reaction toggle failed", err);
    }
  };

  const openThread = async (message: Msg) => {
    updateThreadParent(message);
    setThreadMessages([]);
    setThreadText("");
    setThreadFiles([]);
    setThreadVoiceBlob(null);
    setThreadVoiceUrl(null);
    setIsThreadLoading(true);
    const token = localStorage.getItem("user-token");
    if (!token) return;
    try {
      const res = await Api.get(`/chat/messages/${message.id}/thread-replies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setThreadMessages(res.data);
    } catch (err) {
      console.error("Fetch thread replies failed", err);
    } finally {
      setIsThreadLoading(false);
    }
  };

  const handleThreadEmojiSelect = (emoji: any) => {
    setThreadText((prev) => prev + emoji.emoji);
    setShowThreadEmojiPicker(false);
  };

  const postThreadReply = async () => {
    if (editThreadMessage) {
      await saveThreadEdit(editThreadMessage.id);
      return;
    }
    if (!threadText.trim() && threadFiles.length === 0 && !threadVoiceBlob) return;
    const token = localStorage.getItem("user-token");
    if (!token) return;

    const formData = new FormData();
    formData.append("messageId", threadParent?.id || "");
    formData.append("text", threadText);

    if (threadVoiceBlob) {
      formData.append("file", threadVoiceBlob, "voice-note.webm");
    } else {
      threadFiles.forEach((f) => formData.append("file", f));
    }

    if (threadReplyingTo) {
      formData.append("parentReplyId", threadReplyingTo.id);
    }

    try {
      setIsSaving(true);
      await Api.post(`/chat/thread-reply`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setThreadText("");
      setThreadFiles([]);
      setThreadVoiceBlob(null);
      setThreadVoiceUrl(null);
      setThreadReplyingTo(null);
    } catch (err) {
      console.error("Thread reply failed", err);
    } finally {
      setIsSaving(false);
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

  // ================== Post Message ==================
  const postMessage = async () => {
    if (!text.trim() && files.length === 0 && !voiceBlob) return;

    const token = localStorage.getItem("user-token");
    if (!token) return;

    const mentions = extractMentionedStaffIds();
    const formData = new FormData();
    formData.append(
      "dto",
      JSON.stringify({
        conversationId: conversation?.id,
        text,
        mentions,
        parentId: replyingTo?.id ?? null,
      }),
    );
    files.forEach((f) => formData.append("file", f));
    if (voiceBlob) {
      formData.append("file", voiceBlob, "voice-note.webm");
    }

    try {
      setIsSaving(true);
      await Api.post(`/chat/channels/${conversation?.id}/messages/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setText("");
      setFiles([]);
      setVoiceBlob(null);
      setVoiceUrl(null);
      setReplyTo(null);
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };
  const handleEmojiSelect = (emoji: any) => {
    setText((prev) => prev + emoji.emoji);
    setShowEmojiPicker(false);
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

  const deleteThreadReply = async (replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    const token = localStorage.getItem("user-token");
    if (!token) return;

    setDeletingThreadReplyIds((prev) => new Set(prev).add(replyId));

    try {
      await Api.delete(`/chat/thread-reply/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Real-time update handled by socket
    } catch (err) {
      console.error("Error deleting thread reply:", err);
    } finally {
      setDeletingThreadReplyIds((prev) => {
        const next = new Set(prev);
        next.delete(replyId);
        return next;
      });
    }
  };

  const saveThreadEdit = async (replyId: string) => {
    if (!threadText.trim()) return;
    const token = localStorage.getItem("user-token");
    if (!token) return;

    setIsSaving(true);
    try {
      await Api.patch(`/chat/thread-reply/${replyId}`, { text: threadText }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditThreadMessage(null);
      setThreadText("");
    } catch (err) {
      console.error("Error editing thread reply:", err);
    } finally {
      setIsSaving(false);
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
  ////// Function to highlight @mentions
  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(@\w+)/g); // Split text by @mentions
    return parts.map((part, idx) =>
      part.startsWith("@") ? (
        <span key={idx} className="text-lime-500 font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const parseLinks = (text: string): ReactNode => {
    if (!text) return text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, idx) =>
      urlRegex.test(part) ? (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline break-all"
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
        {/* ////voice recording preview */}
      </div>
    );
  };
  ////

  return (

    <div className="flex w-full h-full text-gray-600 dark:text-gray-400 bg-white dark:bg-[#141414]">
      {/* Main Chat Area */}
      {/* Main Conversation List (Hidden on mobile when thread is open) */}
      <div className={`flex flex-col h-full transition-all duration-300 ${threadParent ? (isChatCollapsed ? "hidden lg:hidden" : "hidden lg:flex lg:w-2/3 border-r border-gray-200 dark:border-gray-800") : "w-full"}`}>
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b">
          <button onClick={onBack} className="md:hidden p-2">
            ◀
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {conversation?.avatar ? (
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                {conversation?.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{conversation?.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <ChannelHeaderMenu
              onAddMember={() => setMode("add")}
              onGroupInfo={() => setIsGroupInfoOpen(true)}
              onSearch={() => setIsSearchOpen((prev) => !prev)}
              onSelectMessages={() => alert("Message selection mode active")}
              onMuteNotifications={() => alert("Notifications muted for this channel")}
              onDisappearingMessages={() => alert("Disappearing messages timer set")}
              onAddToFavorites={() => alert("Channel added to Favorites")}
              onAddToList={() => alert("Added to list")}
              onScheduleReminder={() => setIsReminderModalOpen(true)}
              onCloseChat={() => onBack?.()}
              onClearChat={() => {
                if (confirm("Clear channel messages view?")) {
                  setMessages([]);
                }
              }}
              onExitGroup={() => {
                if (confirm("Are you sure you want to exit/leave this channel?")) {
                  onBack?.();
                }
              }}
            />

            {/* Message Search Bar Header */}
            {isSearchOpen && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#141414] border-b border-gray-200 dark:border-gray-800 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages in this channel..."
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

            {mode && (
              <ConversationMembersManager
                conversationId={conversation?.id}
                mode={mode}
                onClose={() => setMode(null)}
              />
            )}
          </div>
        </div>

        <ChannelInfoDrawer
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          channel={{
            id: conversation?.id || "",
            name: conversation?.name || "Channel",
            description: (conversation as any)?.description || "Channel discussion group",
            members: (conversation as any)?.members || [],
          }}
        />

        {conversation?.id && (
          <MessageReminderModal
            conversationId={conversation.id}
            isOpen={isReminderModalOpen}
            onClose={() => setIsReminderModalOpen(false)}
          />
        )}

        <ImageZoomModal
          isOpen={isImageZoomOpen}
          onClose={() => setIsImageZoomOpen(false)}
          url={zoomUrl}
          filename={zoomFilename}
        />

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-[#141414] transition-colors/5"
        >
          {loadingMore && (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
              Loading more...
            </div>
          )}
          {messages
            .filter((m) => !searchQuery.trim() || (m.text || "").toLowerCase().includes(searchQuery.toLowerCase()))
            .map((m) => {
            const msgDate = formatDate(m.createdAt);
            const showDateSeparator = msgDate !== lastDate;
            lastDate = msgDate;

            const isReplyPreviewSpot = replyingTo && replyingTo.id === m.id;

            if (m.type === "join" || m.type === "leave") {
              return (
                <div key={m.id} className="flex flex-col items-center my-4">
                  <div className="text-[11px] text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700 font-medium">
                    {m.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className="mb-6">
                {/* DATE SEPARATOR */}
                {showDateSeparator && (
                  <div className="flex justify-center my-2">
                    <div className="px-3 py-1 bg-gray-200 dark:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 text-xs rounded-full mb-4">
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
                    <div className="text-gray-700 dark:text-gray-300 text-sm">{replyingTo.text}</div>

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

                      <div className="text-gray-700 dark:text-gray-300 mb-2">{m.parent.text}</div>

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

                      {/* ---------- CHILD MESSAGE TEXT / ATTACHMENTS ---------- */}
                      {(m.text || (m.attachments?.length ?? 0) > 0) && (
                        <ChannelMessageBubble
                          text={
                            m.text ? (
                              <>
                                {parseMentions(parseLinks(m.text))}
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
                          selected={selectedMessageId === m.id}
                          onClick={() =>
                            setSelectedMessageId(
                              selectedMessageId === m.id ? null : m.id,
                            )
                          }
                          authorName={
                          m.author
                            ? `${m.author.firstName || ""} ${(m.author as any).lastName || ""}`.trim()
                            : m.name
                        }
                          avatar={m.author?.photoUrl}
                          online={m.author?.id ? onlineStaffs[m.author.id] : undefined}
                          pinned={m.pinned}
                          reactions={m.reactions}
                          threadRepliesCount={m.repliesInThreadCount}
                          currentUserId={currentUserId}
                          onTogglePin={() => togglePin(m.id)}
                          onReact={(emoji) => toggleReaction(m.id, emoji)}
                          onViewThread={() => openThread(m)}
                          onViewReactors={() => setReactorsModalMessageId(m.id)}
                        />
                      )}

                      {/* ATTACHMENTS (Restored Manual Rendering) */}
                      {(m.attachments?.length ?? 0) > 0 && (
                        <div className={`flex flex-col mt-1 ${m.me ? "items-end" : "items-start"}`}>
                          <div className="flex flex-wrap gap-2">
                            {(m.attachments ?? []).map((a: any) => {
                              const ext = a.filename?.split(".").pop()?.toLowerCase();
                              if (a.mimeType?.startsWith("audio/")) {
                                return (
                                  <div key={a.id} className="mt-1">
                                    <audio controls className="w-64 h-8">
                                      <source src={a.url} type={a.mimeType} />
                                    </audio>
                                  </div>
                                );
                              }
                              if (a.mimeType?.startsWith("video/") || (ext && ["mp4", "mov", "webm", "mkv", "avi"].includes(ext))) {
                                return (
                                  <div key={a.id} className="mt-1">
                                    <video src={a.url} controls className="max-w-xs max-h-64 rounded-lg shadow-sm border dark:border-gray-700" />
                                  </div>
                                );
                              }
                              if (ext && ["png", "jpg", "jpeg", "gif"].includes(ext)) {
                                return (
                                  <div key={a.id} className="mt-1">
                                    <img src={a.url} className="w-48 h-48 object-cover rounded-lg shadow-sm border dark:border-gray-700" alt="attachment" />
                                  </div>
                                );
                              }
                              return (
                                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 text-xs mt-1 block">
                                  {a.filename || "Attachment"}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {selectedMessageId === m.id && (
                        <div
                          className={`flex items-center gap-5 mt-2 px-5 py-2.5 rounded-2xl bg-[#1a1d21] dark:bg-[#1a1d21] w-fit shadow-2xl border border-[#2d3239] backdrop-blur-md
                            ${m.me ? "ml-auto flex-row-reverse" : "mr-auto"}
                          `}
                        >
                          <button
                            onClick={() => {
                              setReplyingTo(m);
                              setSelectedMessageId(null);
                            }}
                            className="flex items-center gap-2 text-[#abb2bf] hover:text-white transition-all duration-200 group"
                            title="Reply"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                            <span className="text-[13px] font-semibold">Reply</span>
                          </button>

                          <button
                            onClick={() => {
                              openThread(m);
                              setSelectedMessageId(null);
                            }}
                            className="flex items-center gap-2 text-[#abb2bf] hover:text-[#9147ff] transition-all duration-200 group"
                            title="Reply in Thread"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            <span className="text-[13px] font-semibold">Thread</span>
                          </button>

                          {m.me && (
                            <>
                              <button
                                onClick={() => {
                                  setEditMessage(m);
                                  setText(m.text);
                                  setReplyTo(null);
                                }}
                                className="flex items-center gap-2 text-[#3498db] hover:text-[#5dade2] transition-all duration-200 group"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                <span className="text-[13px] font-semibold text-blue-500">Edit</span>
                              </button>

                              <button
                                onClick={() => deleteMessage(m.id)}
                                disabled={deletingMessageIds.has(m.id)}
                                className="flex items-center gap-2 text-[#e74c3c] hover:text-[#ec7063] transition-all duration-200 group disabled:opacity-50"
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                <span className="text-[13px] font-semibold text-red-500">{deletingMessageIds.has(m.id) ? "..." : "Delete"}</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => {
                              setForwardingMessage(m);
                              fetchForwardConversations();
                            }}
                            className="flex items-center gap-2 text-[#abb2bf] hover:text-[#3498db] transition-all duration-200 group"
                            title="Forward"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="m15 10 5 5-5 5" /><path d="M4 4v7a4 4 0 0 0 4 4h12" /></svg>
                            <span className="text-[13px] font-semibold">Forward</span>
                          </button>

                          <button
                            onClick={() => {
                              setMessageInfoId(m.id);
                              setSelectedMessageId(null);
                            }}
                            className="flex items-center gap-2 text-[#abb2bf] hover:text-[#95D700] transition-all duration-200 group"
                            title="Message Info (Read Receipts)"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            <span className="text-[13px] font-semibold">Info</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* MESSAGE BUBBLE */}
                    {(m.text || (m.attachments?.length ?? 0) > 0) && (
                      <ChannelMessageBubble
                        // text={parseLinks(m.text) + (m.edited ? " (edited)" : "")}
                        text={
                          m.text ? (
                            <>
                              {parseMentions(parseLinks(m.text))}
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
                        selected={selectedMessageId === m.id}
                        onClick={() =>
                          setSelectedMessageId(
                            selectedMessageId === m.id ? null : m.id,
                          )
                        }
                        authorName={
                          m.author
                            ? `${m.author.firstName || ""} ${(m.author as any).lastName || ""}`.trim()
                            : m.name
                        }
                        avatar={m.author?.photoUrl}
                        online={m.author?.id ? onlineStaffs[m.author.id] : undefined}
                        pinned={m.pinned}
                        reactions={m.reactions}
                        threadRepliesCount={m.repliesInThreadCount}
                        onTogglePin={() => togglePin(m.id)}
                        onReact={(emoji) => toggleReaction(m.id, emoji)}
                        onViewThread={() => openThread(m)}
                        onViewReactors={() => setReactorsModalMessageId(m.id)}
                      />
                    )}

                    {/* ======================================================
         ACTION BUTTONS (Edit / Delete / Reply)
         ====================================================== */}
                    {selectedMessageId === m.id && (
                      <div
                        className={`flex items-center gap-5 mt-2 px-5 py-2.5 rounded-2xl bg-[#1a1d21] dark:bg-[#1a1d21] w-fit shadow-2xl border border-[#2d3239] backdrop-blur-md
                        ${m.me ? "ml-auto flex-row-reverse" : "mr-auto"}
                      `}
                      >
                        <button
                          onClick={() => {
                            setReplyingTo(m);
                            setSelectedMessageId(null);
                          }}
                          className="flex items-center gap-2 text-[#abb2bf] hover:text-white transition-all duration-200 group"
                          title="Reply"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                          <span className="text-[13px] font-semibold">Reply</span>
                        </button>

                        <button
                          onClick={() => {
                            openThread(m);
                            setSelectedMessageId(null);
                          }}
                          className="flex items-center gap-2 text-[#abb2bf] hover:text-[#9147ff] transition-all duration-200 group"
                          title="Reply in Thread"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                          <span className="text-[13px] font-semibold">Thread</span>
                        </button>

                        {m.me && (
                          <>
                            <button
                              onClick={() => {
                                setEditMessage(m);
                                setText(m.text);
                                setReplyTo(null);
                              }}
                              className="flex items-center gap-2 text-[#3498db] hover:text-[#5dade2] transition-all duration-200 group"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              <span className="text-[13px] font-semibold text-blue-500">Edit</span>
                            </button>

                            <button
                              onClick={() => deleteMessage(m.id)}
                              disabled={deletingMessageIds.has(m.id)}
                              className="flex items-center gap-2 text-[#e74c3c] hover:text-[#ec7063] transition-all duration-200 group disabled:opacity-50"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              <span className="text-[13px] font-semibold text-red-500">{deletingMessageIds.has(m.id) ? "..." : "Delete"}</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setForwardingMessage(m);
                            fetchForwardConversations();
                          }}
                          className="flex items-center gap-2 text-[#abb2bf] hover:text-[#3498db] transition-all duration-200 group"
                          title="Forward"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="m15 10 5 5-5 5" /><path d="M4 4v7a4 4 0 0 0 4 4h12" /></svg>
                          <span className="text-[13px] font-semibold">Forward</span>
                        </button>

                        <button
                          onClick={() => {
                            setMessageInfoId(m.id);
                            setSelectedMessageId(null);
                          }}
                          className="flex items-center gap-2 text-[#abb2bf] hover:text-[#95D700] transition-all duration-200 group"
                          title="Message Info (Read Receipts)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                          <span className="text-[13px] font-semibold text-[#95D700]">Info</span>
                        </button>
                      </div>
                    )}
                  {/* ATTACHMENTS FOR MAIN MESSAGE */}
                  {(m.attachments?.length ?? 0) > 0 && (
                    <div className={`flex flex-col mt-1 ${m.me ? "items-end" : "items-start"}`}>
                      <div className="flex flex-wrap gap-2">
                        {(m.attachments ?? []).map((a: any) => {
                          const ext = a.filename?.split(".").pop()?.toLowerCase();
                          if (a.mimeType?.startsWith("audio/")) {
                            return (
                              <div key={a.id} className="mt-1">
                                <audio controls className="w-64 h-8">
                                  <source src={a.url} type={a.mimeType} />
                                </audio>
                              </div>
                            );
                          }
                          if (a.mimeType?.startsWith("video/") || (ext && ["mp4", "mov", "webm", "mkv", "avi"].includes(ext))) {
                            return (
                              <div key={a.id} className="mt-1">
                                <video src={a.url} controls className="max-w-xs max-h-64 rounded-lg shadow-sm border dark:border-gray-700" />
                              </div>
                            );
                          }
                          if (ext && ["png", "jpg", "jpeg", "gif"].includes(ext)) {
                            return (
                              <div key={a.id} className="mt-1">
                                <img src={a.url} className="w-48 h-48 object-cover rounded-lg shadow-sm border dark:border-gray-700" alt="attachment" />
                              </div>
                            );
                          }
                          return (
                            <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 text-xs mt-1 block">
                              {a.filename || "Attachment"}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Input */}
        {/* ================= MOBILE & TABLET VIEW ================= */}
        <div className="p-4 border-t bg-white dark:bg-[#141414] transition-colors md:hidden">
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Replying to {replyingTo.author?.firstName}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{replyingTo.text}</span>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}

            <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3 border border-gray-200 dark:border-gray-700 shadow-inner">
              <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-0 px-4 py-3 pointer-events-none whitespace-pre-wrap break-words opacity-0">
                    {renderHighlightedText(text)}
                  </div>

                  <textarea
                    ref={mobileTextareaRef}
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200 text-sm resize-none py-1.5 min-h-[40px] max-h-[150px] overflow-y-auto"
                    placeholder="Type a message..."
                    value={text}
                    onChange={handleTextChange}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (editMessage) saveEdit(editMessage.id);
                        else postMessage();
                      }
                    }}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-[60] backdrop-blur-md bg-opacity-95">
                      {suggestions.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all cursor-pointer group"
                          onClick={() => handleSelectStaff(s)}
                        >
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 font-bold text-xs group-hover:scale-110 transition-transform">
                            {s.firstName?.[0]}{s.lastName?.[0]}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{s.firstName} {s.lastName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
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

        {/* ================= DESKTOP VIEW (unchanged) ================= */}
        <div className="p-4 border-t bg-white dark:bg-[#141414] transition-colors hidden md:flex flex-col gap-2">
          {/* File Previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
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
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Replying to {replyingTo.author?.firstName}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[500px]">{replyingTo.text}</span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}

          <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-inner mx-4 relative">
            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-0 px-4 py-3 pointer-events-none whitespace-pre-wrap break-words opacity-0">
                  {renderHighlightedText(text)}
                </div>

                <textarea
                  ref={desktopTextareaRef}
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200 text-sm resize-none py-1.5 min-h-[40px] max-h-[200px] overflow-y-auto"
                  placeholder="Type a message..."
                  value={text}
                  onChange={handleTextChange}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (editMessage) saveEdit(editMessage.id);
                      else postMessage();
                    }
                  }}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-[60] backdrop-blur-md bg-opacity-95">
                    {suggestions.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all cursor-pointer group"
                        onClick={() => handleSelectStaff(s)}
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 font-bold text-xs group-hover:scale-110 transition-transform">
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{s.firstName} {s.lastName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
              {/* File Select */}
              <label className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
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

              {/* Voice Recording */}
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
      </div>

      {/* Thread Side Panel */}
      {threadParent && (
        <>
          <div
            className={`hidden lg:flex flex-col h-full bg-gray-50 dark:bg-[#1a1a1a] transition-all duration-300 overflow-hidden flex-shrink-0 ${
              isChatCollapsed ? 'w-full flex-1' : 'lg:w-1/3'
            }`}
          >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-[#141414]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsChatCollapsed((c) => !c)}
                className="hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                title={isChatCollapsed ? "Show main chat" : "Expand thread full-screen"}
              >
                {isChatCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </button>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 dark:text-gray-200">Thread</span>
                <span className="text-xs text-gray-500">{conversation?.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChannelHeaderMenu
                onAddMember={() => setMode("add")}
                onGroupInfo={() => setIsThreadGroupInfoOpen(true)}
                onSearch={() => setIsSearchOpen((prev) => !prev)}
                onSelectMessages={() => alert("Message selection mode active")}
                onMuteNotifications={() => alert("Notifications muted for this channel")}
                onDisappearingMessages={() => alert("Disappearing messages timer set")}
                onAddToFavorites={() => alert("Channel added to Favorites")}
                onAddToList={() => alert("Added to list")}
                onScheduleReminder={() => setIsReminderModalOpen(true)}
                onCloseChat={() => updateThreadParent(null)}
                onClearChat={() => {
                  if (confirm("Clear thread messages?")) {
                    setThreadMessages([]);
                  }
                }}
                onExitGroup={() => {
                  if (confirm("Are you sure you want to exit/leave this channel?")) {
                    updateThreadParent(null);
                  }
                }}
              />
              <button
                onClick={() => updateThreadParent(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-500"
                title="Close Thread"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          {/* Thread's own ChannelInfoDrawer */}
          <ChannelInfoDrawer
            isOpen={isThreadGroupInfoOpen}
            onClose={() => setIsThreadGroupInfoOpen(false)}
            channel={{
              id: conversation?.id || "",
              name: conversation?.name || "Channel",
              description: (conversation as any)?.description || "Channel discussion group",
              members: (conversation as any)?.members || [],
            }}
          />

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Parent Message in Thread */}
            <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
              <ChannelMessageBubble
                text={parseMentions(parseLinks(threadParent.text))}
                authorName={
                  threadParent.author
                    ? `${threadParent.author.firstName || ""} ${(threadParent.author as any).lastName || ""}`.trim()
                    : threadParent.name
                }
                avatar={threadParent.author?.photoUrl}
                time={threadParent.time}
                me={threadParent.me}
                pinned={threadParent.pinned}
                reactions={threadParent.reactions}
                onTogglePin={() => togglePin(threadParent.id)}
                onReact={(emoji) => toggleReaction(threadParent.id, emoji)}
                onViewReactors={() => setReactorsModalMessageId(threadParent.id)}
              />
              {(threadParent.attachments?.length ?? 0) > 0 && (
                <div className={`flex flex-col mt-2 ${threadParent.me ? "items-end" : "items-start"}`}>
                  <div className="flex flex-wrap gap-2">
                    {(threadParent.attachments ?? []).map((a: any) => (
                      <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 text-xs">
                        {a.filename || "Attachment"}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Thread Replies */}
            <div className="space-y-4">
              {isThreadLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                </div>
              ) : (
                threadMessages.map((tm: any) => (
                  <div key={tm.id} className="relative group/reply">
                    {(tm.text || (tm.attachments?.length ?? 0) > 0) && (
                      <>
                        <ChannelMessageBubble
                          text={
                            tm.text ? (
                              <>
                                {parseMentions(parseLinks(tm.text))}
                                {tm.edited && (
                                  <span className="text-[10px] text-gray-500 italic ml-1">(edited)</span>
                                )}
                              </>
                            ) : null
                          }
                          authorName={
                            tm.author
                              ? `${tm.author.firstName || ""} ${(tm.author as any).lastName || ""}`.trim()
                              : tm.name
                          }
                          avatar={tm.author?.photoUrl}
                          time={new Date(tm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          me={tm.author.id === currentUserId}
                          selected={selectedThreadMessageId === tm.id}
                          reactions={tm.reactions}
                          onReact={(emoji) => toggleReaction(tm.id, emoji, true)}
                          onClick={() => setSelectedThreadMessageId(selectedThreadMessageId === tm.id ? null : tm.id)}
                          onViewReactors={() => setThreadReactorsModalMessageId(tm.id)}
                        />
                        {(tm.attachments?.length ?? 0) > 0 && (
                          <div className={`flex flex-col mt-1 ${tm.author.id === currentUserId ? "items-end" : "items-start"}`}>
                            <div className="flex flex-wrap gap-2">
                              {(tm.attachments ?? []).map((a: any) => {
                                const ext = a.filename?.split(".").pop()?.toLowerCase();
                                if (a.mimeType?.startsWith("audio/")) {
                                  return (
                                    <div key={a.id} className="mt-1">
                                      <audio controls className="w-64 h-8">
                                        <source src={a.url} type={a.mimeType} />
                                      </audio>
                                    </div>
                                  );
                                }
                                if (ext && ["png", "jpg", "jpeg", "gif"].includes(ext)) {
                                  return (
                                    <div key={a.id} className="mt-1">
                                      <img src={a.url} className="w-48 h-48 object-cover rounded-lg shadow-sm border dark:border-gray-700" alt="attachment" />
                                    </div>
                                  );
                                }
                                return (
                                  <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 text-xs mt-1 block">
                                    {a.filename || "Attachment"}
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Thread Parent Rendering */}
                    {tm.parent && (
                      <div className="max-w-[85%] mb-2 ml-2 mt-1">
                        <div className="border border-lime-500 bg-gray-100 dark:bg-gray-800 transition-colors rounded-xl p-2 text-xs shadow-sm">
                          <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Replying to {tm.parent.author?.firstName}:
                          </div>
                          <div className="text-gray-700 dark:text-gray-300 mb-1">{tm.parent.text}</div>
                          {(tm.parent.attachments?.length ?? 0) > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {(tm.parent.attachments ?? []).map((a: any) => (
                                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 text-xs">
                                  {a.filename || "Attachment"}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedThreadMessageId === tm.id && (
                      <div className={`flex items-center gap-5 mt-2 px-5 py-2.5 rounded-2xl bg-[#1a1d21] dark:bg-[#1a1d21] w-fit shadow-2xl border border-[#2d3239] backdrop-blur-md z-20
                        ${tm.author?.id === currentUserId ? 'ml-auto flex-row-reverse' : 'mr-auto'}
                      `}>
                        {tm.author?.id === currentUserId && (
                          <>
                            <button
                              onClick={() => {
                                setEditThreadMessage(tm);
                                setThreadText(tm.text);
                                setSelectedThreadMessageId(null);
                              }}
                              className="flex items-center gap-2 text-[#3498db] hover:text-[#5dade2] transition-all duration-200 group"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              <span className="text-[13px] font-semibold">Edit</span>
                            </button>
                            <button
                              onClick={() => deleteThreadReply(tm.id)}
                              disabled={deletingThreadReplyIds.has(tm.id)}
                              className="flex items-center gap-2 text-[#e74c3c] hover:text-[#ec7063] transition-all duration-200 group disabled:opacity-50"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              <span className="text-[13px] font-semibold">{deletingThreadReplyIds.has(tm.id) ? "..." : "Delete"}</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setThreadReplyingTo(tm);
                            setSelectedThreadMessageId(null);
                          }}
                          className="flex items-center gap-2 text-[#abb2bf] hover:text-white transition-all duration-200 group"
                          title="Reply"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                          <span className="text-[13px] font-semibold">Reply</span>
                        </button>

                        <button
                          onClick={() => {
                            setThreadMessageInfoId(tm.id);
                            setSelectedThreadMessageId(null);
                          }}
                          className="flex items-center gap-2 text-[#abb2bf] hover:text-[#95D700] transition-all duration-200 group"
                          title="Message Info (Read Receipts)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                          <span className="text-[13px] font-semibold">Info</span>
                        </button>

                        <button
                          onClick={() => setSelectedThreadMessageId(null)}
                          className="text-[#abb2bf] hover:text-white transition-colors text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Thread Input */}
          <div className="p-4 border-t bg-white dark:bg-[#141414]">
            {/* Editing Indicator */}
            {editThreadMessage && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg mb-2 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Editing Reply</span>
                <button onClick={() => { setEditThreadMessage(null); setThreadText(""); }} className="p-1 text-gray-500 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}
            {/* Replying Indicator */}
            {threadReplyingTo && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg mb-2 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-green-600 dark:text-green-400">Replying to {threadReplyingTo.author?.firstName}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{threadReplyingTo.text}</span>
                </div>
                <button onClick={() => setThreadReplyingTo(null)} className="p-1 text-gray-500 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}
            {/* Thread Attachments Preview */}
            {/* Thread Attachments Preview */}
            {threadFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 px-1">
                {threadFiles.map((f, i) => {
                  const isImage = f.type.startsWith("image/");
                  return (
                    <div key={i} className="group relative flex flex-col bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden min-w-[80px]">
                      {isImage ? (
                        <img
                          src={URL.createObjectURL(f)}
                          alt="preview"
                          className="w-20 h-20 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        </div>
                      )}
                      <div className="p-1.5 text-[10px] truncate max-w-[80px] font-medium text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                        {f.name}
                      </div>
                      <button
                        onClick={() => setThreadFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Thread Voice Note Preview */}
            {threadVoiceUrl && (
              <div className="mb-2 p-2 border rounded bg-gray-100 dark:bg-gray-800 flex items-center gap-2">
                <audio src={threadVoiceUrl} controls className="h-8 flex-1" />
                <button
                  onClick={() => {
                    setThreadVoiceUrl(null);
                    setThreadVoiceBlob(null);
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}

            <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-inner">
              <div className="flex items-end gap-2">
                <textarea
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200 text-sm resize-none py-1.5 min-h-[40px] max-h-[120px]"
                  placeholder="Reply in thread..."
                  rows={1}
                  value={threadText}
                  onChange={(e) => {
                    setThreadText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      postThreadReply();
                    }
                  }}
                />
                <button
                  onClick={postThreadReply}
                  disabled={isSaving || (!threadText.trim() && threadFiles.length === 0 && !threadVoiceBlob)}
                  className="p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-30 disabled:bg-gray-400 transition-all shadow-md active:scale-95 flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>

              <div className="flex items-center gap-1 border-t border-gray-200 dark:border-gray-700 mt-2.5 pt-2">
                {/* Attachment Button */}
                <label className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setThreadFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                </label>

                {/* Voice Recorder */}
                <NativeVoiceRecorder
                  onRecorded={(blob, url) => {
                    setThreadVoiceBlob(blob);
                    setThreadVoiceUrl(url);
                  }}
                />

                {/* Emoji Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowThreadEmojiPicker(!showThreadEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all text-xl"
                  >
                    😀
                  </button>
                  {showThreadEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-50 shadow-2xl border rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                      <EmojiPicker onEmojiClick={handleThreadEmojiSelect} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Mobile Thread Panel (Full-screen Overlay on sm/md) */}
      {threadParent && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white dark:bg-[#141414] flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] flex-shrink-0">
            <button
              onClick={() => updateThreadParent(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-800 dark:text-gray-200">Thread</div>
              <div className="text-xs text-gray-500 truncate">{conversation?.name}</div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Parent Message */}
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
              <ChannelMessageBubble
                text={parseMentions(parseLinks(threadParent.text || ""))}
                authorName={
                  threadParent.author
                    ? `${threadParent.author.firstName || ""} ${(threadParent.author as any).lastName || ""}`.trim()
                    : threadParent.name
                }
                avatar={threadParent.author?.photoUrl}
                time={threadParent.time}
                me={threadParent.me}
                pinned={threadParent.pinned}
                reactions={threadParent.reactions}
                onTogglePin={() => togglePin(threadParent.id)}
                onReact={(emoji) => toggleReaction(threadParent.id, emoji)}
                onViewReactors={() => setReactorsModalMessageId(threadParent.id)}
              />
              {(threadParent.attachments?.length ?? 0) > 0 && (
                <div className={`flex flex-col mt-2 ${threadParent.me ? "items-end" : "items-start"}`}>
                  <div className="flex flex-wrap gap-2">
                    {(threadParent.attachments ?? []).map((a: any) => (
                      <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 text-xs">
                        {a.filename || "Attachment"}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Thread Replies */}
            {isThreadLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              </div>
            ) : threadMessages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-4">
                No replies yet. Be the first to reply!
              </div>
            ) : (
              threadMessages.map((tm: any) => (
                <div key={tm.id} className="relative group/reply mb-4">
                  {(tm.text || (tm.attachments?.length ?? 0) > 0) && (
                    <>
                      <ChannelMessageBubble
                        text={
                          tm.text ? (
                            <>
                              {parseMentions(parseLinks(tm.text || ""))}
                              {tm.edited && (
                                <span className="text-[10px] text-gray-500 italic ml-1">(edited)</span>
                              )}
                            </>
                          ) : null
                        }
                        authorName={
                          tm.author
                            ? `${tm.author.firstName || ""} ${(tm.author as any).lastName || ""}`.trim()
                            : tm.name
                        }
                        avatar={tm.author?.photoUrl}
                        time={new Date(tm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        me={tm.author?.id === currentUserId}
                        selected={selectedThreadMessageId === tm.id}
                        reactions={
                          tm.reactions && typeof tm.reactions === 'object' && !Array.isArray(tm.reactions)
                            ? tm.reactions
                            : normalizeReactions(tm.reactions || [])
                        }
                        onReact={(emoji) => toggleReaction(tm.id, emoji, true)}
                        onClick={() => setSelectedThreadMessageId(selectedThreadMessageId === tm.id ? null : tm.id)}
                        onViewReactors={() => setReactorsModalMessageId(tm.id)}
                      />
                      {(tm.attachments?.length ?? 0) > 0 && (
                        <div className={`flex flex-col mt-1 ${tm.author?.id === currentUserId ? "items-end" : "items-start"}`}>
                          <div className="flex flex-wrap gap-2">
                            {(tm.attachments ?? []).map((a: any) => {
                              const ext = a.filename?.split(".").pop()?.toLowerCase();
                              if (a.mimeType?.startsWith("audio/")) {
                                return (
                                  <div key={a.id} className="mt-1">
                                    <audio controls className="w-64 h-8">
                                      <source src={a.url} type={a.mimeType} />
                                    </audio>
                                  </div>
                                );
                              }
                              if (ext && ["png", "jpg", "jpeg", "gif"].includes(ext)) {
                                return (
                                  <div key={a.id} className="mt-1">
                                    <img src={a.url} className="w-48 h-48 object-cover rounded-lg shadow-sm border dark:border-gray-700" alt="attachment" />
                                  </div>
                                );
                              }
                              return (
                                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 text-xs mt-1 block">
                                  {a.filename || "Attachment"}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Thread Parent Rendering (Mobile) */}
                  {tm.parent && (
                    <div className="max-w-[85%] mb-2 ml-2 mt-1">
                      <div className="border border-lime-500 bg-gray-100 dark:bg-gray-800 transition-colors rounded-xl p-2 text-xs shadow-sm">
                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Replying to {tm.parent.author?.firstName}:
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 mb-1">{tm.parent.text}</div>
                        {(tm.parent.attachments?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {(tm.parent.attachments ?? []).map((a: any) => (
                              <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 text-xs">
                                {a.filename || "Attachment"}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedThreadMessageId === tm.id && (
                    <div className={`flex items-center gap-5 mt-2 px-5 py-2.5 rounded-2xl bg-[#1a1d21] dark:bg-[#1a1d21] w-fit shadow-2xl border border-[#2d3239] backdrop-blur-md z-20
                      ${tm.author?.id === currentUserId ? 'ml-auto flex-row-reverse' : 'mr-auto'}
                    `}>
                      {tm.author?.id === currentUserId && (
                        <>
                          <button
                            onClick={() => {
                              setEditThreadMessage(tm);
                              setThreadText(tm.text);
                              setSelectedThreadMessageId(null);
                            }}
                            className="flex items-center gap-2 text-[#3498db] hover:text-[#5dade2] transition-all duration-200 group"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            <span className="text-[13px] font-semibold">Edit</span>
                          </button>
                          <button
                            onClick={() => deleteThreadReply(tm.id)}
                            disabled={deletingThreadReplyIds.has(tm.id)}
                            className="flex items-center gap-2 text-[#e74c3c] hover:text-[#ec7063] transition-all duration-200 group disabled:opacity-50"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            <span className="text-[13px] font-semibold">{deletingThreadReplyIds.has(tm.id) ? "..." : "Delete"}</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setThreadReplyingTo(tm);
                          setSelectedThreadMessageId(null);
                        }}
                        className="flex items-center gap-2 text-[#abb2bf] hover:text-white transition-all duration-200 group"
                        title="Reply"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                        <span className="text-[13px] font-semibold">Reply</span>
                      </button>
                      <button
                        onClick={() => setSelectedThreadMessageId(null)}
                        className="text-[#abb2bf] hover:text-white transition-colors text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Mobile Thread Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] flex-shrink-0">
            {/* Editing Indicator */}
            {editThreadMessage && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg mb-2 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Editing Reply</span>
                <button
                  onClick={() => { setEditThreadMessage(null); setThreadText(""); }}
                  className="p-1 text-gray-500 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}

            {/* Replying Indicator (Mobile) */}
            {threadReplyingTo && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg mb-2 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-green-600 dark:text-green-400">Replying to {threadReplyingTo.author?.firstName}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{threadReplyingTo.text}</span>
                </div>
                <button onClick={() => setThreadReplyingTo(null)} className="p-1 text-gray-500 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}

            {/* Thread Attachments Preview */}
            {threadFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 px-1">
                {threadFiles.map((f, i) => {
                  const isImage = f.type.startsWith("image/");
                  return (
                    <div key={i} className="group relative flex flex-col bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden min-w-[80px]">
                      {isImage ? (
                        <img
                          src={URL.createObjectURL(f)}
                          alt="preview"
                          className="w-20 h-20 object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        </div>
                      )}
                      <div className="p-1.5 text-[10px] truncate max-w-[80px] font-medium text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                        {f.name}
                      </div>
                      <button
                        onClick={() => setThreadFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Thread Voice Note Preview */}
            {threadVoiceUrl && (
              <div className="mb-2 p-2 border rounded bg-gray-100 dark:bg-gray-800 flex items-center gap-2">
                <audio src={threadVoiceUrl} controls className="h-8 flex-1" />
                <button
                  onClick={() => {
                    setThreadVoiceUrl(null);
                    setThreadVoiceBlob(null);
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}

            <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-inner">
              <div className="flex items-end gap-2">
                <textarea
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200 text-sm resize-none py-1.5 min-h-[40px] max-h-[120px]"
                  placeholder="Reply in thread..."
                  rows={1}
                  value={threadText}
                  onChange={(e) => {
                    setThreadText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      postThreadReply();
                    }
                  }}
                />
                <button
                  onClick={postThreadReply}
                  disabled={isSaving || (!threadText.trim() && threadFiles.length === 0 && !threadVoiceBlob)}
                  className="p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-30 disabled:bg-gray-400 transition-all shadow-md active:scale-95 flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>

              <div className="flex items-center gap-1 border-t border-gray-200 dark:border-gray-700 mt-2.5 pt-2">
                {/* Attachment Button */}
                <label className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setThreadFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                </label>

                {/* Voice Recorder */}
                <NativeVoiceRecorder
                  onRecorded={(blob, url) => {
                    setThreadVoiceBlob(blob);
                    setThreadVoiceUrl(url);
                  }}
                />

                {/* Emoji Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowThreadEmojiPicker(!showThreadEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all text-xl"
                  >
                    😀
                  </button>
                  {showThreadEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-50 shadow-2xl border rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                      <EmojiPicker onEmojiClick={handleThreadEmojiSelect} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forwarding Modal */}
      {isForwardingModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Forward message</h3>
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

      {/* Message Info Modal (Read Receipts) - Main channel messages */}
      <MessageInfoModal
        messageId={messageInfoId}
        isOpen={!!messageInfoId}
        onClose={() => setMessageInfoId(null)}
      />

      {/* Message Info Modal - Thread replies */}
      <MessageInfoModal
        messageId={threadMessageInfoId}
        isOpen={!!threadMessageInfoId}
        onClose={() => setThreadMessageInfoId(null)}
      />

      {/* Reaction User List Modal - Thread replies */}
      <ReactionUserListModal
        messageId={threadReactorsModalMessageId}
        isOpen={!!threadReactorsModalMessageId}
        onClose={() => setThreadReactorsModalMessageId(null)}
      />
    </div>
  );
};

export default ChannelConversationView;
