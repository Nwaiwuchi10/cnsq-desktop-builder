"use client";

import React from 'react';
import { getCalendarGrid, getWeekDays, isSameDay, DAYS_OF_WEEK, formatTime, formatDate } from '../utils/dateUtils';

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

const EventCard = ({ event, style, onClick }: { event: Event, style?: React.CSSProperties, onClick: (e: any) => void }) => {
    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: event.color || '#22c55e',
                ...style
            }}
            className="text-white text-[10px] p-1 rounded-sm shadow-sm cursor-pointer overflow-hidden whitespace-nowrap group transition-all hover:brightness-95 z-10"
            title={event.title}
        >
            <div className="font-semibold truncate">{event.title}</div>
            <div className="opacity-80">
                {new Date(event.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
            </div>
        </div>
    );
};

export const MonthView: React.FC<ViewProps> = ({ currentDate, events, onEventClick }) => {
    const grid = getCalendarGrid(currentDate.getFullYear(), currentDate.getMonth());
    const today = new Date();

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            <div className="grid grid-cols-7 border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="py-2 text-center text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                        <span className="md:hidden">{day[0]}</span>
                        <span className="hidden md:inline">{day}</span>
                    </div>
                ))}
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-6 auto-rows-fr bg-gray-200 gap-[1px] overflow-auto">
                {grid.map((item, idx) => {
                    const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), item.date));
                    const isToday = isSameDay(item.date, today);

                    return (
                        <div
                            key={idx}
                            className={`bg-white p-0.5 md:p-1 min-h-[80px] md:min-h-[120px] flex flex-col gap-0.5 md:gap-1 ${!item.isCurrentMonth ? 'bg-gray-50/50' : ''}`}
                        >
                            <div className="flex justify-center md:justify-end">
                                <span className={`text-[10px] md:text-xs font-semibold w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : item.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                                    }`}>
                                    {item.date.getDate()}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                {dayEvents.map(event => (
                                    <div key={event.id} className="hidden md:block">
                                        <EventCard event={event} onClick={() => onEventClick(event)} />
                                    </div>
                                ))}
                                {dayEvents.length > 0 && (
                                    <div className="md:hidden flex flex-wrap gap-0.5 justify-center mt-1">
                                        {dayEvents.slice(0, 3).map(event => (
                                            <div key={event.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.color || '#22c55e' }} />
                                        ))}
                                        {dayEvents.length > 3 && <div className="text-[8px] text-gray-400 font-bold">+</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const WeekView: React.FC<ViewProps> = ({ currentDate, events, onEventClick }) => {
    const weekDays = getWeekDays(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date();

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
            <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20">
                <div className="w-12 md:w-20 border-r border-gray-200 bg-gray-50" />
                <div className="flex-1 grid grid-cols-7">
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className={`py-2 text-center border-r border-gray-200 last:border-r-0 ${isSameDay(day, today) ? 'bg-blue-50/50' : ''}`}>
                            <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                <span className="md:hidden">{DAYS_OF_WEEK[day.getDay()][0]}</span>
                                <span className="hidden md:inline">{DAYS_OF_WEEK[day.getDay()]}</span>
                            </div>
                            <div className={`mt-1 text-sm md:text-xl font-semibold inline-flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-full ${isSameDay(day, today) ? 'bg-blue-600 text-white' : 'text-gray-700'
                                }`}>
                                {day.getDate()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto relative">
                <div className="flex min-h-[1440px]">
                    <div className="w-12 md:w-20 flex flex-col bg-gray-50 border-r border-gray-200 sticky left-0 z-10">
                        {hours.map(hour => (
                            <div key={hour} className="h-16 text-[10px] md:text-xs text-gray-400 text-right pr-2 md:pr-4 -mt-2.5">
                                {hour === 0 ? '' : formatTime(new Date(2024, 0, 1, hour))}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 grid grid-cols-7 relative">
                        <div className="absolute inset-0 flex flex-col pointer-events-none">
                            {hours.map(hour => (
                                <div key={hour} className="h-16 border-b border-gray-100 last:border-b-0" />
                            ))}
                        </div>

                        {weekDays.map(day => (
                            <div key={day.toISOString()} className="relative border-r border-gray-100 last:border-r-0">
                                {events
                                    .filter(e => isSameDay(new Date(e.startTime), day))
                                    .map(event => {
                                        const start = new Date(event.startTime);
                                        const end = new Date(event.endTime);
                                        const top = (start.getHours() * 64) + (start.getMinutes() / 60 * 64);
                                        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                        const height = Math.max(duration * 64, 20);

                                        return (
                                            <EventCard
                                                key={event.id}
                                                event={event}
                                                style={{ position: 'absolute', top: `${top}px`, height: `${height}px`, width: 'calc(100% - 4px)', left: '2px' }}
                                                onClick={() => onEventClick(event)}
                                            />
                                        );
                                    })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DayView: React.FC<ViewProps> = ({ currentDate, events, onEventClick }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date();
    const isToday = isSameDay(currentDate, today);

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
            <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20">
                <div className="w-12 md:w-20 border-r border-gray-200 bg-gray-50" />
                <div className="flex-1 p-4 md:p-6">
                    <div className="flex items-center gap-4">
                        <div className={`text-2xl md:text-4xl font-bold flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                            }`}>
                            {currentDate.getDate()}
                        </div>
                        <div>
                            <div className="text-sm md:text-lg font-bold text-gray-500 uppercase tracking-widest">{DAYS_OF_WEEK[currentDate.getDay()]}</div>
                            <div className="text-xs md:text-sm text-gray-400">{formatDate(currentDate)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto relative">
                <div className="flex min-h-[1440px]">
                    <div className="w-12 md:w-20 flex flex-col bg-gray-50 border-r border-gray-200 sticky left-0 z-10">
                        {hours.map(hour => (
                            <div key={hour} className="h-16 text-[10px] md:text-xs text-gray-400 text-right pr-2 md:pr-4 -mt-2.5">
                                {hour === 0 ? '' : formatTime(new Date(2024, 0, 1, hour))}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 relative">
                        <div className="absolute inset-0 flex flex-col pointer-events-none">
                            {hours.map(hour => (
                                <div key={hour} className="h-16 border-b border-gray-100 last:border-b-0" />
                            ))}
                        </div>

                        {events
                            .filter(e => isSameDay(new Date(e.startTime), currentDate))
                            .map(event => {
                                const start = new Date(event.startTime);
                                const end = new Date(event.endTime);
                                const top = (start.getHours() * 64) + (start.getMinutes() / 60 * 64);
                                const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                const height = Math.max(duration * 64, 24);

                                return (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        style={{ position: 'absolute', top: `${top}px`, height: `${height}px`, width: 'calc(100% - 20px)', left: '10px' }}
                                        onClick={() => onEventClick(event)}
                                    />
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
};
