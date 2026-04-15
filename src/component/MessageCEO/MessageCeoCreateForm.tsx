"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Paperclip,
  Send,
  Type,
  Bold,
  Italic,
  List,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import Api from "@/utils/api";
import CustomModal from "../Message/Message";

interface MessageCeoCreateFormProps {
  onSuccess?: () => void;
}

export default function MessageCeoCreateForm({
  onSuccess,
}: MessageCeoCreateFormProps) {
  const router = useRouter();
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
        message: "Please provide both subject and message content.",
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
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/ceos_corner");
        }
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

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Form Container */}
      <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden max-w-4xl">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
              <Type size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
              <Bold size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
              <Italic size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
              <List size={18} />
            </button>
          </div>

          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Message to the CEO
          </span>
        </div>

        {/* Form */}
        <form onSubmit={(e) => e.preventDefault()} className="p-6">
          {/* Subject Field */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Enter message subject..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-[#1a1a1a] dark:text-white focus:ring-2 focus:ring-[#86CD23] focus:border-transparent transition-all"
            />
          </div>

          {/* Message Content Area */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Message
            </label>
            <div
              ref={dropRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative rounded-lg border-2 transition-all ${
                isDragging
                  ? "border-dashed border-[#86CD23] bg-[#f7fff0] dark:bg-[#1a1a1a]/50"
                  : "border-gray-200 dark:border-gray-700"
              } p-4`}
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message here... (Drag files to attach)"
                rows={8}
                className="w-full resize-none bg-transparent outline-none text-base dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />

              {/* File Attachment Display */}
              {file && (
                <div className="absolute left-4 bottom-4 flex items-center gap-2 bg-[#86CD23]/10 dark:bg-[#86CD23]/20 px-3 py-2 rounded-full text-sm text-[#86CD23] border border-[#86CD23]/30">
                  <span className="truncate max-w-[160px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-2 font-bold hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Attachment Button */}
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                <label className="cursor-pointer p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Paperclip size={20} />
                  <input
                    ref={inputFileRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                if (!subject.trim() || !content.trim()) {
                  setModal({
                    type: "error",
                    message: "Please provide both subject and message content.",
                  });
                  return;
                }
                setShowConfirm(true);
              }}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#86CD23] hover:bg-[#7ab520] text-black font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="31.415,31.415"
                    />
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-[#141414] rounded-xl p-6 w-full max-w-sm shadow-xl text-center animate-fadeIn border border-gray-200 dark:border-gray-700">
            <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={40} />
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Confirm Message
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to send this message to the CEO? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg bg-[#86CD23] hover:bg-[#7ab520] text-black font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {modal && (
        <CustomModal
          type={modal.type}
          message={modal.message}
          onClose={() => {
            if (modal.type === "success") {
              setModal(null);
            } else {
              setModal(null);
            }
          }}
        />
      )}
    </>
  );
}
