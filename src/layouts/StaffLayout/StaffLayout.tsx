"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Menu } from "lucide-react";
import Api from "@/utils/api";

type User = {
  uuid: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  employment?: {
    department?: {
      name?: string;
    };
    departmentalRole?: {
      title?: string;
    };
  };
  isCeo?: boolean;
  isOnline?: boolean;
};

interface StaffLayoutProps {
  children: React.ReactNode;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("user-token") : null;
    if (!token) return;

    Api.get("/staff-register/staff/viewProfile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Failed to fetch user profile", err));
  }, []);

  return (
    <div className="flex h-screen bg-[#f4f6fc] dark:bg-[#0d0d0d] overflow-hidden transition-colors">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setIsMobileOpen}
        user={user}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile menu button absolute positioned so it isn't blocked */}
        <div className="absolute top-4 left-4 z-10 lg:hidden">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-[#0d0d0d]"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <Header user={user} />

        <main className="flex-1 overflow-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 pb-20 scrollbar-hide bg-[#FAFAFA] dark:bg-[#0d0d0d] transition-colors">
          <div className="w-full max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
