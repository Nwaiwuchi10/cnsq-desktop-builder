"use client";

import {
  DAYS_OF_WEEK,
  formatDate,
  formatTime,
  isSameDay,
} from "@/utils/calendarDateUtils";
import React from "react";

interface Event {
  id: string;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  color?: string;
  attendees?: any[];
}

interface ViewProps {
  currentDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

interface EventCardProps {
  event: Event;
  style?: React.CSSProperties;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, style, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: event.color || "#22c55e",
        ...style,
      }}
      className="text-white text-[10px] p-1 rounded-sm shadow-sm cursor-pointer overflow-hidden whitespace-nowrap group transition-all hover:brightness-95 z-10"
      title={event.title}
    >
      <div className="font-semibold truncate">{event.title}</div>
      <div className="opacity-80">
        {new Date(event.startTime).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </div>
    </div>
  );
};

export default function DayView({
  currentDate,
  events,
  onEventClick,
}: ViewProps) {
  if (!currentDate) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white items-center justify-center">
        Loading...
      </div>
    );
  }
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date();
  const isToday = isSameDay(currentDate, today);

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20">
        <div className="w-12 md:w-20 border-r border-gray-200 bg-gray-50" />
        <div className="flex-1 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div
              className={`text-2xl md:text-4xl font-bold flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full ${
                isToday ? "bg-blue-600 text-white" : "text-gray-700"
              }`}
            >
              {currentDate.getDate()}
            </div>
            <div>
              <div className="text-sm md:text-lg font-bold text-gray-500 uppercase tracking-widest">
                {DAYS_OF_WEEK[currentDate.getDay()]}
              </div>
              <div className="text-xs md:text-sm text-gray-400">
                {formatDate(currentDate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <div className="flex min-h-[1440px]">
          <div className="w-12 md:w-20 flex flex-col bg-gray-50 border-r border-gray-200 sticky left-0 z-10">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 text-[10px] md:text-xs text-gray-400 text-right pr-2 md:pr-4 -mt-2.5"
              >
                {hour === 0 ? "" : formatTime(new Date(2024, 0, 1, hour))}
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-gray-100 last:border-b-0"
                />
              ))}
            </div>

            {events
              .filter((e) => isSameDay(new Date(e.startTime), currentDate))
              .map((event) => {
                const start = new Date(event.startTime);
                const end = new Date(event.endTime);
                const top =
                  start.getHours() * 64 + (start.getMinutes() / 60) * 64;
                const duration =
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                const height = Math.max(duration * 64, 24);

                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    style={{
                      position: "absolute",
                      top: `${top}px`,
                      height: `${height}px`,
                      width: "calc(100% - 20px)",
                      left: "10px",
                    }}
                    onClick={() => onEventClick(event)}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
