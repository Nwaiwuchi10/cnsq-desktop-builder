"use client";

import React, { useState, useEffect } from "react";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import LeaveStats from "./components/LeaveStats";
import AdminLeaveTable from "./components/AdminLeaveTable";
import LeaveDetailsModal from "./components/LeaveDetailsModal";
import { leaveApi, LeaveRequest, LeaveStats as ILeaveStats } from "./services/leaveApi";
import { LayoutDashboard } from "lucide-react";

export default function AdminLeaveHistoryPage() {
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
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [historyData, statsData] = await Promise.all([
                leaveApi.getAdminHistory(searchQuery),
                leaveApi.getAdminStats()
            ]);
            setHistory(historyData);
            setStats(statsData);
        } catch (error) {
            console.error("Error fetching admin leave data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchQuery]);

    const filteredHistory = history.filter(item => {
        const matchesTab = activeTab === "All" || item.status === activeTab;
        return matchesTab;
    });

    const handleViewDetails = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setIsDetailsModalOpen(true);
    };

    return (
        <StaffLayout>
            <div className="w-full flex flex-col gap-6 md:gap-8 min-h-screen pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#86CD23] bg-opacity-20 rounded-2xl">
                            <LayoutDashboard className="w-8 h-8 text-[#86CD23]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Admin Leave History</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage all staff leave requests across the organization</p>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <LeaveStats stats={stats} />

                {/* Table Section */}
                <AdminLeaveTable 
                    data={filteredHistory} 
                    onViewDetails={handleViewDetails}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </div>

            {/* Modal */}
            <LeaveDetailsModal 
                isOpen={isDetailsModalOpen} 
                onClose={() => setIsDetailsModalOpen(false)}
                request={selectedRequest}
            />
        </StaffLayout>
    );
}
