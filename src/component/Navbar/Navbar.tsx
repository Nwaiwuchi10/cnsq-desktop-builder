"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Bell, MessageCircle } from "lucide-react";
import imgHome from "../../assests/images/CNSQ.png";
import Image from "next/image";
import Api from "@/utils/api"; // axios wrapper

import EnableNotificationsButton from "../EnableNotificationButton/EnableButtonComponent";
import { getChatSocket, initChatSocket } from "@/utils/chatSocket";
import { pushNotificationService } from "@/utils/pushNotification";
import { useChatStore } from "@/store/ChatStore";

type User = {
  uuid: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
};

const navLinks = [
  // { name: "Anniversary", href: "/anniversary" },
  { name: "Staff Directory", href: "/staff" },
  { name: "Organogram", href: "/organogram" },
];

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
  console.log("Unread chat Count:", chatUnreadCount);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const setOnlineStaff = useChatStore((s) => s.setOnlineStaff);

  // 🔹 Realtime chat unread count + online/offline status via Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    const storedUserId = localStorage.getItem("userId");
    if (!token || !storedUserId) return;

    initChatSocket(Number(storedUserId));

    const socket = getChatSocket();
    if (!socket) return;

    // Chat unread count
    socket.on("chat:unreadCount", (data: { total: number }) => {
      setChatUnreadCount(
        typeof data === "object" ? (data.total ?? 0) : (Number(data) ?? 0),
      );
    });

    // ── Real-time online presence ────────────────────────────────────────
    // Initial list of all currently-online user IDs
    socket.on("staff:online-list", (userIds: number[]) => {
      userIds.forEach((id) => setOnlineStaff(id, true));
    });

    // A staff member came online
    socket.on("staff:online", ({ userId }: { userId: number }) => {
      setOnlineStaff(userId, true);
    });

    // A staff member went offline
    socket.on("staff:offline", ({ userId }: { userId: number }) => {
      setOnlineStaff(userId, false);
    });
    // ────────────────────────────────────────────────────────────────────

    return () => {
      socket.off("chat:unreadCount");
      socket.off("staff:online-list");
      socket.off("staff:online");
      socket.off("staff:offline");
      socket.disconnect();
    };
  }, [setOnlineStaff]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("user-token");
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);

    if (!token) {
      setLoading(false);
      return;
    }

    Api.get("/staff-register/staff/viewProfile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("user-token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  //  Fetch unread notifications count
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
        console.log("API Response:", res.data); // should log 2
        setChatUnreadCount(res.data?.total ?? Number(res.data) ?? 0);
      } catch (error) {
        console.error("Failed to fetch chat unread count", error);
      }
    };

    fetchChatUnread();

    // optional: auto-refresh every 10 seconds
  }, []);

  // Close dropdown if clicked outside
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

  useEffect(() => {
    const autoSubscribe = async () => {
      const token = localStorage.getItem("user-token");
      if (!token) return;

      try {
        const alreadySubscribed = await pushNotificationService.isSubscribed();

        if (!alreadySubscribed) {
          await pushNotificationService.subscribe();
          console.log("Auto-subscribed to push");
        }
      } catch (err) {
        console.error("Auto-subscribe failed", err);
      }
    };

    autoSubscribe();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user-token");
    }
    setUser(null);
    window.location.href = "/presignin";
  };

  const getAvatar = () => {
    if (user?.photoUrl) {
      return (
        <Image
          src={user?.photoUrl}
          alt="profile"
          width={50}
          height={50}
          className="w-12 h-12 rounded-full object-cover"
          unoptimized
          style={{ cursor: "pointer" }}
        />
      );
    }
    const initials =
      (user?.firstName?.charAt(0).toUpperCase() || "") +
      (user?.lastName?.charAt(0).toUpperCase() || "");
    return (
      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
        {initials || "U"}
      </div>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-[#0d0d0d] shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto max-w-[1400px]">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 mt-2">
              <Image src={imgHome} alt="logo" width={140} height={70} unoptimized />
            </Link>

            {/* Desktop Center Links */}
            <div className="hidden md:flex flex-1 justify-center relative right-[3%]">
              <div className="flex space-x-12 items-center">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href} className="text-[16px] font-medium text-gray-700 dark:text-gray-300 hover:text-[#95D700] transition-colors tracking-tight">
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Right (Staff Grid Icon) */}
            <div className="hidden md:flex items-center justify-end space-x-6">

              {/* Grid Icon */}
              <button
                onClick={() => {
                  console.log("Navigating to /staff-dashboard-final");
                  router.push("/staff-dashboard");
                }}
                className="flex items-center justify-center hover:opacity-80 transition-opacity ml-2 focus:outline-none"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="9.5" y="2" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="17" y="2" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="2" y="9.5" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="17" y="9.5" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="2" y="17" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="9.5" y="17" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="17" y="17" width="5" height="5" rx="1" fill="#FC8102" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Button + Grid Icon */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => {
                  console.log("Navigating to /staff-dashboard");
                  router.push("/staff-dashboard");
                }}
                className="flex items-center justify-center focus:outline-none"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="9.5" y="2" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="17" y="2" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="2" y="9.5" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="17" y="9.5" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="2" y="17" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="9.5" y="17" width="5" height="5" rx="1" fill="#FC8102" />
                  <rect x="17" y="17" width="5" height="5" rx="1" fill="#FC8102" />
                </svg>
              </button>
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-300 hover:text-[#95D700] focus:outline-none">
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-[#141414] shadow-2xl h-screen absolute w-full left-0 top-20 border-t border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex flex-col items-start px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <div key={link.name} className="relative w-full">
                  <Link href={link.href} onClick={() => setIsOpen(false)} className="text-xl font-medium text-gray-700 dark:text-gray-300 hover:text-[#95D700] transition block w-full">
                    {link.name}
                  </Link>
                </div>
              ))}

              {!loading && (user ? (
                <div className="w-full border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    {getAvatar()}
                    <span className="font-bold text-gray-800 dark:text-gray-200 text-lg tracking-tight">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </div>
                  <Link href={`/staff/${user?.uuid}`} onClick={() => setIsOpen(false)} className="block py-3 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">
                    View Profile
                  </Link>
                  <Link href={`/change-password`} className="block py-3 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition" onClick={() => setIsDropdownOpen(false)}>
                    Change Password
                  </Link>
                  <Link href="/ceos-corner" className="block py-3 font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition cursor-pointer" onClick={() => setIsOpen(false)}>
                    Urgent Message to the CEO
                  </Link>
                  <div className="cursor-pointer block font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition mt-2">
                    <EnableNotificationsButton />
                  </div>
                  <button style={{ cursor: "pointer" }} onClick={handleLogout} className="block w-full py-3 mt-4 text-left font-bold text-red-600 hover:text-red-700 transition">
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} className="text-xl font-bold text-gray-800 dark:text-gray-200 hover:text-[#95D700] transition border-t border-gray-100 dark:border-gray-800 pt-6 w-full inline-block">
                  Login
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
