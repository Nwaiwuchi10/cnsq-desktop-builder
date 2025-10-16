"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import imgHome from "../../assests/images/CNSQ.png";
import Image from "next/image";
import Api from "@/utils/api"; // axios wrapper
type User = {
  firstName: string;
  lastName: string;
  photoUrl?: string;
};

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Staff", href: "/staff" },
  { name: "Birthday", href: "/birthday" },
  { name: "Anniversary", href: "/anniversary" },
  { name: "Organogram", href: "/" },
  { name: "Project", href: "/project" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
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
            <div className="flex space-x-16 justify-end w-full max-w-2xl items-center ml-24">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg text-gray-700 hover:text-[#95D700] transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              {/* {!loading &&
                
                
                
                
                } */}
              {user ? (
                <div className="relative z-50" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    {getAvatar()}
                    <span className="hidden md:inline font-medium text-gray-700">
                      {user.firstName}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-2">
                      <Link
                        href={`/staff/${userId}`}
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
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
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-gray-700 hover:text-[#95D700] transition"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
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
                    href={`/staff/${userId}`}
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
  );
}
