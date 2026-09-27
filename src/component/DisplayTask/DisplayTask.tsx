"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Grid3x3, List, X } from "lucide-react";

import Api from "@/utils/api";
import { TaskDTO } from "@/dataTypes/Data-Types";
import { StaticImageData } from "next/image";
import BoardView from "./BoardView";
import TableView from "./TableView";
import { exportTasksToCSV } from "@/utils/csvExport";

interface Project {
  id: number;
  uuid: string;
  projectName: string;
  desc?: string;
  status: string;
  startDate: string;
  endDate: string;
  priority: string;
  timeLine: string;
  prodUrl: string;
  stagingUrl: string;
  apk?: string;
  assignedTo: {
    id: number;
    role: string;
    staff: {
      id: number;
      uuid: string;
      firstName: string;
      lastName: string;
      email: string;
      photoUrl: string | StaticImageData | null;
    };
  }[];
  comments: {
    id: number;
    text: string;
    staff: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }[];
  createdBy: {
    firstName: string;
    lastName: string;
  };
}
interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
interface DisplayTaskProps {
  project?: Project; // optional now
}

const DisplayTask: React.FC<DisplayTaskProps> = ({ project }) => {
  const [isBoard, setIsBoard] = useState(false);
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [taskType, setTaskType] = useState<"assigned" | "created" | "department">("assigned");
  const [hasCreatedTasks, setHasCreatedTasks] = useState(false);
  const [isHod, setIsHod] = useState(false);

  // Filters
  const [sprintFilter, setSprintFilter] = useState<number | "all">("all");
  const [staffFilter, setStaffFilter] = useState<number | "all">("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<number | "">("");
  const [monthFilter, setMonthFilter] = useState<number | "">("");
  const [dayFilter, setDayFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");

  // Department filters
  const [userDeptName, setUserDeptName] = useState<string | null>(null);
  const [userDeptId, setUserDeptId] = useState<number | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<number | "all">("all");
  const [allDepartments, setAllDepartments] = useState<
    { id: number; name: string }[]
  >([]);

  // Project filters
  const [projectFilter, setProjectFilter] = useState<number | "all">("all");
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // Pagination & Refresh
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("user-token");
      if (!token) return;
      try {
        const res = await Api.get("/staff-register/staff/viewProfile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const deptId = res.data?.employment?.department?.id || null;
        setUserDeptName(res.data?.employment?.department?.name || null);
        setUserDeptId(deptId);
        // Do not auto-select department so we can show login staff tasks by default
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    if (!project?.id) {
      fetchUserProfile();
    }
  }, [project?.id]);

  // Check if staff has any created tasks to conditionally show the tab
  useEffect(() => {
    const checkCreatedTasks = async () => {
      try {
        const res = await Api.get("/task/login/staff?type=created&limit=1");
        const fetchedTasks =
          res?.data?.data ||
          res?.data?.openTasks ||
          (Array.isArray(res?.data) ? res.data : []);
        setHasCreatedTasks(fetchedTasks.length > 0);
      } catch (err) {
        console.error("Failed to check created tasks", err);
      }
    };
    checkCreatedTasks();
  }, []);

  // Fetch departments//
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await Api.get("/departments");
        setAllDepartments(res.data || []);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    };
    if (!project?.id) {
      fetchDepartments();
    }
  }, [project?.id]);

  // Fetch projects under selected department (or all projects)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let url = "/projects";
        if (selectedDeptId !== "all") {
          url += `?departmentId=${selectedDeptId}`;
        }
        const res = await Api.get(url);
        setAllProjects(res.data || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    if (!project?.id) {
      fetchProjects();
    }
  }, [selectedDeptId, project?.id]);

  useEffect(() => {
    if (projectFilter !== "all" && allProjects.length > 0) {
      const exists = allProjects.some((p) => p.id === projectFilter);
      if (!exists) {
        setProjectFilter("all");
      }
    } else if (allProjects.length === 0) {
      setProjectFilter("all");
    }
  }, [allProjects, projectFilter]);

  // Reset page to 1 on filter or search change
  useEffect(() => {
    setPage(1);
  }, [
    project?.id,
    selectedDeptId,
    projectFilter,
    staffFilter,
    statusFilter,
    priorityFilter,
    urgencyFilter,
    yearFilter,
    monthFilter,
    dayFilter,
    sprintFilter,
    searchQuery,
    taskType,
  ]);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        let res;
        const staffId = localStorage.getItem("userId");

        const params = new URLSearchParams();
        params.append("type", taskType);
        if (yearFilter) params.append("year", String(yearFilter));
        if (monthFilter) params.append("month", String(monthFilter));
        if (dayFilter) params.append("day", String(dayFilter));
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (priorityFilter !== "all") params.append("priority", priorityFilter);
        if (urgencyFilter !== "all") params.append("urgency", urgencyFilter);
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
        }

        if (project?.id) {
          if (staffFilter === "all") {
            const query = params.toString();
            res = await Api.get(
              `/task/project/${project.id}${query ? `?${query}` : ""}`,
            );
          } else {
            const query = params.toString();
            res = await Api.get(
              `/task/staff/${staffFilter}/project/${project.id}${query ? `?${query}` : ""
              }`,
            );
          }
        } else {
          // Default for "All" departments or specific department without Project ID
          const params = new URLSearchParams();
          params.append("type", taskType);
          if (sprintFilter !== "all") params.append("sprint", String(sprintFilter));
          if (staffFilter !== "all") params.append("staffId", String(staffFilter));
          if (selectedDeptId !== "all") params.append("departmentId", String(selectedDeptId));
          if (projectFilter !== "all") params.append("projectId", String(projectFilter));
          if (statusFilter !== "all") params.append("status", statusFilter);
          if (priorityFilter !== "all") params.append("priority", priorityFilter);
          if (urgencyFilter !== "all") params.append("urgency", urgencyFilter);
          if (yearFilter) params.append("year", String(yearFilter));
          if (monthFilter) params.append("month", String(monthFilter));
          if (dayFilter) params.append("day", String(dayFilter));
          params.append("page", String(page));
          params.append("limit", String(limit));
          if (searchQuery.trim()) {
            params.append("search", searchQuery.trim());
          }
          const query = params.toString();

          res = await Api.get(
            `/task/login/staff${query ? `?${query}` : ""}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("user-token")}`,
              },
            }
          );
        }

        const fetchedTasks = res?.data?.data || res?.data?.openTasks || (Array.isArray(res?.data) ? res.data : []);
        setTasks(fetchedTasks);

        if (res?.data?.isHod !== undefined) {
          setIsHod(res.data.isHod);
        }

        if (res?.data?.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalCount(res.data.pagination.totalCount || 0);
        } else {
          setTotalPages(1);
          setTotalCount(fetchedTasks.length);
        }
      } catch (err) {
        console.error("Error fetching tasks", err);
        setTasks([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    const staffId = localStorage.getItem("userId");
    if (project?.id || staffId || typeof selectedDeptId === "number") {
      fetchTasks();
    }
  }, [
    project?.id,
    userDeptId,
    selectedDeptId,
    projectFilter,
    staffFilter,
    statusFilter,
    priorityFilter,
    urgencyFilter,
    yearFilter,
    monthFilter,
    dayFilter,
    sprintFilter,
    page,
    limit,
    searchQuery,
    taskType,
    refreshTrigger,
  ]);

  // Fetch staff list
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        let res;
        if (project?.id) {
          res = await Api.get(`/projects/${project.id}/staffs`);
          const staffOnly = (res?.data || [])
            .map((item: any) => item?.staff)
            .filter(Boolean);
          setStaffList(staffOnly);
        } else {
          // Fetch staff from the organization, filtered by department if selected
          let url = "/staff-register/all/staffs/dept?limit=1000";
          if (selectedDeptId !== "all") {
            const deptName = allDepartments.find(d => d.id === selectedDeptId)?.name;
            if (deptName) {
              url += `&department=${encodeURIComponent(deptName)}`;
            }
          }
          res = await Api.get(url);
          setStaffList(res?.data?.data || []);
        }
      } catch (err) {
        console.error("Error fetching staff list", err);
      }
    };

    if (project?.id || userDeptName || selectedDeptId) {
      fetchStaffList();
    }
  }, [project?.id, userDeptName, selectedDeptId, allDepartments]);

  // Apply filters
  let displayedTasks = [...tasks];

  const uniqueSprints = Array.from(new Set(tasks.map((t) => t.sprint)))
    .filter(Boolean)
    .sort((a, b) => (a || 0) - (b || 0)) as number[];

  const handleApplyFilter = () => {
    // Filters are applied automatically via useEffect
  };

  const handleClearDate = () => {
    setSelectedDate("");
    setYearFilter("");
    setMonthFilter("");
    setDayFilter("");
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);

    if (!date) {
      setYearFilter("");
      setMonthFilter("");
      setDayFilter("");
      return;
    }

    const dateObj = new Date(date);
    setYearFilter(dateObj.getFullYear());
    setMonthFilter(dateObj.getMonth() + 1);
    setDayFilter(dateObj.getDate());
  };

  // Search filter
  let filteredTasks = [...displayedTasks];

  console.log("Project in DisplayTask:", project);

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const fileName = project?.projectName
      ? `tasks_${project.projectName.replace(/\s+/g, "_")}_${timestamp}.csv`
      : `tasks_export_${timestamp}.csv`;

    exportTasksToCSV(filteredTasks, fileName);
  };

  return (
    <div className="w-full relative">
      {/* Switch Tab: Assigned vs Created */}
      {!project && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 w-fit">
          <button
            onClick={() => setTaskType("assigned")}
            className={`px-6 py-2.5 text-sm font-semibold transition-all border-b-2 ${
              taskType === "assigned"
                ? "border-[#95D700] text-[#95D700]"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Assigned Task
          </button>
          {hasCreatedTasks && (
            <button
              onClick={() => setTaskType("created")}
              className={`px-6 py-2.5 text-sm font-semibold transition-all border-b-2 ${
                taskType === "created"
                  ? "border-[#95D700] text-[#95D700]"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Created Task
            </button>
          )}
          {isHod && (
            <button
              onClick={() => setTaskType("department")}
              className={`px-6 py-2.5 text-sm font-semibold transition-all border-b-2 ${
                taskType === "department"
                  ? "border-[#95D700] text-[#95D700]"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Department Task
            </button>
          )}
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        {/* Search & Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative w-full">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Actions Container */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Filter Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-sm font-medium whitespace-nowrap">Filter by</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>

              {/* Filter Panel */}
              {showFilters && (
                <>
                  {/* Mobile Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100] sm:hidden"
                    onClick={() => setShowFilters(false)}
                  />
                  <div className="z-[101] fixed inset-x-4 top-[5%] bottom-[5%] sm:bottom-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-80 bg-white dark:bg-[#141414] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Filter by
                      </h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="sm:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 mb-4">
                      {/* Department Filter */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Department
                        </label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#0d0d0d] text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={selectedDeptId}
                          onChange={(e) =>
                            setSelectedDeptId(
                              e.target.value === "all" ? "all" : Number(e.target.value),
                            )
                          }
                        >
                          <option value="all">All</option>
                          {allDepartments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Project Filter */}
                      {!project?.id && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Project
                          </label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#0d0d0d] text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={projectFilter}
                            onChange={(e) =>
                              setProjectFilter(
                                e.target.value === "all" ? "all" : Number(e.target.value),
                              )
                            }
                          >
                            <option value="all">All</option>
                            {allProjects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.projectName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Sprint Filter */}
                      {project?.id && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Sprint
                          </label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#0d0d0d] text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={sprintFilter}
                            onChange={(e) =>
                              setSprintFilter(
                                e.target.value === "all" ? "all" : Number(e.target.value),
                              )
                            }
                          >
                            <option value="all">All</option>
                            {uniqueSprints.map((s) => (
                              <option key={s} value={s}>
                                Sprint {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Staff Filter */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Staff
                        </label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#0d0d0d] text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={staffFilter}
                          onChange={(e) =>
                            setStaffFilter(
                              e.target.value === "all" ? "all" : Number(e.target.value),
                            )
                          }
                        >
                          <option value="all">All</option>
                          {staffList.map((s) =>
                            s ? (
                              <option key={s?.id} value={s?.id}>
                                {s?.firstName} {s?.lastName}
                              </option>
                            ) : null,
                          )}
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#0d0d0d] text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All</option>
                          <option value="Not_started">Not Started</option>
                          <option value="In_progress">In Progress</option>
                          <option value="Ready_To_Test">Ready to Test</option>
                          <option value="Testing_In_Progress">Testing In Progress</option>
                          <option value="Failed_Test">Failed Test</option>
                          <option value="Passed_Test">Passed Test</option>
                          <option value="Dev_Completed">Dev Setup Completed</option>
                          <option value="Completed">Completed</option>
                          <option value="On_Hold">On Hold</option>
                        </select>
                      </div>

                      {/* Priority Filter */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Priority
                        </label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#0d0d0d] text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                          <option value="all">All</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      {/* Urgency Filter */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Urgency
                        </label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#0d0d0d] text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={urgencyFilter}
                          onChange={(e) => setUrgencyFilter(e.target.value)}
                        >
                          <option value="all">All</option>
                          <option value="Immediately">Immediately</option>
                          <option value="Short_Term">Short Term</option>
                          <option value="Med_Term">Medium Term</option>
                          <option value="High_Term">High Term</option>
                        </select>
                      </div>

                      {/* Date Range Filter */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date Range
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#0d0d0d] text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                          value={selectedDate}
                          onChange={(e) => handleDateChange(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleClearDate}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Clear Date
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="w-full px-4 py-2 bg-[#95D700] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* View Toggle Icons */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setIsBoard(false)}
                className={`p-2 rounded transition-all ${!isBoard
                  ? "bg-white dark:bg-[#1a1a1a] shadow-sm"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                title="Table View"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setIsBoard(true)}
                className={`p-2 rounded transition-all ${isBoard
                  ? "bg-white dark:bg-[#1a1a1a] shadow-sm"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                title="Board View"
              >
                <Grid3x3 size={18} />
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Export
            </button>

            {/* New Task Button */}
            <Link
              href={
                project?.uuid ? `/project/${project.uuid}/add-task` : "/add-task"
              }
            >
              <button className="px-3 sm:px-4 py-2 bg-[#86CD23] hover:bg-[#7ab520] text-black font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 whitespace-nowrap">
                + New Task
              </button>
            </Link>
          </div>
        </div>
      </div>


      {/* View Content */}
      {isBoard ? (
        <BoardView
          tasks={filteredTasks}
          projectId={project?.id}
          loading={loading}
          onTasksUpdate={() => setRefreshTrigger((prev) => prev + 1)}
        />
      ) : (
        <TableView
          tasks={filteredTasks}
          projectId={project?.id}
          loading={loading}
          selectedTask={selectedTask}
          onTaskSelect={setSelectedTask}
          onTaskClose={() => setSelectedTask(null)}
          onTasksUpdate={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      {/* Pagination Controls */}
      {(totalPages > 1 || totalCount > 0) && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer font-medium"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              (Showing {totalCount > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalCount)} of {totalCount} entries)
            </span>
          </div>

          {/* Navigation Buttons */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {/* Prev */}
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page === 1
                    ? "bg-gray-250 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-[#95D700] hover:bg-[#80b800] text-black font-semibold"
                }`}
              >
                Prev
              </button>

              {/* Page numbers */}
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (page <= 3) {
                    pages.push(1, 2, 3, "...", totalPages);
                  } else if (page >= totalPages - 2) {
                    pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
                  }
                }
                return pages;
              })().map((p, idx) =>
                typeof p === "string" ? (
                  <span key={idx} className="px-2 py-1 text-gray-500 dark:text-gray-400">
                    {p}
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      page === p
                        ? "bg-[#95D700] text-black"
                        : "bg-gray-100 dark:bg-gray-850 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page === totalPages
                    ? "bg-gray-250 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "bg-[#95D700] hover:bg-[#80b800] text-black font-semibold"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DisplayTask;
