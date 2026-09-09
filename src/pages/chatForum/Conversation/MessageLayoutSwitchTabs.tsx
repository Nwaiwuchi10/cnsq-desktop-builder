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
    <div className="flex overflow-x-auto no-scrollbar w-full mb-4">
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 min-w-max w-full">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-[70px] px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-1.5
              ${activeTab === tab.key
                ? "bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className="flex items-center justify-center bg-[#F58220] text-white text-[10px] font-bold rounded-full w-5 h-5"
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessagesTabs;
