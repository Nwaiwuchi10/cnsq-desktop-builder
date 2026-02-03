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

interface Project {
  id: number;
  projectName: string;
}

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
  projectId: Project;
}

const ProjectTasksSheet: React.FC<DisplayTaskProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [sprintFilter, setSprintFilter] = useState<number | "all">("all");
  const [staffFilter, setStaffFilter] = useState<number | "all">("all");

  const [selectedDate, setSelectedDate] = useState<string>("");

  const [yearFilter, setYearFilter] = useState<number | "">("");
  const [monthFilter, setMonthFilter] = useState<number | "">("");
  const [dayFilter, setDayFilter] = useState<number | "">("");

  // ✅ Fetch tasks based on staff or project
  const fetchTasks = async () => {
    setLoading(true);
    try {
      let res;

      // Build query params ONLY when staff is selected
      const params = new URLSearchParams();

      if (yearFilter) params.append("year", String(yearFilter));
      if (monthFilter) params.append("month", String(monthFilter));
      if (dayFilter) params.append("day", String(dayFilter));

      if (staffFilter === "all") {
        const query = params.toString();
        res = await Api.get(
          `/task/project/${projectId?.id}${query ? `?${query}` : ""}`,
        );
      } else {
        const query = params.toString();
        res = await Api.get(
          `/task/staff/${staffFilter}/project/${projectId?.id}${
            query ? `?${query}` : ""
          }`,
        );
      }

      setTasks(res.data || []);
    } catch (err) {
      console.error("Error fetching tasks", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTasks();
  }, [projectId, staffFilter, yearFilter, monthFilter, dayFilter]);

  const fetchTasksy = async () => {
    setLoading(true);
    try {
      let res;
      if (staffFilter === "all") {
        res = await Api.get(`/task/project/${projectId?.id}`);
      } else {
        res = await Api.get(
          `/task/staff/${staffFilter}/project/${projectId?.id}`,
        );
      }
      setTasks(res.data || []);
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
      const res = await Api.get(`/projects/${projectId?.id}/staffs`);
      const staffOnly = (res.data || []).map((item: any) => item.staff); // 🔹 unwrap staff
      setStaffList(staffOnly);
    } catch (err) {
      console.error("Error fetching staff list", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, staffFilter]);

  useEffect(() => {
    fetchStaffList();
  }, [projectId]);

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
          <h2 className="text-lg font-semibold text-gray-600">Project Tasks</h2>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Sprint Dropdown */}
            <select
              className="px-3 py-2 border rounded-lg text-gray-600 border-gray-500"
              value={sprintFilter}
              onChange={(e) =>
                setSprintFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
            >
              <option value="all" className="text-gray-600">
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
              <option value="all" className="text-gray-600">
                All Staff
              </option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>

            {/* date picker filter */}
            {/* Date Picker */}
            <input
              type="date"
              className="px-3 py-2 border rounded-lg border-gray-500 text-gray-600 cursor-pointer"
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
              className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 cursor-pointer"
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
        <table className="min-w-full border border-gray-700 rounded-lg text-sm text-gray-600">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr className="text-gray-600">
              <th className="p-2 border text-gray-600">Sprint</th>
              <th className="p-2 border text-gray-600">Title</th>
              <th className="p-2 border text-gray-600">Status</th>
              <th className="p-2 border text-gray-600">Priority</th>
              <th className="p-2 border text-gray-600">Urgency</th>
              <th className="p-2 border text-gray-600">Start Date</th>
              <th className="p-2 border text-gray-600">Due Date</th>
              <th className="p-2 border text-gray-600">Timeline</th>
              <th className="p-2 border text-gray-600">Module</th>
              <th className="p-2 border text-gray-600">Project</th>
              <th className="p-2 border text-gray-600">Assigned To</th>
              <th className="p-2 border text-gray-600">Created At</th>
            </tr>
          </thead>
          <tbody>
            {displayedTasks.map((t: any) => (
              <tr
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedTask(t)}
                key={t.id}
                className="odd:bg-white even:bg-gray-50 text-gray-600 hover:bg-green-100 transition-colors duration-150 cursor-pointer text-gray-600"
              >
                <td className="p-2 border text-gray-600">{t?.sprint}</td>
                <td
                  className="p-2 border cursor-pointer text-gray-600"
                  onClick={() => setSelectedTask(t)}
                >
                  {t.title}
                </td>
                {/* Status */}
                <td className="p-2 border">
                  {t.status ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[t.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {formatLabel(t.status)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

                {/* Priority */}
                <td className="p-2 border">
                  {t.priority ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priorityColors[t.priority] ||
                        "bg-gray-100 text-gray-600"
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
                        urgencyColors[t.urgency] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {formatLabel(t.urgency)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 border text-gray-600">
                  {t.startDate
                    ? new Date(t?.startDate).toLocaleDateString()
                    : "Not set"}
                </td>
                <td className="p-2 border text-gray-600">
                  {t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString()
                    : "Not set"}
                </td>
                <td className="p-2 border text-gray-600">{t.timeline}</td>
                <td className="p-2 border text-gray-600">{t.taskModule}</td>
                <td className="p-2 border text-gray-600">
                  {t.project?.projectName}
                </td>
                <td className="p-2 border text-gray-600">
                  {t.assignedTo
                    .map(
                      (a: any) =>
                        `${a.staff.firstName} ${a.staff.lastName} (${a.role})`,
                    )
                    .join(", ")}
                </td>
                <td className="p-2 border text-gray-600">
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
