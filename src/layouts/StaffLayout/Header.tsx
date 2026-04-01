"use client";

import React from "react";
import { useTheme } from "@/hooks/ThemeContext";
import { Search, Bell, Moon, Sun } from "lucide-react";
import Image from "next/image";

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
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-gray-800 transition-colors">
      <h2 className="text-xl font-bold text-[#86CD23]">Dashboard</h2>

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

        {/* Notifications */}
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

        {/* User Info */}
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="hidden sm:inline text-sm font-medium dark:text-white transition-colors">
            {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
          </span>
          {user?.photoUrl ? (
             <Image src={user.photoUrl} alt="profile" width={32} height={32} className="rounded-full object-cover h-8 w-8" unoptimized />
          ) : (
             <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#a1e508] text-black font-semibold text-sm uppercase">
               {user ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}` : "U"}
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
    </header>
  );
};

export default Header;
