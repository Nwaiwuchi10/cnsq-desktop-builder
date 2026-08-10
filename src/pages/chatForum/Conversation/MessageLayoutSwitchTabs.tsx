"use client";
import React from "react";

interface MessagesTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCounts?: {
    all?: number;
    dms?: number;
    channels?: number;
    mentions?: number;
    unread?: number;
    threads?: number;
  };
}

const MessagesTabs: React.FC<MessagesTabsProps> = ({
  activeTab,
  setActiveTab,
  unreadCounts,
}) => {
  const tabs = [
    { key: "all", label: "All", count: unreadCounts?.all },
    { key: "dms", label: "DMs", count: unreadCounts?.dms },
    { key: "channels", label: "Channels", count: unreadCounts?.channels },
    { key: "create", label: "+ Channel" },
    { key: "mentions", label: "Mentions", count: unreadCounts?.mentions },
    { key: "unread", label: "Unread", count: unreadCounts?.unread },
    { key: "threads", label: "Threads", count: unreadCounts?.threads },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-6 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5
            ${activeTab === tab.key
              ? "bg-lime-500 text-black shadow-sm scale-105"
              : "bg-gray-100 dark:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.key
                  ? "bg-black text-lime-400"
                  : "bg-red-500 text-white"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MessagesTabs;
