"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Grid3x3, List } from "lucide-react";

import Api from "@/utils/api";
import { TaskDTO } from "@/dataTypes/Data-Types";
import { StaticImageData } from "next/image";
import BoardView from "./BoardView";
import TableView from "./TableView";

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

  // Filters
  const [sprintFilter, setSprintFilter] = useState<number | "all">("all");
  const [staffFilter, setStaffFilter] = useState<number | "all">("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<number | "">("");
  const [monthFilter, setMonthFilter] = useState<number | "">("");
  const [dayFilter, setDayFilter] = useState<number | "">("");

  // Department filters
  const [userDeptName, setUserDeptName] = useState<string | null>(null);
  const [userDeptId, setUserDeptId] = useState<number | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<number | "all">("all");
  const [allDepartments, setAllDepartments] = useState<
    { id: number; name: string }[]
  >([]);

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

  // Fetch departments
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

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        let res;
        const staffId = localStorage.getItem("userId");

        const params = new URLSearchParams();
        if (yearFilter) params.append("year", String(yearFilter));
        if (monthFilter) params.append("month", String(monthFilter));
        if (dayFilter) params.append("day", String(dayFilter));

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
        } else if (selectedDeptId !== "all" && typeof selectedDeptId === "number") {
          const params = new URLSearchParams();
          if (sprintFilter !== "all") params.append("sprint", String(sprintFilter));
          if (staffFilter !== "all") params.append("staffId", String(staffFilter));
          if (yearFilter) params.append("year", String(yearFilter));
          if (monthFilter) params.append("month", String(monthFilter));
          if (dayFilter) params.append("day", String(dayFilter));
          const query = params.toString();
          res = await Api.get(
            `/task/department/${selectedDeptId}${query ? `?${query}` : ""}`,
          );
        } else {
          // Default for "All" departments without Project ID
          const params = new URLSearchParams();
          if (sprintFilter !== "all") params.append("sprint", String(sprintFilter));
          // If staff filter is selected, send it to backend to filter login staff tasks?
          if (staffFilter !== "all") params.append("staffId", String(staffFilter));
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

        setTasks(res?.data?.openTasks || res?.data || []);
      } catch (err) {
        console.error("Error fetching tasks", err);
        // Handle 404 by treating as empty array instead of erroring out
        if ((err as any)?.response?.status === 404) {
          setTasks([]);
        } else {
          setTasks([]);
        }
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
    staffFilter,
    yearFilter,
    monthFilter,
    dayFilter,
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
          const deptToUse =
            typeof selectedDeptId === "number"
              ? allDepartments.find((d) => d.id === selectedDeptId)?.name
              : userDeptName;

          if (deptToUse) {
            res = await Api.get(
              `/staff-register/all/staffs/by-department?name=${encodeURIComponent(deptToUse)}`,
            );
            setStaffList(res.data || []);
          }
        }
      } catch (err) {
        console.error("Error fetching staff list", err);
      }
    };

    if (project?.id || userDeptName || typeof selectedDeptId === "number") {
      fetchStaffList();
    }
  }, [project?.id, userDeptName, selectedDeptId, allDepartments]);

  // Apply filters
  let displayedTasks = [...tasks];

  if (sprintFilter !== "all") {
    displayedTasks = displayedTasks.filter((t) => t.sprint === sprintFilter);
  }

  if (staffFilter !== "all") {
    displayedTasks = displayedTasks.filter((t) =>
      t.assignedTo?.some((a) => a.staff?.id === staffFilter),
    );
  }

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
  if (searchQuery.trim()) {
    filteredTasks = filteredTasks.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  console.log("Project in DisplayTask:", project);

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        {/* Search & Action Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Search Bar */}
          <div className="flex-1 min-w-64 relative">
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

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm font-medium">Filter by</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

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
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Export CSV
          </button>

          {/* New Task Button */}
          <Link
            href={
              project?.uuid ? `/project/${project.uuid}/add_task` : "/add_task"
            }
          >
            <button className="px-4 py-2 bg-[#86CD23] hover:bg-[#7ab520] text-black font-semibold text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1">
              + New Task
            </button>
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="z-5 absolute left-0 right-0 top-38 ml-auto mr-auto bg-white dark:bg-[#141414] rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 max-w-xs">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
            Filter by
          </h3>

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

            {/* Sprint Filter */}
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
      )}

      {/* View Content */}
      {isBoard ? (
        <BoardView
          tasks={filteredTasks}
          projectId={project?.id}
          loading={loading}
          onTasksUpdate={() => {
            const event = new Event("taskUpdated");
            window.dispatchEvent(event);
          }}
        />
      ) : (
        <TableView
          tasks={filteredTasks}
          loading={loading}
          selectedTask={selectedTask}
          onTaskSelect={setSelectedTask}
          onTaskClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default DisplayTask;
