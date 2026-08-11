"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ActivityLogTable from "@/component/ActivityLog/ActivityLogTable";
import LoginAnalytics from "@/component/ActivityLog/LoginAnalytics";
import {
  fetchStaffActivityDirectory,
  getLoginStats,
  getAllStaff,
  getAllDepartments,
  getUniqueActions,
  ActivityLog,
  LoginStats
} from "@/utils/activities";

import dayjs from "dayjs";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import { AlertCircle, BarChart3, Calendar, ChevronDown, History, Search } from "lucide-react";
import io from "socket.io-client";
import CeoMessageReadStatsModal from "@/component/ActivityLog/CeoMessageReadStatsModal";
import Api from "@/utils/api";

// Dashboard Navigation & Timeframe Types
type TabType = "feed" | "analytics";
type PeriodType = "daily" | "weekly" | "monthly" | "yearly";

export default function CeoActivityLogsPage() {
  const router = useRouter();

  // CEO Guard State
  const [isCeo, setIsCeo] = useState<boolean | null>(null);

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<TabType>("feed");

  // Data State
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<LoginStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter Metadata
  const [staffList, setStaffList] = useState<{ id: number, firstName: string, lastName: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);
  const [actionsList, setActionsList] = useState<string[]>([]);

  // Active Filters
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<string>("All");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [period, setPeriod] = useState<PeriodType>("daily");
  const [referenceDate, setReferenceDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Real-time updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Analysis Modal
  const [analysisModal, setAnalysisModal] = useState<{
    type: "announcement" | "ceoMessage";
    id: string;
    title: string;
  } | null>(null);

  // Temp Filters for Dropdown
  const [tempFilters, setTempFilters] = useState({
    department: "All",
    role: "All",
    location: "All",
    staff: "All",
    date: dayjs().format("YYYY-MM-DD"),
    action: "All"
  });

  const filterRef = useRef<HTMLDivElement>(null);

  // CEO Authorization Check
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("user-token");
      if (!token) {
        setIsCeo(false);
        router.push("/presignin");
        return;
      }
      try {
        const res = await Api.get("/staff-register/staff/viewProfile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.isCeo) {
          setIsCeo(true);
        } else {
          setIsCeo(false);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setIsCeo(false);
      }
    };
    checkAuth();
  }, [router]);

  // Initialize
  useEffect(() => {
    if (isCeo) {
      fetchMetadata();
    }
  }, [isCeo]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch data when filters/page change
  useEffect(() => {
    if (isCeo) {
      fetchData();
    }
  }, [activeTab, period, referenceDate, selectedStaff, selectedDept, selectedLocation, selectedAction, page, debouncedSearch, refreshTrigger, isCeo]);

  // Real-time socket connection for staff online/offline status
  useEffect(() => {
    if (!isCeo) return;
    const token = localStorage.getItem("user-token");
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const socket = io(`${socketUrl}/chat`, {
      query: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("ActivityLogs connected to real-time gateway");
    });

    socket.on("staff:online", () => {
      setRefreshTrigger((prev) => prev + 1);
    });

    socket.on("staff:offline", () => {
      setRefreshTrigger((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [isCeo]);

  const fetchMetadata = async () => {
    try {
      const [sData, dData, aData] = await Promise.all([
        getAllStaff(),
        getAllDepartments(),
        getUniqueActions()
      ]);
      setStaffList(sData);
      setDepartments(dData);
      setActionsList(aData);
    } catch (err) {
      console.error("Failed to fetch filter metadata", err);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const commonParams = {
        type: period,
        date: referenceDate,
        staffId: selectedStaff !== "All" ? Number(selectedStaff) : undefined,
        departmentId: selectedDept !== "All" ? Number(selectedDept) : undefined,
        search: debouncedSearch || undefined,
      };

      if (activeTab === "feed") {
        const result = await fetchStaffActivityDirectory({
          ...commonParams,
          action: selectedAction !== "All" ? selectedAction : undefined,
          page,
          limit,
        });

        let filteredData = result.data;

        if (selectedLocation !== "All") {
          filteredData = filteredData.filter(a => a.location === selectedLocation);
        }

        setActivities(filteredData);
        setTotalPages(result.totalPages);
      } else {
        const statsData = await getLoginStats(commonParams);
        setStats(statsData);
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setShowDropdown(false);
  };

  const locations = Array.from(new Set(activities.map(a => a.location))).filter(Boolean);

  if (isCeo === null) {
    return (
      <StaffLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#95D700]"></div>
        </div>
      </StaffLayout>
    );
  }

  if (isCeo === false) {
    return (
      <StaffLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 max-w-md">
            You do not have the required CEO privileges to view the platform's activity intelligence dashboard.
          </p>
          <button
            onClick={() => router.push("/staff-dashboard")}
            className="mt-8 px-6 py-3 bg-[#95D700] text-white font-bold rounded-xl hover:bg-[#7AB800] transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </StaffLayout>
    );
  }

  return (
    <>
      <StaffLayout>
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d0d0d] p-2 md:p-6 lg:p-8 transition-colors">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-[#95D700]/10 rounded-lg">
                    <History className="text-[#95D700]" size={20} />
                  </div>
                  <span className="text-[#95D700] font-bold tracking-widest text-xs uppercase">Platform Governance</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Activity Intelligence
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg text-sm md:text-base">
                  Comprehensive audit logs and usage analytics to track staff engagement and platform performance.
                </p>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 sticky top-4 z-40 transition-colors">
              {/* Tabs */}
              <div className="flex p-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl w-full lg:w-auto transition-colors">
                <button
                  onClick={() => setActiveTab("feed")}
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "feed"
                    ? "bg-white dark:bg-[#222] text-[#95D700] shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <History size={16} />
                  Activity Feed
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "analytics"
                    ? "bg-white dark:bg-[#222] text-[#95D700] shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <BarChart3 size={16} />
                  Usage Analytics
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end relative">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] lg:max-w-md">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search actions, staff, or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-w-0 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#95D700]/50 transition-all appearance-none leading-normal"
                  />
                </div>

                {/* Time Period select */}
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodType)}
                  className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#95D700]/50 transition-colors"
                >
                  <option value="daily">Daily View</option>
                  <option value="weekly">Weekly View</option>
                  <option value="monthly">Monthly View</option>
                  <option value="yearly">Yearly View</option>
                </select>

                {/* Filter Dropdown */}
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-bold transition-all ${showDropdown
                    ? "bg-[#95D700] text-white border-[#95D700]"
                    : "bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-[#95D700]"
                    }`}
                >
                  <span>Filter</span>
                  <ChevronDown size={14} className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                {showDropdown && (
                  <div
                    ref={filterRef}
                    className="absolute top-14 right-0 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-[100] p-6 space-y-4 animate-in fade-in zoom-in duration-200 min-w-[320px] transition-colors"
                  >
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                      Filter by
                    </h3>

                    {/* Calendar / Reference Date */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Calendar / Reference Date
                      </label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          value={tempFilters.date}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTempFilters(prev => ({ ...prev, date: val }));
                            setReferenceDate(val);
                            setPage(1);
                          }}
                          className="w-full min-w-0 min-h-[40px] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] px-9 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all appearance-none leading-normal"
                        />
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Department
                      </label>
                      <select
                        value={tempFilters.department}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempFilters(prev => ({ ...prev, department: val }));
                          setSelectedDept(val);
                          setPage(1);
                        }}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                      >
                        <option value="All">All</option>
                        {departments.map(d => <option key={d.id} value={d.id.toString()}>{d.name}</option>)}
                      </select>
                    </div>

                     {/* Staff Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Selected Staff
                      </label>
                      <select
                        value={tempFilters.staff}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempFilters(prev => ({ ...prev, staff: val }));
                          setSelectedStaff(val);
                          setPage(1);
                        }}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                      >
                        <option value="All">All Staff</option>
                        {staffList.map(s => <option key={s.id} value={s.id.toString()}>{s.firstName} {s.lastName}</option>)}
                      </select>
                    </div>

                    {/* Activity Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Activity / Action Type
                      </label>
                      <select
                        value={tempFilters.action}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempFilters(prev => ({ ...prev, action: val }));
                          setSelectedAction(val);
                          setPage(1);
                        }}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all max-w-full"
                      >
                        <option value="All">All Activities</option>
                        {actionsList.map((act, index) => (
                          <option key={index} value={act}>
                            {act}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleApplyFilter}
                      className="w-full py-3 bg-[#95D700] text-white font-bold rounded-lg hover:bg-[#78B500] transition-colors shadow-lg active:scale-[0.98] mt-2"
                    >
                      Apply Filter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 dark:text-red-200 text-lg">System Alert</h3>
                    <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                    <button
                      onClick={() => fetchData()}
                      className="mt-3 px-4 py-1.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "feed" ? (
                <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
                  <div className="px-4 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity Records</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Showing {activities.length} audit logs</p>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-[#1a1a1a] px-4 py-2 rounded-xl transition-colors">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Success</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Failures</span>
                    </div>
                  </div>
                  <div>
                    <ActivityLogTable
                      activities={activities}
                      isLoading={isLoading}
                      onViewAnalysis={(activity) => {
                        const isCeo = activity.action.startsWith("Read CEO Message");
                        if (isCeo) {
                          setAnalysisModal({
                            type: "ceoMessage",
                            id: activity.referenceId!,
                            title: activity.action.split(": ")[1] || "Activity Detail",
                          });
                        }
                      }}
                    />
                  </div>

                  {analysisModal?.type === "ceoMessage" && (
                    <CeoMessageReadStatsModal
                      messageId={analysisModal.id}
                      title={analysisModal.title}
                      onClose={() => setAnalysisModal(null)}
                    />
                  )}


                  {/* Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a1a1a]/50 flex items-center justify-between transition-colors">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
                      <div className="flex gap-2">
                        <button
                          disabled={page === 1}
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors"
                        >
                          Prev
                        </button>
                        <button
                          disabled={page === totalPages}
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <LoginAnalytics stats={stats} isLoading={isLoading} />
                </>
              )}
            </div>
          </div>
        </div>
      </StaffLayout>
    </>
  );
}
