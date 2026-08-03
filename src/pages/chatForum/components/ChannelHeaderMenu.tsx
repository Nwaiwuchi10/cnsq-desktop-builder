"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  UserPlus,
  Info,
  Search,
  CheckSquare,
  BellOff,
  Clock,
  Heart,
  ListPlus,
  XCircle,
  Eraser,
  LogOut,
  Calendar,
} from "lucide-react";

interface ChannelHeaderMenuProps {
  onAddMember: () => void;
  onGroupInfo: () => void;
  onSearch: () => void;
  onSelectMessages: () => void;
  onMuteNotifications: () => void;
  onDisappearingMessages: () => void;
  onAddToFavorites: () => void;
  onAddToList: () => void;
  onScheduleReminder?: () => void;
  onCloseChat: () => void;
  onClearChat: () => void;
  onExitGroup: () => void;
}

export const ChannelHeaderMenu: React.FC<ChannelHeaderMenuProps> = ({
  onAddMember,
  onGroupInfo,
  onSearch,
  onSelectMessages,
  onMuteNotifications,
  onDisappearingMessages,
  onAddToFavorites,
  onAddToList,
  onScheduleReminder,
  onCloseChat,
  onClearChat,
  onExitGroup,
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
    { label: "Add member", icon: UserPlus, action: onAddMember },
    { label: "Group info", icon: Info, action: onGroupInfo },
    { label: "Search", icon: Search, action: onSearch },
    // { label: "Select messages", icon: CheckSquare, action: onSelectMessages },
    // { label: "Mute notifications", icon: BellOff, action: onMuteNotifications },
    // { label: "Disappearing messages", icon: Clock, action: onDisappearingMessages },
    // { label: "Add to Favorites", icon: Heart, action: onAddToFavorites },
    // { label: "Add to list", icon: ListPlus, action: onAddToList },
    { label: "Set message reminder", icon: Calendar, action: onScheduleReminder },
    { label: "Close chat", icon: XCircle, action: onCloseChat },
    { divider: true },
    // { label: "Clear chat", icon: Eraser, action: onClearChat },
    // { label: "Exit group", icon: LogOut, action: onExitGroup, danger: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        title="Channel options"
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
            const Icon = item.icon!;
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

export default ChannelHeaderMenu;
