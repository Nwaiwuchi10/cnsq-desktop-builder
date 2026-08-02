"use client";

import React, { useState } from "react";
import { Clock, Calendar, X, Check } from "lucide-react";
import Api from "@/utils/api";

interface MessageReminderModalProps {
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MessageReminderModal: React.FC<MessageReminderModalProps> = ({
  conversationId,
  isOpen,
  onClose,
}) => {
  const [text, setText] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // 1 = Monday
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const token = localStorage.getItem("user-token");
    try {
      setLoading(true);
      await Api.post(
        "/chat/scheduled-messages",
        {
          conversationId,
          text,
          frequency,
          scheduledTime,
          dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg("Reminder scheduled successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        setText("");
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to schedule reminder:", err);
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { label: "Sunday", val: 0 },
    { label: "Monday", val: 1 },
    { label: "Tuesday", val: 2 },
    { label: "Wednesday", val: 3 },
    { label: "Thursday", val: 4 },
    { label: "Friday", val: 5 },
    { label: "Saturday", val: 6 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Clock size={22} className="text-lime-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              Schedule Message Routine
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center flex flex-col items-center gap-2 text-lime-600 dark:text-lime-400 font-semibold">
            <Check size={36} className="text-lime-500 animate-bounce" />
            <p>{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Reminder Message
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Daily Standup sync reminder or Weekly progress report update..."
                required
                rows={3}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Routine Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as "daily" | "weekly")
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
                >
                  <option value="daily">Daily Routine</option>
                  <option value="weekly">Weekly Routine</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Time (HH:mm)
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
                />
              </div>
            </div>

            {frequency === "weekly" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Day of Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-lime-500 transition"
                >
                  {days.map((d) => (
                    <option key={d.val} value={d.val}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-lime-500 hover:bg-lime-600 text-black text-sm font-semibold rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Calendar size={16} />
                <span>{loading ? "Scheduling..." : "Save Routine"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MessageReminderModal;
