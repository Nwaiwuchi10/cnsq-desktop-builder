"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, X, Check, Play, Pause, Trash2 } from "lucide-react";
import Api from "@/utils/api";
import CustomModal from "@/component/Message/Message";

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
  const [routines, setRoutines] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);
  const [deleteRoutineText, setDeleteRoutineText] = useState("");
  const [deletingRoutine, setDeletingRoutine] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchRoutines = async () => {
    if (!conversationId) return;
    const token = localStorage.getItem("user-token");
    try {
      setFetching(true);
      const res = await Api.get(
        `/chat/scheduled-messages/conversation/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoutines(res.data || []);
    } catch (err) {
      console.error("Failed to fetch scheduled routines:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRoutines();
    }
  }, [isOpen, conversationId]);

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
      fetchRoutines();
      setTimeout(() => {
        setSuccessMsg("");
        setText("");
      }, 1500);
    } catch (err) {
      console.error("Failed to schedule reminder:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (routineId: string) => {
    const token = localStorage.getItem("user-token");
    try {
      await Api.patch(
        `/chat/scheduled-messages/${routineId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRoutines();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to toggle routine.";
      setErrorMsg(errMsg);
    }
  };

  const confirmDelete = (routineId: string, routineText: string) => {
    setDeleteRoutineId(routineId);
    setDeleteRoutineText(routineText);
  };

  const handleDelete = async () => {
    if (!deleteRoutineId) return;
    const token = localStorage.getItem("user-token");
    try {
      setDeletingRoutine(true);
      await Api.delete(
        `/chat/scheduled-messages/${deleteRoutineId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeleteRoutineId(null);
      setDeleteRoutineText("");
      setFeedbackModal({ type: "success", message: "Routine deleted successfully!" });
      fetchRoutines();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to delete routine.";
      setDeleteRoutineId(null);
      setErrorMsg(errMsg);
    } finally {
      setDeletingRoutine(false);
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

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transition-all p-6 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={22} className="text-lime-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              Message Routines & Reminders
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-1">
          {successMsg && (
            <div className="py-2 text-center flex items-center justify-center gap-2 text-lime-600 dark:text-lime-400 font-semibold bg-lime-50 dark:bg-lime-950/30 rounded-xl">
              <Check size={20} className="text-lime-500" />
              <p>{successMsg}</p>
            </div>
          )}

          {/* Form to Schedule Routine */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Reminder Message
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Daily Standup sync reminder or Weekly progress report update..."
                required
                rows={2}
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

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-lime-500 hover:bg-lime-600 text-black text-sm font-semibold rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Calendar size={16} />
                <span>{loading ? "Scheduling..." : "Save Routine"}</span>
              </button>
            </div>
          </form>

          {/* Active Routines List */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Active & Paused Routines ({routines.length})
            </h4>

            {fetching && routines.length === 0 ? (
              <p className="text-sm text-gray-400">Loading routines...</p>
            ) : routines.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">No message routines scheduled for this conversation.</p>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {routines.map((r) => {
                  const dayName = r.frequency === "weekly" && r.dayOfWeek !== undefined
                    ? days.find((d) => d.val === r.dayOfWeek)?.label || "Monday"
                    : "";

                  return (
                    <div
                      key={r.id}
                      className="flex items-start justify-between gap-4 p-3 bg-gray-50 dark:bg-[#1b1b1b] border border-gray-100 dark:border-gray-800 rounded-xl hover:border-gray-200 dark:hover:border-gray-700 transition"
                    >
                      <div className="space-y-1">
                        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                          {r.text}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full capitalize">
                            {r.frequency}
                          </span>
                          <span>at {r.scheduledTime}</span>
                          {r.frequency === "weekly" && <span>on {dayName}</span>}
                          
                          {r.isActive ? (
                            <span className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                              Paused
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggle(r.id)}
                          title={r.isActive ? "Pause" : "Resume"}
                          className={`p-2 rounded-lg transition ${
                            r.isActive
                              ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                              : "text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30"
                          }`}
                        >
                          {r.isActive ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button
                          onClick={() => confirmDelete(r.id, r.text)}
                          title="Stop / Delete"
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1a1a1a] border border-red-200 dark:border-red-950 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 transform scale-100 transition-all">
            <div className="flex items-center gap-2 text-red-500 font-semibold">
              <span className="text-xl">⚠️</span>
              <h4>Action Denied</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{errorMsg}</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setErrorMsg("")}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-200 transition"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Delete Confirmation Modal */}
      {deleteRoutineId && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-2xl w-full max-w-sm p-6 relative text-center border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => { setDeleteRoutineId(null); setDeleteRoutineText(""); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <Trash2 size={28} className="text-red-500" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Routine?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Are you sure you want to stop and delete this routine?
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-6 line-clamp-2">
              &quot;{deleteRoutineText}&quot;
            </p>
            <p className="text-xs text-red-500 mb-6">This action cannot be undone.</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => { setDeleteRoutineId(null); setDeleteRoutineText(""); }}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingRoutine}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60"
              >
                {deletingRoutine ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackModal && (
        <CustomModal
          type={feedbackModal.type}
          message={feedbackModal.message}
          onClose={() => setFeedbackModal(null)}
        />
      )}
    </>
  );
};

export default MessageReminderModal;
