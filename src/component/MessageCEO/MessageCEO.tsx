"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  X,
  Paperclip,
  Send,
  Type,
  Bold,
  Italic,
  List,
  AlertTriangle,
} from "lucide-react";
import { AxiosError } from "axios";
import Api from "@/utils/api";
import CustomModal from "../Message/Message";

interface MessageCeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MessageCeoModal({
  isOpen,
  onClose,
  onSuccess,
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
  const [showConfirm, setShowConfirm] = useState(false);

  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!subject || !content) {
      setModal({
        type: "error",
        message: "Please message should have a subject and content.",
      });
      return;
    }
    if (loading) return;
    setLoading(true);

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
      setSubject("");
      setContent("");
      setFile(null);

      setTimeout(() => {
        setModal(null);
        if (onSuccess) onSuccess();
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
      setShowConfirm(false);
    }
  };

  // Early return after all hooks
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 w-full max-w-2xl overflow-hidden animate-fadeIn">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Type size={16} />
                </button>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Bold size={16} />
                </button>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Italic size={16} />
                </button>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <List size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Urgent Message to the CEO
                </span>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-400 p-1 rounded"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              <div className="mb-3">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Enter subject..."
                  className="mt-1 w-full border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 dark:bg-[#1a1a1a] dark:text-white focus:ring-2 focus:ring-[#95D700] focus:outline-none"
                />
              </div>

              <div
                ref={dropRef}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative rounded-xl border ${
                  isDragging
                    ? "border-dashed border-[#95D700]/80 bg-[#f7fff0]"
                    : "border-gray-200 dark:border-gray-800"
                } p-4 min-h-[150px] dark:bg-[#1a1a1a]`}
              >
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                  className="w-full resize-none bg-transparent outline-none text-sm dark:text-white placeholder:text-gray-400 pr-12"
                />

                {file && (
                  <div className="absolute left-8 bottom-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 transition-colors px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400 shadow-sm">
                    <span className="max-w-[160px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="absolute left-4 bottom-3 flex items-center gap-3">
                  <label className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200">
                    <Paperclip size={18} />
                    <input
                      ref={inputFileRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {/*  Send Button (opens confirmation modal) */}
                <button
                  type="button"
                  onClick={() => {
                    if (!subject.trim() || !content.trim()) {
                      setModal({
                        type: "error",
                        message:
                          "Please message should have a subject and content.",
                      });
                      return;
                    }
                    setShowConfirm(true);
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
      )}

      {/*  Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#141414] transition-colors rounded-xl p-6 w-[90%] max-w-sm shadow-xl text-center animate-fadeIn">
            <AlertTriangle className="mx-auto text-yellow-500 mb-3" size={36} />
            <h2 className="text-lg font-semibold mb-1 text-gray-600 dark:text-gray-400">
              Do you really want to send this message?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This <strong>Message cannot be undone</strong> once sent to the
              CEO.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[#95D700] hover:bg-[#84c000] text-white text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Feedback Modal */}
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
