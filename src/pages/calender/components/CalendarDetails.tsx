"use client";

import React from 'react';
import { X, Calendar, Clock, MapPin, Link as LinkIcon, Users, Edit2, Trash2, Copy } from 'lucide-react';

interface CalendarDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    event: any;
    onEdit: (event: any) => void;
    onDelete: (event: any) => void;
}

const CalendarDetails: React.FC<CalendarDetailsProps> = ({
    isOpen,
    onClose,
    event,
    onEdit,
    onDelete
}) => {
    if (!isOpen || !event) return null;

    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    const formatEventDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatEventTime = (start: Date, end: Date) => {
        const startStr = start.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        const endStr = end.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        return `${startStr} – ${endStr}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header Actions */}
                <div className="flex items-start justify-between p-4">
                    {/* LEFT SIDE — Color + Title */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: event.color || "#22c55e" }}
                        />
                        <h2 className="text-xl font-medium text-gray-900 leading-tight">
                            {event.title}
                        </h2>
                    </div>

                    {/* RIGHT SIDE — Action Icons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onEdit(event)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            title="Edit"
                        >
                            <Edit2 size={18} />
                        </button>

                        <button
                            onClick={() => onDelete(event)}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-500"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <hr className='mb-6 border-gray-400 ' />

                <div className="px-6 pb-8 flex flex-col gap-6 overflow-y-auto">
                    {/* Title and Color Circle */}


                    {/* Time Info */}
                    <div className="flex flex-col gap-1 text-gray-600">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                                {formatEventDate(startTime)} • {formatEventTime(startTime, endTime)}
                            </span>
                        </div>
                        {event.recurrence && (
                            <div className="text-sm text-gray-500">
                                {event.recurrence}
                            </div>
                        )}
                    </div>

                    {/* Location / Meeting Link */}
                    {(event.location || event.meetingLink) && (
                        <div className="flex flex-col gap-3">
                            {event.location && (
                                <div className="flex items-start gap-3">
                                    <MapPin size={20} className="text-gray-400 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-700">Location</span>
                                        <span className="text-sm text-gray-600">{event.location}</span>
                                    </div>
                                </div>
                            )}
                            {event.meetingLink && (
                                <div className="flex items-start gap-3">
                                    <LinkIcon size={20} className="text-gray-400 mt-0.5" />
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-sm font-medium text-gray-700">Video call link</span>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={event.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline truncate"
                                            >
                                                {event.meetingLink}
                                            </a>
                                            <button
                                                onClick={() => copyToClipboard(event.meetingLink)}
                                                className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {event.description && (
                        <div className="flex items-start gap-3">
                            <div className="w-5" /> {/* Spacer for alignment */}
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-gray-700">Description</span>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                    {event.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Attendees */}
                    {event.attendees && event.attendees.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Users size={20} className="text-gray-400" />
                                <span className="text-sm font-medium">Attendees</span>
                            </div>
                            <div className="flex flex-col gap-2 pl-8">
                                <span className="text-sm text-gray-600">{event.attendees.length} guests</span>
                                <div className="flex flex-col gap-2">
                                    {event.attendees.map((attendee: any) => (
                                        <div key={attendee.id} className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 italic">
                                                {attendee.firstName?.[0] || attendee.name?.[0] || '?'}
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {attendee.firstName} {attendee.lastName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarDetails;
