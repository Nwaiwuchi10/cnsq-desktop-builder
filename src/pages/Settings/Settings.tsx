"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import ProfileTab from "./ProfileTab";
import ChangePassword from "@/pages/ChangePassword/ChangePassword";
import NotificationsTab from "./NotificationsTab";
import ActivityLogTab from "./ActivityLogTab";

export default function Settings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Profile");

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "Password") setActiveTab("Password");
    else if (tab === "Notifications") setActiveTab("Notifications");
    // else if (tab === "Activity Log") setActiveTab("Activity Log");
    else setActiveTab("Profile");
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Optional: Update URL to reflect the new tab without full reload
    router.replace(`?tab=${tab}`);
  };

  return (
    <StaffLayout>
      <div className="w-full lg:px-4 py-6">
        <h1 className="text-2xl font-bold text-[#95D700] mb-6 px-1">Settings</h1>

        {/* Switch Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-[#1A1A1A] rounded-full p-1.5 w-fit mb-8 ml-1 border border-gray-100 dark:border-gray-800">
          {["Profile", "Password", "Notifications"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === tab
                ? "bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white shadow-md shadow-gray-200/50 border border-gray-100 dark:border-gray-800"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full px-1">
          {activeTab === "Profile" && <ProfileTab />}
          {activeTab === "Password" && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-0 sm:p-4 md:p-8">
              <div className="max-w-xl mx-auto">
                <ChangePassword />
              </div>
            </div>
          )}
          {activeTab === "Notifications" && (
            <div className="max-w-3xl">
              <NotificationsTab />
            </div>
          )}
          {/* {activeTab === "Activity Log" && (
            <div className="w-full xl:pr-10">
              <ActivityLogTab />
            </div>
          )} */}
        </div>
      </div>
    </StaffLayout>
  );
}
