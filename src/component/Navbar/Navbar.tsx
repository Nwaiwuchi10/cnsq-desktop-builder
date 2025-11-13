"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Bell, MessageCircle } from "lucide-react";
import imgHome from "../../assests/images/CNSQ.png";
import Image from "next/image";
import Api from "@/utils/api"; // axios wrapper
import MessageCeoModal from "../MessageCEO/MessageCEO";

type User = {
  uuid: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
};

const navLinks = [
  // { name: "Home", href: "/" },
  { name: "Staff", href: "/staff" },
  { name: "Birthday", href: "/birthday" },
  { name: "Anniversary", href: "/anniversary" },
  { name: "Organogram", href: "/" },
  { name: "Message", href: "/chat" },
  { name: "Project", href: "/project" },
];

export default function Navbar() {
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

  //  Fetch user profile
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
        setUnreadCount(res.data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch unread count", error);
      }
    };

    fetchUnreadCount();

    // optional: auto-refresh every 60 seconds
    const interval = setInterval(fetchUnreadCount, 2000);
    return () => clearInterval(interval);
  }, []);
  // 🔹 Fetch unread chat messages
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (!token) return;

    const fetchChatUnread = async () => {
      try {
        const res = await Api.get("/chat/unread-total/all/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response:", res.data); // should log 2
        setChatUnreadCount(res.data);
      } catch (error) {
        console.error("Failed to fetch chat unread count", error);
      }
    };

    fetchChatUnread();

    // optional: auto-refresh every 10 seconds
    const interval = setInterval(fetchChatUnread, 1000);
    return () => clearInterval(interval);
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

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user-token");
    }
    setUser(null);
    window.location.href = "/login";
  };

  const getAvatar = () => {
    if (user?.photoUrl) {
      return (
        <Image
          src={user.photoUrl}
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
      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/*  Logo */}
            <Link href="/" className="text-2xl font-bold text-blue-600">
              <Image
                src={imgHome}
                alt="logo"
                width={120}
                height={60}
                unoptimized
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex space-x-11 justify-end w-full max-w-2xl items-center ml-24">
                {navLinks.map((link) => (
                  <div key={link.name} className="relative inline-block">
                    <Link
                      href={link.href}
                      className="text-lg text-gray-700 hover:text-[#95D700] transition-colors"
                    >
                      {link.name}
                    </Link>

                    {link.name === "Message" && chatUnreadCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-[#FF990C] text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center">
                        {chatUnreadCount}
                      </span>
                    )}
                  </div>
                ))}

                <div>
                  {" "}
                  {user && (
                    <Link href="/notifications" className="relative left-9">
                      <Bell
                        className="text-gray-700 hover:text-[#95D700]"
                        size={22}
                      />
                      {unreadCount > 0 && (
                        <span
                          className="bg-[#FF990C]  absolute -top-2 -right-2 text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center"
                          // style={{ backgroundColor: "#FF990C" }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
                {/* Notification Bell + Count */}

                {/*  User Profile */}
                {user ? (
                  <div className="relative z-50" ref={dropdownRef}>
                    <div className="flex items-center gap-2 focus:outline-none">
                      <button
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-2 focus:outline-none pl-2"
                      >
                        {getAvatar()}
                        <span className="hidden md:inline font-medium text-gray-700 pl-2">
                          {user.firstName}
                        </span>
                        {/* ///// Notification Bell + Count */}
                      </button>
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-2">
                        <Link
                          href={`/staff/${user?.uuid}`}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          View Profile
                        </Link>
                        <Link
                          href={`/change-password`}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Change Password
                        </Link>
                        <div
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={() => setIsOpenModal(true)}
                        >
                          Urgent Message to the CEO
                        </div>
                        <button
                          style={{ cursor: "pointer" }}
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-lg text-gray-700 hover:text-[#95D700] transition"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Button + Notification */}
            <div className="md:hidden flex items-center gap-4">
              {/* 🔹 Message Icon */}
              <Link href="/chat" className="relative">
                <MessageCircle
                  className="text-gray-700 hover:text-[#95D700]"
                  size={22}
                />{" "}
                {/* replace with Message icon */}
                {chatUnreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FF990C] text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {chatUnreadCount}
                  </span>
                )}
              </Link>
              {user && (
                <Link href="/notifications" className="relative">
                  <Bell
                    className="text-gray-700 hover:text-[#95D700]"
                    size={22}
                  />
                  {unreadCount > 0 && (
                    <span
                      className="bg-[#FF990C] absolute -top-2 -right-2 text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center"
                      // style={{ backgroundColor: "#FF990C" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-[#95D700] focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white shadow-lg h-screen">
            <div className="flex flex-col items-start px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <div key={link.name} className="relative w-full">
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-gray-700 hover:text-[#95D700] transition"
                  >
                    {link.name}
                  </Link>

                  {/* {link.name === "Message" && chatUnreadCount > 0 && (
                    <span className="bg-red-500 absolute -top-2 left-24 text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center">
                      {chatUnreadCount}
                    </span>
                  )} */}
                </div>
              ))}

              {!loading &&
                (user ? (
                  <div className="w-full">
                    <div className="flex items-center gap-3 mb-4">
                      {getAvatar()}
                      <span className="font-medium text-gray-700">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>

                    <Link
                      href={`/staff/${user?.uuid}`}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-gray-700 hover:text-blue-600"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/change-password`}
                      className="block py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Change Password
                    </Link>
                    <div
                      className="block py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => setIsOpenModal(true)}
                    >
                      Urgent Message to the CEO
                    </div>
                    <button
                      style={{ cursor: "pointer" }}
                      onClick={handleLogout}
                      className="block py-2 text-left text-gray-700 hover:text-blue-600"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-gray-700 hover:text-[#95D700] transition"
                  >
                    Login
                  </Link>
                ))}
            </div>
          </div>
        )}
      </nav>
      {isOpenModal && (
        <MessageCeoModal
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(false)}
        />
      )}
    </>
  );
}
