"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Send,
    Clock,
    Users,
    MessageSquare,
    AlertCircle,
    Edit2,
    Trash2,
    ExternalLink,
    Database,
    Calendar,
    Eye,
    X
} from "lucide-react";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import Api from "@/utils/api";
import CeoBroadcastForm from "@/component/CeoMessagingCenter/CeoBroadcastForm";
import DeleteConfirmModal from "@/pages/Notification/DeleteResuableModal";

import CeoMessageReadersModal from "./CeoMessageReadersModal";

interface CeoMessage {
    id: string;
    title: string;
    description: string;
    isAllStaff: boolean;
    attachments?: string[];
    createdAt: string;
}

const CeoMessagingCenter: React.FC = () => {
    const [messages, setMessages] = useState<CeoMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<CeoMessage | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewingReaders, setViewingReaders] = useState<CeoMessage | null>(null);
    const [viewingDetails, setViewingDetails] = useState<CeoMessage | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("user-token");
            const res = await Api.get("/ceo-messaging-center/my-messages", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data || []);
        } catch (error) {
            console.error("Error fetching CEO messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = messages.filter(msg => {
        const matchesSearch = msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem("user-token");
            await Api.delete(`/ceo-messaging-center/${deleteTarget}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMessages();
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting message:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <StaffLayout>
            <div className="w-full max-w-7xl mx-auto py-8">
                {/* Header Section **/}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#f7fff0] rounded-xl border border-[#86CD23]/20 shadow-sm">
                            <MessageSquare className="w-8 h-8 text-[#86CD23]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                CEO Messaging Center
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                Send messages to all staff or specific team members
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedMessage(null);
                            setShowForm(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-[#86CD23] hover:bg-[#7ab520] text-black px-6 py-3.5 rounded-xl font-bold border border-[#86CD23] transition-all duration-200 shadow-lg shadow-[#86CD23]/10 transform active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                        <span>New Message</span>
                    </button>
                </div>

                {/* Search */}
                <section className="mb-8">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-[#86CD23]" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#86CD23]/20 focus:border-[#86CD23] transition-all shadow-sm font-medium"
                        />
                    </div>
                </section>

                {/* Message List */}
                <div className="bg-white dark:bg-[#141414] rounded-[24px] border border-gray-100 dark:border-gray-800 p-8 shadow-xl shadow-gray-200/20">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-50 dark:border-gray-800 pb-6">
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                Message History
                                <span className="text-sm font-bold px-2.5 py-0.5 bg-[#86CD23]/10 text-[#86CD23] rounded-full">
                                    {filteredMessages.length}
                                </span>
                            </h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">All messages sent to staff members</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
                            <div className="w-12 h-12 border-4 border-[#86CD23]/20 border-t-[#86CD23] rounded-full animate-spin"></div>
                            <p className="font-bold">Loading message history...</p>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-bold text-lg">No messages found</p>
                            <p className="text-gray-400 mt-1">Start by creating a new broadcast message</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className="group relative bg-[#FAFAFA] dark:bg-[#1a1a1a]/50 p-6 rounded-[20px] border border-gray-100 dark:border-gray-800 hover:border-[#86CD23]/40 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                                    onClick={() => {
                                        setViewingDetails(msg);
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-[#86CD23] transition-colors leading-tight">
                                                    {msg.title}
                                                </h3>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 pr-12 font-medium">
                                                {msg.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMessage(msg);
                                                    setShowForm(true);
                                                }}
                                                className="p-2 hover:bg-white dark:hover:bg-[#222] rounded-lg text-gray-400 hover:text-blue-500 transition-colors shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteTarget(msg.id);
                                                }}
                                                className="p-2 hover:bg-white dark:hover:bg-[#222] rounded-lg text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 pt-5 mt-4 border-t border-gray-50 dark:border-gray-800 text-xs font-bold">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Users className="w-4 h-4 text-[#86CD23]/60" />
                                            <span className="text-gray-600 dark:text-gray-400">To: </span>
                                            <span className="text-gray-900 dark:text-gray-200">
                                                {msg.isAllStaff ? "All Staff" : "Selected Members"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-gray-900 dark:text-gray-200">
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <ExternalLink className="w-4 h-4" />
                                                <span className="text-[#86CD23] hover:underline">View Attachments</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingReaders(msg);
                                            }}
                                            className="flex items-center gap-2 text-blue-500 hover:underline ml-auto"
                                        >
                                            <Eye size={14} />
                                            <span>Who read?</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <CeoBroadcastForm
                    message={selectedMessage}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        setShowForm(false);
                        fetchMessages();
                    }}
                />
            )}

            {deleteTarget && (
                <DeleteConfirmModal
                    title="Delete Message"
                    message="Are you sure you want to delete this broadcast message? This action cannot be undone."
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    loading={isDeleting}
                />
            )}

            {viewingReaders && (
                <CeoMessageReadersModal
                    messageId={viewingReaders.id}
                    title={viewingReaders.title}
                    onClose={() => setViewingReaders(null)}
                />
            )}

            {viewingDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#141414] transition-colors w-full max-w-2xl rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <button
                            onClick={() => setViewingDetails(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 pr-8">{viewingDetails.title}</h2>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(viewingDetails.createdAt).toLocaleString()}</span>
                            <span className="flex items-center gap-1"><Users size={14} /> {viewingDetails.isAllStaff ? "All Staff" : "Selected Members"}</span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {viewingDetails.description}
                        </div>
                        {viewingDetails.attachments && viewingDetails.attachments.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Attachments</h4>
                                <div className="flex flex-col gap-2">
                                    {viewingDetails.attachments.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 w-fit bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                                            <ExternalLink size={14} /> View Attachment {i + 1}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0">
                            <button onClick={() => setViewingDetails(null)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-all active:scale-95">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </StaffLayout>
    );
};

export default CeoMessagingCenter;
