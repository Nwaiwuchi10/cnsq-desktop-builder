"use client";

import { useEffect, useState } from "react";
import Api from "@/utils/api";

// import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { TaskDTO } from "@/dataTypes/Data-Types";
import TaskModal from "../DisplayTask/TaskDetailsModal";
import { StaticImageData } from "next/image";

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

interface TaskAssignment {
  id: number;
  staff: Staff;
  role: string;
}

// interface Project {
//   id: number;
//   projectName: string;
// }

interface TaskComment {
  id: number;
  task: TaskDTO;
  text: string;
  staff: Staff;
  mentionedStaff: Staff;
  createdAt: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  taskModule?: string;
  status?: string;
  priority?: string;
  urgency?: string;
  startDate?: string;
  dueDate?: string;
  timeline?: string;
  createdAt: string;
  project: Project;
  sprint: number;
  assignedTo: TaskAssignment[];
  comments: TaskComment[];
}

interface DisplayTaskProps {
  projectId?: number;
}

const ProjectTasksSheet: React.FC<DisplayTaskProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [sprintFilter, setSprintFilter] = useState<number | "all">("all");
  const [staffFilter, setStaffFilter] = useState<number | "all">("all");
  const [userDeptName, setUserDeptName] = useState<string | null>(null);
  const [userDeptId, setUserDeptId] = useState<number | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<number | "all">("all");
  const [allDepartments, setAllDepartments] = useState<
    { id: number; name: string }[]
  >([]);

  const [selectedDate, setSelectedDate] = useState<string>("");

  const [yearFilter, setYearFilter] = useState<number | "">("");
  const [monthFilter, setMonthFilter] = useState<number | "">("");
  const [dayFilter, setDayFilter] = useState<number | "">("");

  // ✅ Fetch tasks based on staff or project
  const fetchTasks = async () => {
    setLoading(true);
    try {
      let res;
      const staffId = localStorage.getItem("userId");
      
      // Build query params
      const params = new URLSearchParams();
      if (yearFilter) params.append("year", String(yearFilter));
      if (monthFilter) params.append("month", String(monthFilter));
      if (dayFilter) params.append("day", String(dayFilter));

      if (projectId) {
        if (staffFilter === "all") {
          const query = params.toString();
          res = await Api.get(
            `/task/project/${projectId}${query ? `?${query}` : ""}`,
          );
        } else {
          const query = params.toString();
          res = await Api.get(
            `/task/staff/${staffFilter}/project/${projectId}${
              query ? `?${query}` : ""
            }`,
          );
        }
      } else if (selectedDeptId !== "all") {
        // Selected department view
        const query = params.toString();
        res = await Api.get(
          `/task/department/${selectedDeptId}${query ? `?${query}` : ""}`,
        );
      } else if (userDeptId) {
        // Default departmental view
        const query = params.toString();
        res = await Api.get(
          `/task/department/${userDeptId}${query ? `?${query}` : ""}`,
        );
      } else if (staffId) {
        // Global mode fallback: fetch all tasks for this staff
        const targetStaff = staffFilter === "all" ? staffId : staffFilter;
        const query = params.toString();
        res = await Api.get(
          `/task/staff/${targetStaff}/tasks-by-status?openPageNum=1&openPageSize=100${query ? `&${query}` : ""}`,
        );
      }

      setTasks(res?.data?.openTasks || res?.data || []);
    } catch (err) {
      console.error("Error fetching tasks", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch staff list for dropdown (map response correctly)
  const fetchStaffList = async () => {
    try {
      let res;
      if (projectId) {
        res = await Api.get(`/projects/${projectId}/staffs`);
        const staffOnly = (res?.data || [])
          .map((item: any) => item?.staff)
          .filter(Boolean);
        setStaffList(staffOnly);
      } else {
        const deptToUse =
          selectedDeptId !== "all"
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
        if (deptId) setSelectedDeptId(deptId);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    if (!projectId) {
      fetchUserProfile();
    }
  }, [projectId]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await Api.get("/departments");
        setAllDepartments(res.data || []);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    };
    if (!projectId) {
      fetchDepartments();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId || userDeptId || selectedDeptId !== "all") {
      fetchTasks();
    }
  }, [
    projectId,
    userDeptId,
    selectedDeptId,
    staffFilter,
    yearFilter,
    monthFilter,
    dayFilter,
  ]);

  useEffect(() => {
    if (projectId || userDeptName || selectedDeptId !== "all") {
      fetchStaffList();
    }
  }, [projectId, userDeptName, selectedDeptId]);

  // const exportToCSV = () => {
  //   const data = tasks.map((t) => ({
  //     // ID: t.id,
  //     Sprint: t.sprint,
  //     Title: t.title,
  //     Description: t.description || "",
  //     Status: t.status,
  //     Priority: t.priority,
  //     Urgency: t.urgency,
  //     DueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "Not set",
  //     Timeline: t.timeline || "",
  //     Module: t.taskModule || "",
  //     Project: t.project?.projectName,
  //     AssignedTo: t.assignedTo
  //       .map((a) => `${a.staff.firstName} ${a.staff.lastName} (${a.role})`)
  //       .join(", "),
  //     CreatedAt: new Date(t.createdAt).toLocaleDateString(),
  //   }));

  //   const ws = XLSX.utils.json_to_sheet(data);
  //   const csv = XLSX.utils.sheet_to_csv(ws);

  //   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  //   saveAs(blob, "tasks.csv");
  // };

  if (loading) return <p>Loading...</p>;

  // ✅ Apply sprint filter
  let displayedTasks = [...tasks];
  if (sprintFilter !== "all") {
    displayedTasks = displayedTasks.filter((t) => t.sprint === sprintFilter);
  }

  // ✅ Collect sprints for dropdown
  const uniqueSprints = Array.from(new Set(tasks.map((t) => t.sprint))).sort(
    (a, b) => a - b,
  );
  // ✅ Status Colors
  const statusColors: Record<string, string> = {
    Not_started: "bg-red-100 text-red-600",
    Failed_Test: "bg-red-100 text-red-700", // Not Started → Red
    In_progress: "bg-yellow-100 text-yellow-600",
    Ready_To_Test: "bg-blue-100 text-blue-600",
    Testing_In_Progress: "bg-purple-100 text-purple-600",
    On_Hold: "bg-orange-200 text-orange-600",
    Passed_Test: "bg-green-100 text-green-500",
    Dev_Completed: "bg-green-300 text-green-500",
    Completed: "bg-green-200 text-green-600",
  };

  // ✅ Priority Colors
  const priorityColors: Record<string, string> = {
    Low: "bg-green-100 text-green-600",
    Medium: "bg-yellow-100 text-yellow-600",
    High: "bg-red-100 text-red-600",
  };

  // ✅ Urgency Colors
  const urgencyColors: Record<string, string> = {
    Short_Term: "bg-green-100 text-green-600",
    Med_Term: "bg-yellow-100 text-yellow-600",
    High_Term: "bg-orange-100 text-orange-600",
    Immediately: "bg-red-100 text-red-600 font-semibold",
  };

  // ✅ Format function (remove underscores, capitalize)
  const formatLabel = (val?: string) => {
    if (!val) return "—";
    return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <>
      <div className="p-6 w-full overflow-x-auto ">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3 ">
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Project Tasks</h2>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Department Filter (Global only) */}
            {!projectId && (
              <select
                className="px-3 py-2 border rounded-lg text-gray-600 dark:text-gray-400 border-gray-500 bg-white dark:bg-[#1a1a1a]"
                value={selectedDeptId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDeptId(val === "all" ? "all" : Number(val));
                }}
              >
                <option value="all">All Departments</option>
                {allDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
            {/* Sprint Dropdown */}
            <select
              className="px-3 py-2 border rounded-lg text-gray-600 dark:text-gray-400 border-gray-500"
              value={sprintFilter}
              onChange={(e) =>
                setSprintFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
            >
              <option value="all" className="text-gray-600 dark:text-gray-400">
                All Sprints
              </option>
              {uniqueSprints.map((s) => (
                <option key={s} value={s}>
                  Sprint {s}
                </option>
              ))}
            </select>

            {/* Staff Dropdown */}
            <select
              className="px-3 py-2 border rounded-lg border-gray-500"
              value={staffFilter}
              onChange={(e) =>
                setStaffFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
            >
              <option value="all" className="text-gray-600 dark:text-gray-400">
                All Staff
              </option>
              {staffList.map((s) =>
                s ? (
                  <option key={s?.id} value={s?.id}>
                    {s?.firstName} {s?.lastName}
                  </option>
                ) : null,
              )}
            </select>

            {/* date picker filter */}
            {/* Date Picker */}
            <input
              type="date"
              className="px-3 py-2 border rounded-lg border-gray-500 text-gray-600 dark:text-gray-400 cursor-pointer"
              value={selectedDate}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedDate(value);

                if (!value) {
                  setYearFilter("");
                  setMonthFilter("");
                  setDayFilter("");
                  return;
                }

                const date = new Date(value);
                setYearFilter(date.getFullYear());
                setMonthFilter(date.getMonth() + 1); // JS months = 0-based
                setDayFilter(date.getDate());
              }}
            />

            <button
              onClick={() => {
                setSelectedDate("");
                setYearFilter("");
                setMonthFilter("");
                setDayFilter("");
              }}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-300 cursor-pointer"
            >
              Clear Date
            </button>

            <button
              // onClick={exportToCSV}
              className="px-4 py-2 bg-[#95D700] text-white rounded-lg hover:opacity-90"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Tasks Table */}
        <table className="min-w-full border border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
          <thead className="bg-gray-100 dark:bg-gray-800 transition-colors text-left text-gray-600 dark:text-gray-400">
            <tr className="text-gray-600 dark:text-gray-400">
              <th className="p-2 border text-gray-600 dark:text-gray-400">Sprint</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Title</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Status</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Priority</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Urgency</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Start Date</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Due Date</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Timeline</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Module</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Project</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Assigned To</th>
              <th className="p-2 border text-gray-600 dark:text-gray-400">Created At</th>
            </tr>
          </thead>
          <tbody>
            {displayedTasks?.map((t: any) => (
              <tr
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedTask(t)}
                key={t?.id}
                className="odd:bg-white dark:bg-[#141414] transition-colors even:bg-gray-50 dark:bg-[#1a1a1a] transition-colors text-gray-600 dark:text-gray-400 hover:bg-green-100 duration-150 cursor-pointer text-gray-600 dark:text-gray-400"
              >
                <td className="p-2 border text-gray-600 dark:text-gray-400">{t?.sprint}</td>
                <td
                  className="p-2 border cursor-pointer text-gray-600 dark:text-gray-400"
                  onClick={() => setSelectedTask(t)}
                >
                  {t?.title}
                </td>
                {/* Status */}
                <td className="p-2 border">
                  {t?.status ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[t?.status] || "bg-gray-100 dark:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {formatLabel(t?.status)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

                {/* Priority */}
                <td className="p-2 border">
                  {t?.priority ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priorityColors[t.priority] ||
                        "bg-gray-100 dark:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {formatLabel(t.priority)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

                {/* Urgency */}
                <td className="p-2 border">
                  {t.urgency ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        urgencyColors[t.urgency] || "bg-gray-100 dark:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {formatLabel(t.urgency)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 border text-gray-600 dark:text-gray-400">
                  {t.startDate
                    ? new Date(t?.startDate).toLocaleDateString()
                    : "Not set"}
                </td>
                <td className="p-2 border text-gray-600 dark:text-gray-400">
                  {t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString()
                    : "Not set"}
                </td>
                <td className="p-2 border text-gray-600 dark:text-gray-400">{t?.timeline}</td>
                <td className="p-2 border text-gray-600 dark:text-gray-400">{t?.taskModule}</td>
                <td className="p-2 border text-gray-600 dark:text-gray-400">
                  {t?.project?.projectName}
                </td>
                <td className="p-2 border text-gray-600 dark:text-gray-400">
                  {t?.assignedTo
                    ?.filter((a: any) => a?.staff) // ✅ guard
                    .map(
                      (a: any) =>
                        `${a.staff.firstName} ${a.staff.lastName} (${a.role})`,
                    )
                    .join(", ")}
                </td>
                <td className="p-2 border text-gray-600 dark:text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </>
  );
};

export default ProjectTasksSheet;
