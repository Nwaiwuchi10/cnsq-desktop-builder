"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Moon, Sun, MessageCircle } from "lucide-react";
import Image from "next/image";
import Api from "@/utils/api";
import { getChatSocket, initChatSocket } from "@/utils/chatSocket";
import AnnouncementModal from "@/pages/Notification/AnnouncementModal";

interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  relatedProductDemo?: { id: number };
  relatedAnnouncement?: { id: number };
}

type User = {
  uuid: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
};

interface HeaderProps {
  user?: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const pathname = usePathname();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<string>("light");
  const [mounted, setMounted] = useState(false);
  const [activeNotification, setActiveNotification] = useState<NotificationData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize theme from localStorage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const getPageTitle = () => {
    const pathMap: { [key: string]: string } = {
      "/staff-dashboard": "Dashboard",
      "/birthday": "Birthdays",
      "/anniversary": "Anniversaries",
      "/new-hire": "New Hires",
      "/project": "Projects",
      "/task": "Tasks",
      "/chat": "Chat",
      "/ceos-corner": "CEO's Corner",
      "/calender": "Calendar",
      "/notifications": "Notifications",
      "/heads-of-departments": "Heads of Departments",
      "/organogram": "Organogram",
      "/staff": "Staff Directory",
      "/settings": "Settings",
    };

    if (!pathname) return "Dashboard";

    // Check if current path matches any map entry
    for (const [path, title] of Object.entries(pathMap)) {
      if (pathname === path || pathname.startsWith(path + "/")) {
        return title;
      }
    }

    // Default to Dashboard
    return "Dashboard";
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("user-token");
        if (token) {
          await Api.post("/staff-register/logout", {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } catch (error) {
        console.error("Logout request failed:", error);
      } finally {
        localStorage.removeItem("user-token");
        localStorage.removeItem("userId");
        window.location.href = "/presignin";
      }
    }
  };

  // 🔹 Realtime chat unread count via Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    const storedUserId = localStorage.getItem("userId");
    if (!token || !storedUserId) return;

    initChatSocket(Number(storedUserId));

    const socket = getChatSocket();
    if (!socket) return;

    socket.on("chat:unreadCount", (data: { total: number }) => {
      setChatUnreadCount(
        typeof data === "object" ? (data.total ?? 0) : (Number(data) ?? 0),
      );
    });

    return () => {
      socket.off("chat:unreadCount");
    };
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await Api.get("/notification/unread-count/recipient", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res?.data?.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch unread count", error);
      }
    };

    fetchUnreadCount();
  }, []);

  // 🔹 Fetch unread chat messages
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    const fetchChatUnread = async () => {
      try {
        const res = await Api.get("/chat/unread-total/user/all/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatUnreadCount(res.data?.total ?? Number(res.data) ?? 0);
      } catch (error) {
        console.error("Failed to fetch chat unread count", error);
      }
    };

    fetchChatUnread();
  }, []);

  // Fetch special announcement notices
  useEffect(() => {
    const fetchSpecialNotices = async () => {
      try {
        const recipientId = localStorage.getItem("userId");
        if (!recipientId) return;

        const res = await Api.get(
          `/notification/special/notice?recipientId=${recipientId}`,
        );
        const notifications: NotificationData[] = res.data;

        const now = new Date().getTime();
        const recentNotices = notifications.filter((n) => {
          const createdTime = new Date(n.createdAt).getTime();
          const isWithin24Hrs = now - createdTime <= 24 * 60 * 60 * 1000;

          const closed = localStorage.getItem(`closed_notification_${n.id}`);
          const showCount =
            Number(localStorage.getItem(`shown_count_${n.id}`)) || 0;

          // Show only if within 24h, not closed, and shown less than twice
          return isWithin24Hrs && !closed && showCount < 2;
        });

        if (recentNotices.length > 0) {
          const firstNotice = recentNotices[0];

          // Increment show count each time the modal appears
          const currentCount =
            Number(localStorage.getItem(`shown_count_${firstNotice.id}`)) || 0;
          localStorage.setItem(
            `shown_count_${firstNotice.id}`,
            String(currentCount + 1),
          );

          setActiveNotification(firstNotice);
        }
      } catch (error) {
        console.error("Error fetching special notices:", error);
      }
    };

    fetchSpecialNotices();
  }, []);

  const handleCloseModal = () => {
    if (activeNotification) {
      localStorage.setItem(
        `closed_notification_${activeNotification.id}`,
        "true",
      );
      setActiveNotification(null);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-gray-800 transition-colors">
      <h2 className="text-lg sm:text-xl font-bold text-[#86CD23] ml-8 sm:ml-0 truncate">
        {getPageTitle()}
      </h2>

      <div className="flex flex-1 justify-end items-center gap-6">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 w-72 transition-colors">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search by role, location........"
            className="bg-transparent border-none outline-none text-sm w-full dark:text-white"
          />
        </div>

        {/* Notifications & Messages cluster */}
        <div className="flex items-center gap-4">
          <Link
            href="/notifications"
            className="relative cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/chat"
            className="relative cursor-pointer hover:opacity-80 transition-opacity"
          >
            <MessageCircle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {chatUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

        {/* User Info */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="hidden sm:inline text-sm font-medium dark:text-white transition-colors">
              {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
            </span>
            {user?.photoUrl ? (
              <Image
                src={user.photoUrl}
                alt="profile"
                width={32}
                height={32}
                className="rounded-full object-cover h-8 w-8"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#a1e508] text-black font-semibold text-sm uppercase">
                {user
                  ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`
                  : "U"}
              </div>
            )}
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#141414] rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-fadeIn">
              <div className="py-1">
                {user && (
                  <Link
                    href={`/staff/${user.uuid}`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    View Profile
                  </Link>
                )}
                <Link
                  href="/change-password"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Change Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle Theme"
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-5 h-5 text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Auto popup modal with friendly display limit */}
      {activeNotification && (
        <AnnouncementModal
          notification={activeNotification as any}
          onClose={handleCloseModal}
        />
      )}
    </header>
  );
};

export default Header;
