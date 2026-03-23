"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Api from "@/utils/api";
import CalendarHeader from "./CalendarHeader";
import CalendarSidebar from "./CalendarSidebar";

interface Staff {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl: string | null;
  address?: {
    city: string;
    state: string;
    country: string;
  };
  employment?: {
    jobTitle: string[];
    department?: {
      name: string;
    };
    departmentalRole?: {
      title: string;
    };
  };
}

interface CalendarLayoutProps {
  children: React.ReactNode;
  currentDate: Date;
  onNavigate: (direction: "prev" | "next" | "today") => void;
  view: "day" | "week" | "month";
  onViewChange: (view: "day" | "week" | "month") => void;
  onDateSelect: (date: Date) => void;
  onCreateEvent: () => void;
  onEventClick: (event: any) => void;
  events: any[];
  selectedStaffIds?: number[];
  onStaffSelectionChange?: (staffIds: number[]) => void;
  showOnlyMine?: boolean;
  onToggleShowOnlyMine?: () => void;
}

const CalendarLayout: React.FC<CalendarLayoutProps> = ({
  children,
  currentDate,
  onNavigate,
  view,
  onViewChange,
  onDateSelect,
  onCreateEvent,
  onEventClick,
  events,
  selectedStaffIds = [],
  onStaffSelectionChange,
  showOnlyMine = false,
  onToggleShowOnlyMine,
}) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loadingStaffs, setLoadingStaffs] = useState(false);

  // Fetch staffs for the dropdown
  useEffect(() => {
    const fetchStaffs = async () => {
      setLoadingStaffs(true);
      try {
        const res = await Api.get(
          "/staff-register/all/staffs/dept?page=1&limit=1000",
        );
        setStaffs(res.data?.data || []);
      } catch (error) {
        console.error("Error fetching staffs:", error);
      } finally {
        setLoadingStaffs(false);
      }
    };

    fetchStaffs();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col h-screen bg-white">
      <CalendarHeader
        currentDate={currentDate}
        onNavigate={onNavigate}
        view={view}
        onViewChange={onViewChange}
        onToggleSidebar={toggleSidebar}
        onGoBack={handleGoBack}
        showOnlyMine={showOnlyMine}
        onToggleShowOnlyMine={onToggleShowOnlyMine}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar with mobile drawer behavior */}
        <div
          className={`
          absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out bg-white md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          shadow-xl md:shadow-none
        `}
        >
          <CalendarSidebar
            currentDate={currentDate}
            onDateSelect={(date) => {
              onDateSelect(date);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            onCreateEvent={() => {
              onCreateEvent();
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            onEventClick={onEventClick}
            events={events}
            staffs={staffs}
            loadingStaffs={loadingStaffs}
            selectedStaffIds={selectedStaffIds}
            onStaffSelectionChange={onStaffSelectionChange}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 relative overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CalendarLayout;
