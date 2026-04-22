"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
} from "lucide-react";
import Api from "@/utils/api";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import CustomModal from "@/component/Message/Message";

interface MessageCeo {
  id: string;
  subject: string;
  content: string;
  sender?: {
    firstName: string;
    lastName: string;
  };
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  category?: string;
  isRead?: boolean;
  repliedAt?: string;
  replyContent?: string;
  replyAttachments?: string[];
  replier?: {
    firstName: string;
    lastName: string;
  };
}

const CEOCornerMessages: React.FC = () => {
  const [messages, setMessages] = useState<MessageCeo[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageCeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isCeo, setIsCeo] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageCeo | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  useEffect(() => {
    checkRoleAndFetch();
  }, []);

  useEffect(() => {
    let filtered = messages;
    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.content.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (filterType !== "all") {
      filtered = filtered.filter((msg) => {
        if (filterType === "sent") return !msg.replyContent;
        if (filterType === "replied") return !!msg.replyContent;
        return true;
      });
    }
    setFilteredMessages(filtered);
  }, [messages, searchTerm, filterType]);

  const checkRoleAndFetch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("user-token");
      const profileRes = await Api.get("/staff-register/staff/viewProfile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userIsCeo = profileRes.data.isCeo;
      setIsCeo(userIsCeo);

      const endpoint = userIsCeo ? "/messageceo/for-ceo" : "/messageceo/my-messages";
      const msgRes = await Api.get<MessageCeo[]>(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(msgRes?.data || []);
    } catch (error) {
      console.error("Error fetching context/messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;

    setSubmittingReply(true);
    try {
      const token = localStorage.getItem("user-token");
      const formData = new FormData();
      formData.append("dto", JSON.stringify({ content: replyContent }));

      if (replyFiles && replyFiles.length > 0) {
        replyFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      await Api.patch(`/messageceo/${replyingTo.id}/reply`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Reply sent successfully", formData);
      setReplyingTo(null);
      setReplyContent("");
      setReplyFiles([]);
      checkRoleAndFetch();
      setModalConfig({ isOpen: true, type: "success", message: "Your reply has been successfully sent!" });
    } catch (error) {
      console.error("Failed to submit reply:", error);
      setModalConfig({ isOpen: true, type: "error", message: "Failed to send reply. Please try again." });
    } finally {
      setSubmittingReply(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-500 border border-red-200";
      case "MEDIUM":
        return "bg-orange-100 text-orange-500 border border-orange-200";
      case "LOW":
        return "bg-green-100 text-green-500 border border-green-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <StaffLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            CEO's Corner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isCeo ? "Messages received from your staff" : "Direct communication channel with the CEO"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#86CD23] transition-colors"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#86CD23] transition-colors cursor-pointer flex items-center gap-2"
            >
              <option value="all">All messages</option>
              <option value="sent">Sent</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {!isCeo && (
            <Link
              href="/ceos-corner/create"
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-lg bg-[#86CD23] hover:bg-[#7ab520] text-black font-semibold transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              New Message
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Message History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your previous communications {isCeo ? "with staff" : "with the CEO"}
          </p>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No messages match your search.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="p-6 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1a1a1a] shadow-sm relative">

                  {/* Top Bar: Title & Badges */}
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {msg.subject}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isCeo ? `From: ${msg.sender?.firstName || 'Unknown'} ${msg.sender?.lastName || ''}` : `To: CEO`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {msg.priority && (
                        <span className={`px-3 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(msg.priority)}`}>
                          {msg.priority}
                        </span>
                      )}
                      {!!msg.replyContent ? (
                        <span className="px-3 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#86CD23]/20 text-[#6bb012] border border-[#86CD23]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Replied
                        </span>
                      ) : msg.isRead ? (
                        <span className="px-3 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-500 border border-blue-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Read
                        </span>
                      ) : (
                        <span className="px-3 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{msg.category || "General"}</p>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {msg.attachments.map((file, idx) => (
                        <a key={idx} href={file} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-blue-500 transition-colors inline-block">
                          View Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 w-full mb-2">
                    <span>Sent: {formatDate(msg.createdAt)}</span>
                  </div>

                  <hr className="border-gray-200 dark:border-gray-800 my-4" />

                  {msg.replyContent && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-[#86CD23]/20 p-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-[#86CD23]" />
                        </div>
                        <span className="text-[#86CD23] font-bold text-sm">
                          CEO Reply {msg.replier ? `(${msg.replier.firstName} ${msg.replier.lastName})` : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed ml-7 whitespace-pre-wrap">
                        {msg.replyContent}
                      </p>
                      {msg.replyAttachments && msg.replyAttachments.length > 0 && (
                        <div className="ml-7 mt-3 flex flex-wrap gap-2">
                          {msg.replyAttachments.map((file, idx) => (
                            <a key={idx} href={file} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1a1a] dark:hover:bg-gray-800 rounded-lg text-[#86CD23] transition-colors border border-[#86CD23]/20 inline-block">
                              CEO Attachment {idx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2 ml-7">
                        {msg.repliedAt ? formatDate(msg.repliedAt) : ""}
                      </div>
                    </div>
                  )}

                  {/* Reply Button Footer */}
                  {isCeo && !msg.replyContent && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="bg-[#86CD23] hover:bg-[#7ab520] text-black text-sm font-bold flex items-center gap-2 px-5 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        <Send className="w-4 h-4" /> Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#141414] rounded-2xl w-full max-w-xl p-6 shadow-xl relative animate-fadeIn">
            <button
              onClick={() => { setReplyingTo(null); setReplyContent(""); setReplyFiles([]); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold dark:text-white mb-2">Reply to Message</h2>
            <p className="text-sm text-gray-500 mb-6">Subject: <span className="font-semibold text-gray-700 dark:text-gray-300">{replyingTo.subject}</span></p>

            <form onSubmit={handleReplySubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Reply</label>
                <textarea
                  required
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-[#86CD23]/30 focus:border-[#86CD23] outline-none min-h-[150px] dark:text-white resize-y"
                  placeholder="Type your response here..."
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Attachments (up to 10)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const filesArray = Array.from(e.target.files).slice(0, 10);
                      setReplyFiles(filesArray);
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#86CD23]/10 file:text-[#86CD23] hover:file:bg-[#86CD23]/20"
                />
                {replyFiles.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">{replyFiles.length} file(s) selected.</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setReplyingTo(null); setReplyContent(""); setReplyFiles([]); }}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="px-6 py-2.5 rounded-xl font-bold bg-[#86CD23] hover:bg-[#7ab520] text-black transition-colors shadow-lg shadow-[#86CD23]/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingReply ? "Sending..." : "Send Reply"} <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      {modalConfig.isOpen && (
        <CustomModal
          type={modalConfig.type}
          message={modalConfig.message}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        />
      )}
    </StaffLayout>
  );
};

export default CEOCornerMessages;
