"use client";
import React from "react";

interface MessagesTabsProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const MessagesTabs: React.FC<MessagesTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { key: "all", label: "All" },
    // { key: "unread", label: "Unread" },
    { key: "channels", label: "Channels" },
    { key: "create", label: "+ Channel" },
  ];

  return (
    <div className="flex gap-3 mt-6 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-4 py-1 rounded-full text-sm  cursor-pointer
            ${
              activeTab === tab.key
                ? "bg-lime-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default MessagesTabs;
