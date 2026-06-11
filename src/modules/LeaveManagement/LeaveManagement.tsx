"use client";

import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import LeaveStats from "./components/LeaveStats";
import LeaveTable from "./components/LeaveTable";
import RequestLeaveModal from "./components/RequestLeaveModal";
import LeaveDetailsModal from "./components/LeaveDetailsModal";
import LeaveApprovalModal from "./components/LeaveApprovalModal";
import { leaveApi, LeaveRequest, LeaveStats as ILeaveStats } from "./services/leaveApi";
import Api from "@/utils/api";
import CustomModal from "@/component/Message/Message";

export default function LeaveManagementPage() {
    const [user, setUser] = useState<any>(null);
    const [history, setHistory] = useState<LeaveRequest[]>([]);
    const [messageConfig, setMessageConfig] = useState<{ isOpen: boolean; type: 'success' | 'error'; text: string }>({
        isOpen: false, type: 'success', text: ''
    });
    const [stats, setStats] = useState<ILeaveStats>({
        total: 0, pending: 0, approved: 0, declined: 0, cancelled: 0, completed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    // supervisor state: null = not resolved yet, true/false = resolved
    const [isSupervisor, setIsSupervisor] = useState<boolean | null>(null);
    // Item 2: supervisor view tab — 'team' = requests where they are supervisor, 'my' = their own requests
    const [supervisorViewTab, setSupervisorViewTab] = useState<'team' | 'my'>('team');

    // ── 1. Profile fetch (once on mount) ──────────────────────────────────────
    useEffect(() => {
        Api.get("/staff-register/staff/viewProfile", {
            headers: { Authorization: `Bearer ${localStorage.getItem("user-token")}` }
        })
            .then((res) => setUser(res.data))
            .catch(() => {});
    }, []);

    // ── 2. Supervisor check (once on mount) ───────────────────────────────────
    useEffect(() => {
        leaveApi.isSupervisorCheck()
            .then(res => setIsSupervisor(res.isSupervisor))
            .catch(() => setIsSupervisor(false));
    }, []);

    // ── 3. Debounce search (400ms) ────────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ── 4. Data fetch: runs only after supervisor status is resolved ───────────
    const fetchData = useCallback(async () => {
        if (isSupervisor === null) return; // not resolved yet — wait
        setLoading(true);
        try {
            const statusFilter = activeTab !== "All" ? activeTab : undefined;
            const search = debouncedSearch || undefined;

            let historyPromise: Promise<LeaveRequest[]>;

            if (isSupervisor) {
                // Item 2: switch between team view and my view
                if (supervisorViewTab === 'my') {
                    historyPromise = leaveApi.getHistory(search, statusFilter);
                } else {
                    historyPromise = leaveApi.getSupervisorMe(search, statusFilter);
                }
            } else {
                historyPromise = leaveApi.getHistory(search, statusFilter);
            }

            const statsPromise = isSupervisor
                ? leaveApi.getSupervisorStats()
                : leaveApi.getStats();

            const [historyData, statsData] = await Promise.allSettled([historyPromise, statsPromise]);

            if (historyData.status === 'fulfilled') {
                setHistory(historyData.value);
            } else {
                console.error("History fetch failed:", historyData.reason);
                setHistory([]);
            }

            if (statsData.status === 'fulfilled') {
                setStats(statsData.value);
            } else {
                console.error("Stats fetch failed:", statsData.reason);
            }
        } catch (error: any) {
            console.error("Unexpected error in fetchData:", error);
        } finally {
            setLoading(false);
        }
    }, [isSupervisor, debouncedSearch, activeTab, supervisorViewTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewDetails = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setIsDetailsModalOpen(true);
    };

    useEffect(() => {
        const handleOpenModal = () => setIsRequestModalOpen(true);
        window.addEventListener('open-leave-modal', handleOpenModal);
        return () => window.removeEventListener('open-leave-modal', handleOpenModal);
    }, []);

    // When supervisor switches between team/my view, reset tab to All
    const handleSupervisorViewTabChange = (tab: 'team' | 'my') => {
        setSupervisorViewTab(tab);
        setActiveTab('All');
        setSearchQuery('');
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
            <div className="w-full flex flex-col gap-6 md:gap-8 min-h-screen pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isSupervisor ? "Leave Requests Under Me" : "Leave History"}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isSupervisor
                                ? "Review and manage leave requests from your team"
                                : "Track all your leave requests and their approval status"}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="bg-[#86CD23] hover:bg-[#75b41e] text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2 text-sm w-fit"
                    >
                        Request Leave
                    </button>
                </div>

                {/* Stats */}
                <LeaveStats stats={stats} />

                {/* Table */}
                <LeaveTable
                    data={history}
                    loading={loading}
                    onViewDetails={handleViewDetails}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isSupervisorMode={isSupervisor === true}
                    supervisorViewTab={supervisorViewTab}
                    onSupervisorViewTabChange={handleSupervisorViewTabChange}
                />
            </div>

            {/* Modals */}
            <RequestLeaveModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSuccess={fetchData}
            />

            {isSupervisor && supervisorViewTab === 'team' ? (
                <LeaveApprovalModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    request={selectedRequest}
                    onSuccess={fetchData}
                    currentUser={user}
                />
            ) : (
                <LeaveDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    request={selectedRequest}
                    isSupervisorMode={false}
                    onSuccess={fetchData}
                />
            )}
        </StaffLayout>
    );
}
