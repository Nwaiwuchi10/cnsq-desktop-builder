"use client";
import React, { useEffect, useState, useRef, ReactNode } from "react";
import Api from "@/utils/api";
// import { io, Socket } from "socket.io-client";
import io from "socket.io-client";
import MessageBubble from "./MessageBuble";
import Picker from "@emoji-mart/react";
// import { Picker } from 'emoji-mart';
import data from "@emoji-mart/data";
// import { Picker } from "emoji-mart";
// import { Picker } from "emoji-mart";

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
  edited?: boolean;
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
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [editMessage, setEditMessage] = useState<Msg | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [deletingMessageIds, setDeletingMessageIds] = useState<Set<string>>(
    new Set()
  );

  console.log("currentUserId", currentUserId);
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

  // const socketRef = useRef<Socket | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };
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
          name: msg.author.firstName + " " + msg.author.lastName,
          attachments: msg.attachments,
          reactions: msg.reactions,
          parent: msg.parent,
        },
      ]);
    });

    /////for edit message
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
    // socketRef.current.on("message:delete", (msg: any) => {
    //   setMessages((prev) =>
    //     prev.map((m) =>
    //       m.id === msg.id ? { ...m, text: "[deleted]", deleted: true } : m
    //     )
    //   );
    // });

    // === 4️ Optional fallback polling every 1s (NOT inside fetchMessages) ===
    // const interval = setInterval(fetchMessages, 1000);

    // === 5️ Cleanup ===
    return () => {
      // clearInterval(interval);
      socketRef.current?.emit("leaveConversation", conversation?.id);
      socketRef.current?.disconnect();
    };
  }, [conversation?.id, currentUserId]);
  // useEffect(() => {
  //   const interval = setInterval(fetchMessages, 1000);
  //   return () => clearInterval(interval);
  // }, [messages]);

  //////record voice
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      setAudioBlob(e.data);
      setAudioUrl(URL.createObjectURL(e.data));
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };
  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

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
        // parentId: replyTo?.id ?? null,
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
  //// close emoji picker
  const handleEmojiSelect = (emoji: any) => {
    setText((prev) => prev + emoji.native);
    setShowEmojiPicker(false); // Auto-close
  };
  ///// edit and delete conversation
  const startEditing = (message: Msg) => {
    setText(message.text);
    setReplyingTo(message);
  };

  const saveEdit = async (messageId: string) => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    try {
      const res = await Api.patch(
        `/chat/messages/${messageId}/edit`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Clear edit state
      setEditMessage(null);
      setReplyTo(null);
      setText("");

      // frontend will get updated via socket 'message:edit'
    } catch (err) {
      console.error(err);
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
            <MessageBubble
              // text={parseLinks(m.text)}
              text={parseLinks(m.text) + (m.edited ? " (edited)" : "")}
              me={m.me}
              time={m.time}
              selected={selectedMessageId === m.id}
              onClick={() =>
                setSelectedMessageId(selectedMessageId === m.id ? null : m.id)
              }
            />
            {/* edith and delete buttons for own messages */}
            {/* ACTION BUTTONS */}
            {selectedMessageId === m.id && (
              <div
                className={`flex gap-3 mt-1 ${
                  m.me ? "justify-end" : "justify-start"
                }`}
              >
                {/* SHOW EDIT BUTTON ONLY IF MESSAGE IS MY OWN */}
                {m.me && (
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
                )}

                {/* DELETE BUTTON ALSO ONLY FOR MY OWN MESSAGES */}
                {m.me && (
                  <button
                    onClick={() => deleteMessage(m.id)}
                    className="text-red-500 text-sm cursor-pointer hover:underline disabled:opacity-50"
                    disabled={deletingMessageIds.has(m.id)}
                  >
                    {deletingMessageIds.has(m.id) ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            )}
            {/* Attachments */}
            {(m.attachments ?? []).length > 0 && (
              <div
                className={`flex mt-1 ${
                  m.me ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  {m.attachments!.map((a) => {
                    if (a.mimeType?.startsWith("audio/")) {
                      return (
                        <audio key={a.id} controls className="w-64">
                          <source src={a.url} type={a.mimeType} />
                        </audio>
                      );
                    }

                    const ext = a.filename?.split(".").pop()?.toLowerCase();

                    if (ext && ["png", "jpg", "jpeg", "gif"].includes(ext)) {
                      return (
                        <img
                          key={a.id}
                          src={a.url}
                          className="w-32 h-32 object-cover rounded"
                        />
                      );
                    }

                    if (ext && ["mp4", "mov", "webm"].includes(ext)) {
                      return (
                        <video
                          key={a.id}
                          src={a.url}
                          controls
                          className="w-40 rounded"
                        />
                      );
                    }

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
                  })}
                </div>
              </div>
            )}

            {/* {(m.attachments ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1 ml-2">
                {m.attachments!.map((a) => {
                  if (a.mimeType?.startsWith("audio/")) {
                    return (
                      <audio key={a.id} controls className="w-64">
                        <source src={a.url} type={a.mimeType} />
                      </audio>
                    );
                  }
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
            )} */}
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
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
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

                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect} // ⬅ clean method
                />
              </div>
            )}

            {/* Message Input */}
            <input
              className="flex-1 min-w-0 rounded-full border px-4 py-2"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && postMessage()}
            />

            {/* Send Button */}
            {editMessage ? (
              <button
                onClick={() => saveEdit(editMessage.id)}
                className="p-3 bg-green-500 cursor-pointer text-white rounded-full"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={postMessage}
                className="p-3 bg-green-500 text-white rounded-full cursor-pointer hover:bg-green-600"
              >
                ➤
              </button>
            )}

            {/* <button
              onClick={postMessage}
              className="p-3 rounded-full bg-green-500 text-white cursor-pointer hover:bg-green-600"
            >
              ➤
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;
