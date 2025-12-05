"use client";
import React, { useEffect, useState, useRef, ReactNode } from "react";
import Api from "@/utils/api";
// import { io, Socket } from "socket.io-client";
import io from "socket.io-client";

import EmojiPicker from "emoji-picker-react";

import ChannelMessageBubble from "./ChannelMessageBuble";

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
  time: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  parent?: Partial<Msg>; // allow minimal parent info
  author?: {
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
  const [staffList, setStaffList] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [replyingTo, setReplyingTo] = useState<Msg | null>(null);
  const [editMessage, setEditMessage] = useState<Msg | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [deletingMessageIds, setDeletingMessageIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const prevConversationId = useRef<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageSize = 30;
  const hasUserScrolled = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // ================== Initialize User ID ==================
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.staffId || payload.id || payload.sub);
    }
  }, []);

  // ================== Fetch Messages ==================
  const fetchMessages = async () => {
    if (!conversation?.id) return;
    const token = localStorage.getItem("user-token");
    if (!token) return;

    try {
      const res = await Api.get(
        `/chat/conversations/${conversation.id}/messages?limit=${pageSize}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
        reactions: m.reactions,
        parent: m.parent
          ? {
              id: m.parent.id,
              text: m.parent.text,
              attachments: m.parent.attachments,
            }
          : undefined,
        name: m.author.firstName + " " + m.author.lastName,

        author: {
          firstName: m.author.firstName,
          photoUrl: m.author.photoUrl || null,
        },
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
        { headers: { Authorization: `Bearer ${token}` } }
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
        reactions: m.reactions,
        parent: m.parent
          ? {
              id: m.parent.id,
              text: m.parent.text,
              attachments: m.parent.attachments,
            }
          : undefined,
        name: m.author.firstName + " " + m.author.lastName,
        authorFirstName: m.author.firstName,
        authorAvatarUrl: m.author.photoUrl,
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
            id: msg.authorId,
            firstName: msg.author.firstName,
            lastName: msg.author.lastName,
            avatar: msg.author.photoUrl || null,
          },

          Authorname: msg.author.firstName,
          avatar: msg.author.photoUrl || null,
          name: msg.author.firstName + " " + msg.author.lastName,
          attachments: msg.attachments,
          reactions: msg.reactions,
          parent: msg.parent,
        },
      ]);
    });

    socketRef.current.on("message:edit", (msg: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, text: msg.text, edited: true } : m
        )
      );
    });

    socketRef.current.on("message:delete", (msg: any) => {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
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

    // Match hashtag trigger #
    const match = value.match(/#(\w*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const filtered = staffList.filter((s) =>
        `${s.firstName}${s.lastName}`.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSelectStaff = (staff: any) => {
    setText((prev) =>
      prev.replace(/#\w*$/, `#${staff.firstName}${staff.lastName} `)
    );
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const extractMentionedStaffIds = () => {
    const ids: number[] = [];
    staffList.forEach((staff) => {
      const tag = `#${staff.firstName}${staff.lastName}`;
      if (text.includes(tag)) ids.push(staff.id);
    });
    return ids;
  };

  // ================== Post Message ==================
  const postMessage = async () => {
    if (!text.trim() && files.length === 0) return;

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
      })
    );
    files.forEach((f) => formData.append("file", f));

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
  //////record voice
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Browser does not support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // BEST cross browser MIME types
      const supportedMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ];

      let mimeType = "";

      for (const type of supportedMimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );

      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("Microphone permission denied or unsupported device.");
    }
  };
  const stopRecording = () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    setIsRecording(false);
  };
  const sendVoiceNote = async () => {
    if (!audioBlob) return;

    const token = localStorage.getItem("user-token");

    const formData = new FormData();
    formData.append(
      "dto",
      JSON.stringify({ conversationId: conversation?.id, text: "" })
    );

    formData.append("file", audioBlob, "voice-note.webm");

    await Api.post("/chat/messages", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setAudioBlob(null);
    setAudioUrl(null);
  };

  ///// edit and delete conversation

  const saveEdit = async (messageId: string) => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    try {
      setIsSaving(true);
      const res = await Api.patch(
        `/chat/messages/${messageId}/edit`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  const parseLinks = (text: string): ReactNode => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, idx) =>
      urlRegex.test(part) ? (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600"
        >
          {part}
        </a>
      ) : (
        part
      )
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
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 text-xs text-gray-700 rounded">
            {ext?.toUpperCase() || "FILE"}
          </div>
        )}

        <div className="text-xs truncate max-w-[100px]">{fileItem.name}</div>

        <button
          onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
          className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full px-1 text-sm cursor-pointer"
        >
          ✖
        </button>
        {/* ////voice recording preview */}
        {isRecording && (
          <button
            className="px-2 py-1 bg-gray-600 text-white rounded"
            onClick={stopRecording}
          >
            ⏹ Stop
          </button>
        )}
      </div>
    );
  };
  ////

  return (
    <div className="flex flex-col w-full h-full text-gray-600">
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
          {/* <div className="text-xs text-green-500">
            {conversation ? "Active" : ""}
          </div> */}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/5"
      >
        {loadingMore && (
          <div className="text-center text-gray-500 text-sm py-2">
            Loading more...
          </div>
        )}
        {messages.map((m) => {
          const msgDate = formatDate(m.createdAt);
          const showDateSeparator = msgDate !== lastDate;
          lastDate = msgDate;

          const isReplyPreviewSpot = replyingTo && replyingTo.id === m.id;

          return (
            <div key={m.id} className="mb-2">
              {/* DATE SEPARATOR */}
              {showDateSeparator && (
                <div className="flex justify-center my-2">
                  <div className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
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
                  <div className="text-gray-700 text-sm">{replyingTo.text}</div>

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
                  <div className="border border-lime-500 bg-gray-100 rounded-xl p-3 text-xs shadow-sm">
                    {/* ---------- PARENT (replied-to message) ---------- */}
                    <div className="font-semibold text-gray-700 mb-1">
                      Replying to:
                    </div>

                    <div className="text-gray-700 mb-2">{m.parent.text}</div>

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

                    <hr className="border-gray-300 my-2" />

                    {/* ---------- CHILD MESSAGE TEXT ---------- */}
                    {m.text && (
                      <ChannelMessageBubble
                        text={
                          <>
                            {parseLinks(m.text)}
                            {m.edited && (
                              <span className="text-xs text-gray-500">
                                {" "}
                                (edited)
                              </span>
                            )}
                          </>
                        }
                        me={m.me}
                        time={m.time}
                        selected={selectedMessageId === m.id}
                        onClick={() =>
                          setSelectedMessageId(
                            selectedMessageId === m.id ? null : m.id
                          )
                        }
                        authorName={m.author?.firstName}
                        avatar={m.author?.photoUrl}
                      />
                    )}
                    {selectedMessageId === m.id && (
                      <div
                        className={`flex gap-3 mt-1 ${
                          m.me ? "justify-end" : "justify-start"
                        }`}
                      >
                        {m.me && (
                          <>
                            <button
                              onClick={() => {
                                setEditMessage(m);
                                setText(m.text);
                                setReplyTo(null);
                              }}
                              className="text-blue-500 text-sm hover:underline"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteMessage(m.id)}
                              className="text-red-500 text-sm hover:underline disabled:opacity-50"
                              disabled={deletingMessageIds.has(m.id)}
                            >
                              {deletingMessageIds.has(m.id)
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </>
                        )}

                        {/* Reply button */}
                        <button
                          onClick={() => setReplyingTo(m)}
                          className="text-gray-600 text-sm hover:underline"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                    {/* ---------- CHILD ATTACHMENTS ---------- */}
                    {(m.attachments?.length ?? 0) > 0 && (
                      <div
                        className={`flex flex-col mt-2 ${
                          m.me ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="flex flex-wrap gap-2">
                          {(m.attachments ?? []).map((a) => {
                            const ext = a.filename
                              ?.split(".")
                              .pop()
                              ?.toLowerCase();
                            const time = (
                              <div className="text-xs text-gray-500 mt-1 text-right">
                                {m.time}
                              </div>
                            );

                            if (a.mimeType?.startsWith("audio/")) {
                              return (
                                <div key={a.id} className="relative">
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
                                <div key={a.id} className="relative">
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
                                <div key={a.id} className="relative">
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
                              <div key={a.id} className="relative">
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
                  {m.text && (
                    <ChannelMessageBubble
                      // text={parseLinks(m.text) + (m.edited ? " (edited)" : "")}
                      text={
                        <>
                          {parseLinks(m.text)}
                          {m.edited && (
                            <span className="text-xs text-gray-500">
                              {" "}
                              (edited)
                            </span>
                          )}
                        </>
                      }
                      me={m.me}
                      time={m.time}
                      selected={selectedMessageId === m.id}
                      onClick={() =>
                        setSelectedMessageId(
                          selectedMessageId === m.id ? null : m.id
                        )
                      }
                      authorName={m.author?.firstName}
                      avatar={m.author?.photoUrl}
                    />
                  )}

                  {/* ======================================================
         ACTION BUTTONS (Edit / Delete / Reply)
         ====================================================== */}
                  {selectedMessageId === m.id && (
                    <div
                      className={`flex gap-3 mt-1 ${
                        m.me ? "justify-end" : "justify-start"
                      }`}
                    >
                      {m.me && (
                        <>
                          <button
                            onClick={() => {
                              setEditMessage(m);
                              setText(m.text);
                              setReplyTo(null);
                            }}
                            className="text-blue-500 text-sm hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteMessage(m.id)}
                            className="text-red-500 text-sm hover:underline disabled:opacity-50"
                            disabled={deletingMessageIds.has(m.id)}
                          >
                            {deletingMessageIds.has(m.id)
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </>
                      )}

                      {/* Reply button */}
                      <button
                        onClick={() => setReplyingTo(m)}
                        className="text-gray-600 text-sm hover:underline"
                      >
                        Reply
                      </button>
                    </div>
                  )}

                  {/* ======================================================
         ATTACHMENTS
         ====================================================== */}
                  {(m.attachments?.length ?? 0) > 0 && (
                    <div
                      className={`flex flex-col mt-1 ${
                        m.me ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex flex-wrap gap-2">
                        {(m.attachments ?? []).map((a) => {
                          const ext = a.filename
                            ?.split(".")
                            .pop()
                            ?.toLowerCase();
                          const time = (
                            <div className="text-xs text-gray-500 mt-1 text-right">
                              {m.time}
                            </div>
                          );

                          if (a.mimeType?.startsWith("audio/")) {
                            return (
                              <div key={a.id} className="relative">
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
                              <div key={a.id} className="relative">
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
                              <div key={a.id} className="relative">
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
                            <div key={a.id} className="relative">
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
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex flex-col gap-2">
          {/* File Previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {files.map((f, idx) => renderFilePreview(f, idx))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* File Select Button */}
            <label className="cursor-pointer px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700">
              📎
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

            {/* ////voice recording */}
            <button
              className="px-2 py-1 bg-green-600 text-white rounded cursor-pointer"
              onClick={startRecording}
            >
              🎤
            </button>
            {/* /////voice recording playback */}
            {audioUrl && (
              <div className="p-2 border rounded bg-gray-100">
                <audio controls src={audioUrl} className="w-full" />

                <div className="flex gap-3 mt-2">
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => {
                      setAudioUrl(null);
                      setAudioBlob(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded"
                    onClick={sendVoiceNote}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
            {/* ////emoji send */}
            {/* Emoji Button */}
            <button
              onClick={() => setShowEmojiPicker((p) => !p)}
              // onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xl"
            >
              😀
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-12 left-2 z-50 bg-white shadow-lg rounded-lg">
                {/* Header + Close Button */}
                <div className="flex justify-between items-center px-2 py-1 border-b">
                  <span className="text-sm font-semibold">Emoji</span>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-gray-500 hover:text-red-500 text-lg leading-none"
                  >
                    ✖
                  </button>
                </div>
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}

            {/* Message Input */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute bottom-16 left-4 bg-white border rounded shadow-lg max-h-40 overflow-y-auto z-50">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="px-3 py-1 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleSelectStaff(s)}
                  >
                    {s.firstName} {s.lastName}
                  </div>
                ))}
              </div>
            )}

            <textarea
              className="flex-1 min-w-0 rounded-full border px-4 py-3 resize-none focus:outline-none"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={1} // auto expand? Tailwind can use h-auto
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  postMessage();
                }
              }}
            />

            {/* Send Button */}

            <button
              onClick={() => {
                if (editMessage) {
                  saveEdit(editMessage.id);
                } else {
                  postMessage();
                }
              }}
              disabled={isSaving}
              className="p-3 bg-green-500 text-white rounded-full cursor-pointer hover:bg-green-600"
            >
              {editMessage ? "Save" : "➤"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelConversationView;
