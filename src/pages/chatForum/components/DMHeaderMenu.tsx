"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Info,
  Search,
  CheckSquare,
  BellOff,
  Clock,
  Heart,
  ListPlus,
  XCircle,
  Link,
  PhoneCall,
  Flag,
  UserX,
  Eraser,
  Trash2,
} from "lucide-react";

interface DMHeaderMenuProps {
  onContactInfo: () => void;
  onSearch: () => void;
  onSelectMessages: () => void;
  onMuteNotifications: () => void;
  onDisappearingMessages: () => void;
  onAddToFavorites: () => void;
  onAddToList: () => void;
  onCloseChat: () => void;
  onSendCallLink: () => void;
  onNewGroupCall: () => void;
  onReport: () => void;
  onBlock: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
}

export const DMHeaderMenu: React.FC<DMHeaderMenuProps> = ({
  onContactInfo,
  onSearch,
  onSelectMessages,
  onMuteNotifications,
  onDisappearingMessages,
  onAddToFavorites,
  onAddToList,
  onCloseChat,
  onSendCallLink,
  onNewGroupCall,
  onReport,
  onBlock,
  onClearChat,
  onDeleteChat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  type MenuItem = {
    label?: string;
    icon?: any;
    action?: () => void;
    divider?: boolean;
    danger?: boolean;
  };

  const menuItems: MenuItem[] = [
    { label: "Contact info", icon: Info, action: onContactInfo },
    { label: "Search", icon: Search, action: onSearch },
    // { label: "Select messages", icon: CheckSquare, action: onSelectMessages },
    // { label: "Mute notifications", icon: BellOff, action: onMuteNotifications },
    // { label: "Disappearing messages", icon: Clock, action: onDisappearingMessages },
    // { label: "Add to Favorites", icon: Heart, action: onAddToFavorites },
    // { label: "Add to list", icon: ListPlus, action: onAddToList },
    { label: "Close chat", icon: XCircle, action: onCloseChat },
    { divider: true },
    // { label: "Send call link", icon: Link, action: onSendCallLink },
    // { label: "New group call", icon: PhoneCall, action: onNewGroupCall },
    // { divider: true },
    // { label: "Report", icon: Flag, action: onReport },
    // { label: "Block", icon: UserX, action: onBlock },
    // { label: "Clear chat", icon: Eraser, action: onClearChat },
    // { label: "Delete chat", icon: Trash2, action: onDeleteChat, danger: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        title="More options"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-64 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl py-2 z-50 transition-all transform origin-top-right">
          {menuItems.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`div-${index}`}
                  className="my-1 border-t border-gray-100 dark:border-gray-800"
                />
              );
            }
            if (!item.icon) return null;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setIsOpen(false);
                  item.action?.();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition text-left font-medium ${item.danger
                    ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                  }`}
              >
                <Icon size={18} className={item.danger ? "text-red-500" : "text-gray-500 dark:text-gray-400"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DMHeaderMenu;
