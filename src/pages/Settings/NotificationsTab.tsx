"use client";

import React, { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import Api from "@/utils/api";
import CustomModal from "@/component/Message/Message";

export default function NotificationsTab() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    projectUpdates: true,
    taskReminders: true,
    celebrationAlerts: true,
    weeklyReport: false,
  });

  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  // Fetch settings from backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("user-token");
      const res = await Api.get("/notification-settings/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setSettings({
          emailNotifications: res.data.emailNotifications ?? true,
          projectUpdates: res.data.projectUpdates ?? true,
          taskReminders: res.data.taskReminders ?? true,
          celebrationAlerts: res.data.celebrationAlerts ?? true,
          weeklyReport: res.data.weeklyReport ?? false,
        });
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggle = async (key: keyof typeof settings) => {
    const previousValue = settings[key];
    const updatedSettings = {
      ...settings,
      [key]: !previousValue,
    };
    
    // Update local state immediately for responsiveness
    setSettings(updatedSettings);
    
    // Call API immediately
    try {
      const token = localStorage.getItem("user-token");
      await Api.patch("/notification-settings/me", updatedSettings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({
        show: true,
        type: "success",
        message: "Setting updated successfully.",
      });
    } catch (error) {
      console.error("Error auto-saving notification settings:", error);
      // Revert if failed
      setSettings(settings); 
      setModal({
        show: true,
        type: "error",
        message: "Failed to update setting. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#141414] rounded-[24px] border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 rounded-2xl bg-[#f4fae5] dark:bg-[#25330f] flex items-center justify-center mb-4">
          <Loader2 className="animate-spin text-[#95D700]" size={24} />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Loading Preferences</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-[#141414] rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 sm:p-10 shadow-sm shadow-gray-200/50">
        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-12 h-12 rounded-[18px] bg-[#f4fae5] dark:bg-[#25330f] flex items-center justify-center text-[#95D700] shadow-sm">
            <Bell className="w-6 h-6" strokeWidth={2.5} />
          </div>

          <div>
            <h2 className="text-[22px] font-black text-gray-900 dark:text-white tracking-tight">
              Notifications
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mt-0.5">
              Manage how you receive notifications
            </p>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-4">
          <NotificationItem
            label="Email Notifications"
            description="Receive notifications via email"
            enabled={settings.emailNotifications}
            onToggle={() => toggle("emailNotifications")}
          />

          <NotificationItem
            label="Project Updates"
            description="Get notified about project changes"
            enabled={settings.projectUpdates}
            onToggle={() => toggle("projectUpdates")}
          />

          <NotificationItem
            label="Task Reminders"
            description="Reminders for upcoming deadlines"
            enabled={settings.taskReminders}
            onToggle={() => toggle("taskReminders")}
          />

          <NotificationItem
            label="Celebration Alerts"
            description="Birthdays, anniversaries, and new hires"
            enabled={settings.celebrationAlerts}
            onToggle={() => toggle("celebrationAlerts")}
          />

          <NotificationItem
            label="Weekly Report"
            description="Receive weekly productivity summary"
            enabled={settings.weeklyReport}
            onToggle={() => toggle("weeklyReport")}
          />
        </div>
      </div>

      {modal.show && (
        <CustomModal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal({ ...modal, show: false })}
        />
      )}
    </div>
  );
}

/* -------------------------------- */
/* Reusable Notification Item Card */
/* -------------------------------- */

function NotificationItem({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-[24px] p-6 flex items-center justify-between shadow-sm transition-all hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a] hover:border-gray-200 dark:hover:border-gray-700">
      <div>
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-1">
          {label}
        </h3>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
          {description}
        </p>
      </div>
      
      <button
        type="button"
        onClick={onToggle}
        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${
          enabled 
            ? 'bg-[#95D700] shadow-[0_0_8px_rgba(149,215,0,0.4)]' 
            : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <div
          className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
            enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
