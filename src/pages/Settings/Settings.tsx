"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import ProfileTab from "./ProfileTab";
import ChangePassword from "@/pages/ChangePassword/ChangePassword";

export default function Settings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Profile");

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "Password") setActiveTab("Password");
    else if (tab === "Notifications") setActiveTab("Notifications");
    else setActiveTab("Profile");
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    if (tab === "Notifications") {
      router.push("/notifications");
    } else {
      setActiveTab(tab);
      // Optional: Update URL to reflect the new tab without full reload
      router.replace(`?tab=${tab}`);
    }
  };

  return (
    <StaffLayout>
      <div className="w-full lg:px-4 py-6">
        <h1 className="text-2xl font-bold text-[#95D700] mb-6 px-1">Settings</h1>
        
        {/* Switch Tabs */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1A1A1A] rounded-full p-1 w-fit mb-8 ml-1">
          {["Profile", "Password", "Notifications"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === "Profile" && <ProfileTab />}
          {activeTab === "Password" && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-0 sm:p-4 md:p-8">
               <div className="max-w-xl mx-auto">
                 <ChangePassword />
               </div>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
