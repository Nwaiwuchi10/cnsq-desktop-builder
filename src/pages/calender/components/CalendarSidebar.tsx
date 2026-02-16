"use client";

import React from "react";
import { Plus, Users, Clock } from "lucide-react";
import {
  DAYS_OF_WEEK,
  getCalendarGrid,
  isSameDay,
  MONTHS,
} from "../utils/dateUtils";

interface CalendarSidebarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateEvent: () => void;
  onEventClick: (event: any) => void;
  events: any[];
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  currentDate,
  onDateSelect,
  onCreateEvent,
  onEventClick,
  events,
}) => {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const grid = getCalendarGrid(year, month);
  const today = new Date();

  // Sort and limit events
  const upcomingEvents = [...events]
    .filter((event) => new Date(event.startTime) >= new Date()) // Only future events
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    .slice(0, 5);

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

      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-gray-800 border-b pb-2">Upcoming</h3>
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
