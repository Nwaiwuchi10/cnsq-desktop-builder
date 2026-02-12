"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Link as LinkIcon, Users, Type } from 'lucide-react';
import Api from '@/utils/api';
import CustomModal from '@/component/Message/Message';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (eventData: any) => void;
    initialDate?: Date;
    eventToEdit?: any;
}

const EVENT_TYPES = ['MEETING', 'SPRINT', 'REVIEW', 'PERSONAL', 'PROJECT'];
const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6'];

const EventModal: React.FC<EventModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialDate,
    eventToEdit
}) => {
    const [modal, setModal] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '10:00',
        location: '',
        meetingLink: '',
        color: '#22c55e',
        type: 'MEETING',
        attendees: [] as number[]

    });

    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Fetch staff for attendees
            Api.get('/staff-register').then(res => {
                setStaffList(res.data);
            }).catch(err => console.error("Error fetching staff", err));

            if (eventToEdit) {
                const start = new Date(eventToEdit.startTime);
                const end = new Date(eventToEdit.endTime);
                setFormData({
                    title: eventToEdit.title,
                    description: eventToEdit.description || '',
                    startDate: start.toISOString().split('T')[0],
                    startTime: start.toTimeString().split(' ')[0].substring(0, 5),
                    endDate: end.toISOString().split('T')[0],
                    endTime: end.toTimeString().split(' ')[0].substring(0, 5),
                    location: eventToEdit.location || '',
                    meetingLink: eventToEdit.meetingLink || '',
                    color: eventToEdit.color || '#22c55e',
                    type: eventToEdit.type || 'MEETING',
                    attendees: eventToEdit.attendees?.map((s: any) => s.id) || []
                });
            } else if (initialDate) {
                const dateStr = initialDate.toISOString().split('T')[0];
                setFormData(prev => ({
                    ...prev,
                    startDate: dateStr,
                    endDate: dateStr
                }));
            }
        }
    }, [isOpen, initialDate, eventToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const start = new Date(`${formData.startDate}T${formData.startTime}:00`);
        const end = new Date(`${formData.endDate}T${formData.endTime}:00`);

        const payload = {
            ...formData,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
        };

        try {
            let res;

            if (eventToEdit) {
                res = await Api.patch(`/calender/${eventToEdit?.id}`, payload);
            } else {
                res = await Api.post('/calender', payload);
            }

            onSave(res.data); // better than sending payload
            setModal({
                type: "success",
                message: res.data.message || "Event saved successfully!",
            });

            onClose();
        } catch (error: any) {
            setModal({
                type: "error",
                message: error.response?.data?.message || "Failed to save event.",
            });
        } finally {
            setLoading(false);
        }
    };


    const toggleAttendee = (staffId: number) => {
        setFormData(prev => ({
            ...prev,
            attendees: prev.attendees.includes(staffId)
                ? prev.attendees.filter(id => id !== staffId)
                : [...prev.attendees, staffId]
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-none md:rounded-xl shadow-2xl w-full max-w-lg h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-b-gray-200 flex justify-between items-center bg-white flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">
                        {eventToEdit ? 'Edit Meeting' : 'Create New Meeting'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-y-auto flex-1">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                            <Type size={16} /> Title
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Event Title"
                            className="w-full px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95D700] focus:border-transparent outline-none transition-all text-base"
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Calendar size={16} /> Start Date
                            </label>
                            <input
                                required
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95D700] outline-none text-base"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Clock size={16} /> Start Time
                            </label>
                            <input
                                required
                                type="time"
                                value={formData.startTime}
                                onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                className="w-full px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95D700] outline-none text-base"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Calendar size={16} /> End Date
                            </label>
                            <input
                                required
                                type="date"
                                value={formData.endDate}
                                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                className="w-full px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95D700] outline-none text-base"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <Clock size={16} /> End Time
                            </label>
                            <input
                                required
                                type="time"
                                value={formData.endTime}
                                onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                className="w-full px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95D700] outline-none text-base"
                            />
                        </div>
                    </div>

                    {/* Type & Color */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95D700] outline-none bg-white text-base"
                            >
                                {EVENT_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600">Color</label>
                            <div className="flex gap-3 md:gap-2.5 flex-wrap">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, color: c }))}
                                        className={`w-8 h-8 md:w-7 md:h-7 rounded-full transition-transform hover:scale-110 ${formData.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Location & Link */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <MapPin size={16} /> Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Office, Room 402, etc."
                                className="w-full px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95D700] outline-none text-base"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                <LinkIcon size={16} /> Meeting Link
                            </label>
                            <input
                                type="url"
                                value={formData.meetingLink}
                                onChange={e => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                                placeholder="https://zoom.us/j/..."
                                className="w-full px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95D700] outline-none text-base"
                            />
                        </div>
                    </div>

                    {/* Attendees */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                            <Users size={16} /> Attendees
                        </label>
                        <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto flex flex-col gap-2 bg-gray-50">
                            {staffList.map(staff => (
                                <label key={staff?.id} className="flex items-center gap-3 cursor-pointer group py-1">
                                    <input
                                        type="checkbox"
                                        checked={formData.attendees.includes(staff?.id)}
                                        onChange={() => toggleAttendee(staff?.id)}
                                        className="w-5 h-5 md:w-4 md:h-4 text-[#95D700] rounded focus:ring-[#95D700]"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                            {staff.firstName} {staff.lastName}
                                        </span>
                                        <span className="text-[10px] text-gray-500">{staff?.employment?.jobTitle || 'Staff'}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-600">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Optional notes..."
                            rows={3}
                            className="w-full px-4 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#95D700] outline-none resize-none text-base"
                        />
                    </div>

                    <div className="pt-4 border-t sticky bottom-0 bg-white mt-auto">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full cursor-pointer py-3.5 md:py-3 bg-[#95D700] hover:bg-[#85c000] text-white rounded-lg font-bold shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 text-lg md:text-base outline-none focus:ring-2 focus:ring-[#95D700] focus:ring-offset-2"
                        >
                            {loading ? 'Saving...' : eventToEdit ? 'Update Event' : 'Save Event'}
                        </button>
                    </div>
                </form>
            </div>
            {modal && (
                <CustomModal
                    type={modal.type}
                    message={modal.message}
                    onClose={() => setModal(null)}
                />
            )}

        </div>

    );
};

export default EventModal;
