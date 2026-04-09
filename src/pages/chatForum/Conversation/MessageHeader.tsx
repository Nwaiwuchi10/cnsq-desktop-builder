"use client";
import React from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";

interface HeaderProps {
  name?: string;
  isOnline?: boolean;
  connectionDate?: string;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  name = "Contact",
  isOnline = false,
  connectionDate,
  onBack,
}) => {
  return (
    <header className="w-full bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 p-4 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onBack}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white text-base">
                {name}
              </div>
              <div
                className={`text-xs flex items-center gap-1 ${isOnline ? "text-green-500" : "text-gray-500"}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
                ></span>
                {isOnline ? "Online" : "Offline"}
              </div>
              {connectionDate && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {connectionDate}
                </div>
              )}
            </div>
          </div>
        </div>
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <MoreVertical
            size={20}
            className="text-gray-600 dark:text-gray-400"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
