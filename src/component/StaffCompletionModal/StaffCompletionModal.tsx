"use client";

import { X } from "lucide-react";

interface CompletionData {
  staffId: number;
  staffName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  performance: {
    level: "GREEN" | "YELLOW" | "RED" | "PINK";
    colorCode: string;
    label: "Excellent" | "Moderate" | "Needs Attention" | "Available";
  };
}

interface StaffCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CompletionData | null;
}

export default function StaffCompletionModal({
  isOpen,
  onClose,
  data,
}: StaffCompletionModalProps) {
  if (!isOpen || !data) return null;

  const getPerformanceMessage = () => {
    switch (data.performance.level) {
      case "GREEN":
        return `${data.staffName} is almost done with their tasks. Excellent progress with ${data.completionRate}% completion rate.`;
      case "YELLOW":
        return `${data.staffName} is slightly busy. Currently at ${data.completionRate}% task completion. Support may be available if needed.`;
      case "RED":
        return `${data.staffName} is currently busy with multiple tasks. At ${data.completionRate}% completion rate. Approach with caution.`;
      case "PINK":
        return `${data.staffName} is available for new tasks. At ${data.completionRate}% completion rate.`;
      default:
        return "";
    }
  };

  const getStatusLabel = () => {
    switch (data.performance.level) {
      case "GREEN":
        return "Almost Done";
      case "YELLOW":
        return "Slightly Busy";
      case "RED":
        return "Currently Busy";
      case "PINK":
        return "Available";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/80 transition-colors flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Status */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Staff Status</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{data.staffName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="w-full h-px bg-gray-200 dark:bg-gray-800 transition-colors mb-4"></div>

        {/* Status Badge - Prominent */}
        <div
          className="p-4 rounded-xl mb-6 text-white"
          style={{ backgroundColor: data.performance.colorCode }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full"
                style={{
                  backgroundColor: data.performance.colorCode,
                  opacity: 0.3,
                }}
              />
            </div>
            <div>
              <p className="text-xs font-semibold opacity-90">CURRENT STATUS</p>
              <p className="text-2xl font-bold">{getStatusLabel()}</p>
            </div>
          </div>
        </div>

        {/* Completion Rate Progress */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Task Completion
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: data.performance.colorCode }}
            >
              {data.completionRate}%
            </p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 transition-colors rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${data.completionRate}%`,
                backgroundColor: data.performance.colorCode,
              }}
            />
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 dark:bg-gray-800 transition-colors p-3 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Completed</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {data.completedTasks}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              of {data.totalTasks} tasks
            </p>
          </div>
          <div
            className="p-3 rounded-lg text-white"
            style={{
              backgroundColor: `${data.performance.colorCode}20`,
              borderLeft: `3px solid ${data.performance.colorCode}`,
            }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: data.performance.colorCode }}
            >
              Pending
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: data.performance.colorCode }}
            >
              {data.totalTasks - data.completedTasks}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: data.performance.colorCode, opacity: 0.7 }}
            >
              remaining
            </p>
          </div>
        </div>

        {/* Status Message */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-800 mb-5">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-[#78B500]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
