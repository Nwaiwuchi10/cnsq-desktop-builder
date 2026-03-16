"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Users,
  Clock,
  Search,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import {
  DAYS_OF_WEEK,
  getCalendarGrid,
  isSameDay,
  MONTHS,
} from "@/utils/calendarDateUtils";

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

interface CalendarSidebarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateEvent: () => void;
  onEventClick: (event: any) => void;
  events: any[];
  staffs?: Staff[];
  loadingStaffs?: boolean;
  selectedStaffIds?: number[];
  onStaffSelectionChange?: (staffIds: number[]) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  currentDate,
  onDateSelect,
  onCreateEvent,
  onEventClick,
  events,
  staffs = [],
  loadingStaffs = false,
  selectedStaffIds = [],
  onStaffSelectionChange,
}) => {
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");

  if (!currentDate) {
    return (
      <aside className="w-full md:w-64 border-r border-gray-200 bg-white h-full overflow-y-auto p-4 flex flex-col gap-6 shadow-sm md:shadow-none items-center justify-center">
        Loading...
      </aside>
    );
  }

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const grid = getCalendarGrid(year, month);
  const today = new Date();

  // Filter staffs based on search
  const filteredStaffs = useMemo(() => {
    if (!staffSearch.trim()) return staffs;
    return staffs.filter(
      (staff) =>
        `${staff.firstName} ${staff.lastName}`
          .toLowerCase()
          .includes(staffSearch.toLowerCase()) ||
        staff.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staff.employment?.department?.name
          ?.toLowerCase()
          .includes(staffSearch.toLowerCase()),
    );
  }, [staffs, staffSearch]);

  // Sort and limit events
  const upcomingEvents = [...events]
    .filter((event) => new Date(event.startTime) >= new Date()) // Only future events
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    .slice(0, 5);

  const handleStaffToggle = (staffId: number) => {
    if (!onStaffSelectionChange) return;

    const isSelected = selectedStaffIds.includes(staffId);
    if (isSelected) {
      onStaffSelectionChange(selectedStaffIds.filter((id) => id !== staffId));
    } else {
      onStaffSelectionChange([...selectedStaffIds, staffId]);
    }
  };

  const handleSelectAllStaff = () => {
    if (!onStaffSelectionChange) return;
    onStaffSelectionChange(staffs.map((staff) => staff.id));
  };

  const handleDeselectAllStaff = () => {
    if (!onStaffSelectionChange) return;
    onStaffSelectionChange([]);
  };

  return (
    <aside className="w-full md:w-64 border-r border-gray-200 bg-white h-full overflow-y-auto p-4 flex flex-col gap-6 shadow-sm md:shadow-none">
      <button
        onClick={onCreateEvent}
        className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 bg-[#95D700] hover:bg-[#85c000] text-white rounded-lg font-bold shadow-md transition-all transform active:scale-[0.98]"
      >
        <Plus size={20} />
        Create
      </button>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-medium text-gray-700">
            {MONTHS[month]} {year}
          </span>
          <div className="flex gap-2">
            <button className="text-gray-400 hover:text-gray-600">{"<"}</button>
            <button className="text-gray-400 hover:text-gray-600">{">"}</button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center gap-1">
          {DAYS_OF_WEEK.map((day) => (
            <span
              key={day}
              className="text-[10px] uppercase font-bold text-gray-400 py-1"
            >
              {day[0]}
            </span>
          ))}
          {grid.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onDateSelect(item.date)}
              className={`text-xs w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                !item.isCurrentMonth
                  ? "text-gray-300"
                  : "text-gray-600 hover:bg-gray-100"
              } ${isSameDay(item.date, currentDate) ? "bg-[#2962ff] !text-white" : ""} ${
                isSameDay(item.date, today) &&
                !isSameDay(item.date, currentDate)
                  ? "border border-[#2962ff] text-[#2962ff]"
                  : ""
              }`}
            >
              {item.date.getDate()}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Schedule Section */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-gray-800">View All Staff Schedule</h3>

        <div className="relative">
          <button
            onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
            className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-gray-700">
              {selectedStaffIds.length === 0
                ? "Select Staff"
                : `${selectedStaffIds.length} staff${selectedStaffIds.length > 1 ? "s" : ""} selected`}
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${isStaffDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isStaffDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {/* Search Box */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#95D700] focus:border-transparent bg-white"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Select All/Deselect All */}
              <div className="flex gap-2 p-3 border-b border-gray-200">
                <button
                  onClick={handleSelectAllStaff}
                  className="text-xs text-[#95D700] hover:text-[#85c000] font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleDeselectAllStaff}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                  Deselect All
                </button>
              </div>

              {/* Staff List */}
              <div className="max-h-48 overflow-y-auto">
                {loadingStaffs ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Loading staffs...
                  </div>
                ) : filteredStaffs.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No staffs found
                  </div>
                ) : (
                  filteredStaffs.map((staff) => {
                    const isSelected = selectedStaffIds.includes(staff.id);
                    return (
                      <div
                        key={staff.id}
                        onClick={() => handleStaffToggle(staff.id)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div
                          className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                            isSelected
                              ? "bg-[#95D700] border-[#95D700]"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {staff.firstName} {staff.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {staff.employment?.department?.name ||
                              "No Department"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-gray-800 border-b pb-2">
          Upcoming Events
        </h3>
        <div className="flex flex-col gap-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1.5 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                onClick={() => onEventClick(event)}
              >
                <h4 className="font-medium text-sm text-gray-900 truncate">
                  {event.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>
                    {new Date(event.startTime).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    {new Date(event.startTime).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users size={12} />
                  <span>{event.attendees?.length || 0} attendees</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No upcoming events</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CalendarSidebar;
