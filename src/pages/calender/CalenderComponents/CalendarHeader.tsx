"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Menu, ArrowLeft } from "lucide-react";
import { MONTHS } from "@/utils/calendarDateUtils";

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigate: (direction: "prev" | "next" | "today") => void;
  view: "day" | "week" | "month";
  onViewChange: (view: "day" | "week" | "month") => void;
  onToggleSidebar?: () => void;
  onGoBack?: () => void;
  showOnlyMine?: boolean;
  onToggleShowOnlyMine?: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onNavigate,
  view,
  onViewChange,
  onToggleSidebar,
  onGoBack,
  showOnlyMine = false,
  onToggleShowOnlyMine,
}) => {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors">
      <div className="flex items-center gap-2 md:gap-6">
        {onGoBack && (
          <button
            onClick={onGoBack}
            className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        )}

        <button
          onClick={onToggleSidebar}
          className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu size={24} className="text-gray-600 dark:text-gray-300" />
        </button>

        <h1 className="hidden sm:block text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
          Calendar
        </h1>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => onNavigate("today")}
            className="px-2 md:px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
            <button
              onClick={() => onNavigate("prev")}
              className="p-1 md:px-2 border-r border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => onNavigate("next")}
              className="p-1 md:px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <h2 className="text-sm md:text-xl font-semibold text-gray-700 dark:text-gray-200 ml-1 truncate max-w-[120px] md:max-w-none">
            {currentDate
              ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : "Loading..."}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mr-2">
          <button
            onClick={() => showOnlyMine && onToggleShowOnlyMine?.()}
            className={`px-3 md:px-4 py-1 rounded-md text-[10px] md:text-sm font-semibold transition-all ${
              !showOnlyMine
                ? "bg-white dark:bg-[#1a1a1a] shadow-sm text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
            }`}
          >
            All Staff
          </button>
          <button
            onClick={() => !showOnlyMine && onToggleShowOnlyMine?.()}
            className={`px-3 md:px-4 py-1 rounded-md text-[10px] md:text-sm font-semibold transition-all ${
              showOnlyMine
                ? "bg-white dark:bg-[#1a1a1a] shadow-sm text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
            }`}
          >
            My Meetings
          </button>
        </div>

        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(["day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3 md:px-4 py-1 rounded-md text-[10px] md:text-sm font-semibold capitalize transition-all ${
                view === v
                  ? "bg-white dark:bg-[#1a1a1a] shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;
