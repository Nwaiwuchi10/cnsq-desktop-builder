"use client";

import React, { useState, useRef, useCallback } from "react";
import { X, Paperclip, Send, Type, Bold, Italic, List } from "lucide-react";
import { AxiosError } from "axios";
import Api from "@/utils/api";
import CustomModal from "../Message/Message";

interface MessageCeoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MessageCeoModal({
  isOpen,
  onClose,
}: MessageCeoModalProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  // Drag and drop handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  // WhatsApp sending
  const sendToWhatsApp = (subject: string, content: string) => {
    const ceoNumber = "2348136757488";
    const message = `Subject: ${subject}\n\nMessage: ${content}`;
    const encoded = encodeURIComponent(message);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const base = isMobile
      ? "https://api.whatsapp.com/send"
      : "https://web.whatsapp.com/send";

    const url = `${base}?phone=${ceoNumber}&text=${encoded}`;
    window.open(url, "_blank");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    // sendToWhatsApp(subject, content);

    try {
      const formData = new FormData();
      const dto = JSON.stringify({ subject, content });
      formData.append("dto", dto);
      if (file) formData.append("file", file);

      const token = localStorage.getItem("user-token");
      await Api.post(`/messageceo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setModal({ type: "success", message: "Message sent successfully!" });

      // Open WhatsApp Web

      // Reset form
      setSubject("");
      setContent("");
      setFile(null);

      // Auto-close
      setTimeout(() => {
        setModal(null);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setModal({
        type: "error",
        message: error?.response?.data?.message || "Failed to send message.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-fadeIn">
          {/* Header Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center gap-3">
              <button className="p-1 rounded hover:bg-gray-100">
                <Type size={16} />
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <Bold size={16} />
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <Italic size={16} />
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <List size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Urgent Message to the CEO
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4">
            {/* Subject */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 font-medium">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="Enter subject..."
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#95D700] focus:outline-none"
              />
            </div>

            {/* Message Box */}
            <div
              ref={dropRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative rounded-xl border ${
                isDragging
                  ? "border-dashed border-[#95D700]/80 bg-[#f7fff0]"
                  : "border-gray-200"
              } p-4 min-h-[150px]`}
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                className="w-full resize-none bg-transparent outline-none text-sm placeholder:text-gray-400 pr-12"
              />

              {/* If file is selected - show chip */}
              {file && (
                <div className="absolute left-8 bottom-2 flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                  {/* <Paperclip size={14} /> */}
                  <span className="max-w-[160px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-1 text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Attach file icon */}
              <div className="absolute left-4 bottom-3 flex items-center gap-3">
                <label className="cursor-pointer text-gray-600 hover:text-gray-800">
                  <Paperclip size={18} />
                  <input
                    ref={inputFileRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Floating circular send button */}
              <button
                type="button"
                onClick={(ev) => {
                  ev.preventDefault();
                  handleSubmit();
                }}
                disabled={loading}
                className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-[#95D700] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="31.415,31.415"
                    />
                  </svg>
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feedback Modal */}
      {modal && (
        <CustomModal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
