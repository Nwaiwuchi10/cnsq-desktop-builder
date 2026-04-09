"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import Api from "@/utils/api";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";

interface MessageCeo {
  id: string;
  subject: string;
  content: string;
  sender?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  category?: string;
  isRead?: boolean;
  hasReply?: boolean;
  repliedAt?: string;
}

const CEOCornerMessages: React.FC = () => {
  const [messages, setMessages] = useState<MessageCeo[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageCeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Filter messages when search term or filter changes
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
        if (filterType === "sent") return !msg.isRead;
        if (filterType === "replied") return msg.hasReply;
        return true;
      });
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, filterType]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("user-token");
      const res = await Api.get<MessageCeo[]>("/messageceo/my-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res?.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "LOW":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, length: number = 100) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  return (
    <StaffLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            CEO's Corner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Direct communication channel with the CEO
          </p>
        </div>

        {/* Search and New Message Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Search */}
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

          {/* Filter Dropdown */}
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

          {/* New Message Button */}
          <Link
            href="/ceos-corner/create"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-lg bg-[#86CD23] hover:bg-[#7ab520] text-black font-semibold transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            New Message
          </Link>
        </div>

        {/* Message History */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Message History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your previous communications with the CEO
          </p>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {messages.length === 0
                  ? "No messages yet. Start by sending a message to the CEO!"
                  : "No messages match your search."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors group cursor-pointer"
                >
                  {/* Header with title and badges */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#86CD23] transition-colors flex-1">
                      {message.subject}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {message.priority && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                            message.priority,
                          )}`}
                        >
                          {message.priority}
                        </span>
                      )}
                      {message.hasReply && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Replied
                        </span>
                      )}
                      {!message.isRead && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Read
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  {message.category && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {message.category}
                    </p>
                  )}

                  {/* Content preview */}
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {truncateText(message.content, 150)}
                  </p>

                  {/* Footer with meta info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100 dark:border-gray-700 gap-2 text-sm">
                    <div className="flex gap-4 text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Sent: {formatDate(message.createdAt)}
                      </span>
                      {message.hasReply && message.repliedAt && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Read: {formatDate(message.repliedAt)}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#86CD23] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default CEOCornerMessages;
