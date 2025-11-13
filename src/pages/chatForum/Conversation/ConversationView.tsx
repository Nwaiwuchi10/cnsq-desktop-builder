"use client";
import React, { useEffect, useState, useRef, ReactNode } from "react";
import Api from "@/utils/api";
import { io, Socket } from "socket.io-client";
import MessageBubble from "./MessageBuble";

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
  time: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  parent?: Partial<Msg>; // allow minimal parent info
};

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  onBack,
}) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<Msg | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  console.log("currentUserId", currentUserId);

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const fetchMessages = async () => {
    if (!conversation?.id) return;
    const token = localStorage.getItem("user-token");
    if (!token) return;

    try {
      const res = await Api.get(
        `/chat/conversations/${conversation?.id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const messagesData = Array.isArray(res.data) ? res.data : [];

      // Decode user ID from token
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.staffId || payload.id || payload.sub;
      console.log("decoded userId:", userId);
      setCurrentUserId(userId);

      const mapped: Msg[] = messagesData.map((m: any) => ({
        id: m.id,
        text: m.text,
        me: m.author.id === userId,
        time: new Date(m.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        attachments: m.attachments,
        reactions: m.reactions,
        parent: m.parent ? { id: m.parent.id, text: m.parent.text } : undefined,
        name: m.author.firstName + " " + m.author.lastName, // <-- add this
      }));

      setMessages(mapped.reverse());
      //   scrollToBottom();
    } catch (err) {
      console.error("Failed to fetch messages:", err);
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

      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          text: msg.text,
          me: msg.authorId === currentUserId,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          attachments: msg.attachments,
          reactions: msg.reactions,
          parent: msg.parent
            ? { id: msg.parent.id, text: msg.parent.text }
            : undefined,
          name: msg.author.firstName + " " + msg.author.lastName, // <-- add this
        },
      ]);
    });

    // === 4️ Optional fallback polling every 1s (NOT inside fetchMessages) ===
    const interval = setInterval(fetchMessages, 1000);

    // === 5️ Cleanup ===
    return () => {
      clearInterval(interval);
      socketRef.current?.emit("leaveConversation", conversation?.id);
      socketRef.current?.disconnect();
    };
  }, [conversation?.id, currentUserId]);
  useEffect(() => {
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [messages]);

  ///post message
  const postMessage = async () => {
    if (!text.trim() && files.length === 0) return;

    const token = localStorage.getItem("user-token");
    if (!token) return;

    const formData = new FormData();
    formData.append(
      "dto",
      JSON.stringify({
        conversationId: conversation?.id,
        text,
        parentId: replyingTo?.id,
      })
    );

    files.forEach((f) => formData.append("file", f));

    try {
      await Api.post("/chat/messages", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Clear input and files after sending
      setText("");
      setFiles([]);
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
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
  /////render file preview
  const renderFilePreview = (fileItem: File, idx: number) => {
    const ext = fileItem.name.split(".").pop()?.toLowerCase();
    const isImage = ext && ["png", "jpg", "jpeg", "gif"].includes(ext);
    const isVideo = ext && ["mp4", "mov", "webm"].includes(ext);

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
          <div className="text-xs text-green-500">
            {conversation ? "Online" : ""}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/5"
      >
        {replyingTo && (
          <div className="p-2 border-l-4 border-green-400 bg-green-50/40 mb-2">
            Replying to: {replyingTo.text}
            <button
              className="ml-2 text-red-500"
              onClick={() => setReplyingTo(null)}
            >
              ✖
            </button>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id}>
            {m.parent && (
              <div className="text-xs text-gray-400 mb-1 ml-2 border-l-2 pl-2">
                Reply to: {m.parent.text}
              </div>
            )}
            <MessageBubble text={parseLinks(m.text)} me={m.me} time={m.time} />

            {/* Attachments */}
            {(m.attachments ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1 ml-2">
                {m.attachments!.map((a) => {
                  const ext = a.filename?.split(".").pop()?.toLowerCase();
                  if (ext && ["png", "jpg", "jpeg", "gif"].includes(ext)) {
                    return (
                      <img
                        key={a.id}
                        src={a.url}
                        className="w-32 h-32 object-cover rounded"
                      />
                    );
                  } else if (ext && ["mp4", "mov"].includes(ext)) {
                    return (
                      <video
                        key={a.id}
                        src={a.url}
                        controls
                        className="w-40 rounded"
                      />
                    );
                  } else {
                    return (
                      <a
                        key={a.id}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600"
                      >
                        {a.filename || "Attachment"}
                      </a>
                    );
                  }
                })}
              </div>
            )}

            {/* Actions */}
            {/* <div className="flex gap-2 mt-1 ml-2">
              <button
                onClick={() => setReplyingTo(m)}
                className="cursor-pointer"
              >
                Reply
              </button>
              <button className="cursor-pointer">👍</button>
              <button className="cursor-pointer">❤️</button>
            </div> */}
          </div>
        ))}
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
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
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

            {/* Message Input */}
            <input
              className="flex-1 rounded-full border px-4 py-2"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && postMessage()}
            />

            {/* Send Button */}
            <button
              onClick={postMessage}
              className="p-3 rounded-full bg-green-500 text-white cursor-pointer hover:bg-green-600"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;
