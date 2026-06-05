"use client";

import React, { useState, useEffect } from "react";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import LeaveApprovalTable from "./components/LeaveApprovalTable";
import LeaveApprovalModal from "./components/LeaveApprovalModal";
import LeaveStats from "./components/LeaveStats";
import { leaveApi, LeaveRequest, LeaveStats as ILeaveStats } from "./services/leaveApi";
import { ClipboardCheck } from "lucide-react";
import CustomModal from "@/component/Message/Message";

export default function LeaveApprovalsPage() {
    const [history, setHistory] = useState<LeaveRequest[]>([]);
    const [stats, setStats] = useState<ILeaveStats>({
        total: 0,
        pending: 0,
        approved: 0,
        declined: 0,
        cancelled: 0,
        completed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ isOpen: boolean, type: 'success' | 'error', text: string }>({
        isOpen: false,
        type: 'success',
        text: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Use allSettled so a stats failure never blocks the main table from rendering
            const [requestsResult, statsResult] = await Promise.allSettled([
                leaveApi.getSupervisorMe(searchQuery),
                leaveApi.getSupervisorStats()
            ]);

            if (requestsResult.status === 'fulfilled') {
                setHistory(requestsResult.value);
            } else {
                const err = (requestsResult.reason as any)?.response?.data?.message;
                // If user is not a supervisor, show empty table without error banner
                if ((requestsResult.reason as any)?.response?.status !== 404) {
                    setMessageConfig({ isOpen: true, type: 'error', text: err || 'Failed to fetch approval data' });
                }
                setHistory([]);
            }

            if (statsResult.status === 'fulfilled') {
                setStats(statsResult.value);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchQuery]);

    const handleViewDetails = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setIsApprovalModalOpen(true);
    };

    return (
        <StaffLayout>
            {messageConfig.isOpen && (
                <CustomModal
                    type={messageConfig.type}
                    message={messageConfig.text}
                    onClose={() => setMessageConfig({ ...messageConfig, isOpen: false })}
                />
            )}
            <div className="w-full flex flex-col gap-6 md:gap-8 min-h-screen pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#86CD23] bg-opacity-20 rounded-2xl">
                            <ClipboardCheck className="w-8 h-8 text-[#86CD23]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Leave Approvals</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Review and action pending leave requests assigned to you</p>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <LeaveStats stats={stats} />

                {/* Table Section */}
                <LeaveApprovalTable
                    data={history}
                    loading={loading}
                    onViewDetails={handleViewDetails}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </div>

            {/* Modal */}
            <LeaveApprovalModal
                isOpen={isApprovalModalOpen}
                onClose={() => setIsApprovalModalOpen(false)}
                request={selectedRequest}
                onSuccess={fetchData}
            />
        </StaffLayout>
    );
}
