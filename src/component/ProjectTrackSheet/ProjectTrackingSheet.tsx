"use client";

import { useEffect, useState } from "react";
import Api from "@/utils/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { TaskDTO } from "@/dataTypes/Data-Types";
import TaskModal from "../DisplayTask/TaskDetailsModal";

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
  status?: string;
  priority?: string;
  urgency?: string;
  dueDate?: string;
  timeline?: string;
  createdAt: string;
  project: Project;
  sprint: number;
  assignedTo: TaskAssignment[];
  comments: TaskComment[];
}

interface DisplayTaskProps {
  projectId: number | string;
}

const ProjectTasksSheet: React.FC<DisplayTaskProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [sprintFilter, setSprintFilter] = useState<number | "all">("all");
  const [staffFilter, setStaffFilter] = useState<number | "all">("all");

  // ✅ Fetch tasks based on staff or project
  const fetchTasks = async () => {
    setLoading(true);
    try {
      let res;
      if (staffFilter === "all") {
        res = await Api.get(`/task/project/${projectId}`);
      } else {
        res = await Api.get(`/task/staff/${staffFilter}/project/${projectId}`);
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
      const res = await Api.get(`/projects/${projectId}/staffs`);
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

  const exportToCSV = () => {
    const data = tasks.map((t) => ({
      ID: t.id,
      Sprint: t.sprint,
      Title: t.title,
      Description: t.description || "",
      Status: t.status,
      Priority: t.priority,
      Urgency: t.urgency,
      DueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "Not set",
      Timeline: t.timeline || "",
      Project: t.project?.projectName,
      AssignedTo: t.assignedTo
        .map((a) => `${a.staff.firstName} ${a.staff.lastName} (${a.role})`)
        .join(", "),
      CreatedAt: new Date(t.createdAt).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "tasks.csv");
  };

  if (loading) return <p>Loading...</p>;

  // ✅ Apply sprint filter
  let displayedTasks = [...tasks];
  if (sprintFilter !== "all") {
    displayedTasks = displayedTasks.filter((t) => t.sprint === sprintFilter);
  }

  // ✅ Collect sprints for dropdown
  const uniqueSprints = Array.from(new Set(tasks.map((t) => t.sprint))).sort(
    (a, b) => a - b
  );

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
                  e.target.value === "all" ? "all" : Number(e.target.value)
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
                  e.target.value === "all" ? "all" : Number(e.target.value)
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

            <button
              onClick={exportToCSV}
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
              <th className="p-2 border text-gray-600">Due Date</th>
              <th className="p-2 border text-gray-600">Timeline</th>
              <th className="p-2 border text-gray-600">Project</th>
              <th className="p-2 border text-gray-600">Assigned To</th>
              <th className="p-2 border text-gray-600">Created At</th>
            </tr>
          </thead>
          <tbody>
            {displayedTasks.map((t) => (
              <tr
                key={t.id}
                className="odd:bg-white even:bg-gray-50 text-gray-600"
              >
                <td className="p-2 border text-gray-600">{t?.sprint}</td>
                <td
                  className="p-2 border cursor-pointer text-gray-600"
                  onClick={() => setSelectedTask(t)}
                >
                  {t.title}
                </td>
                <td className="p-2 border text-gray-600">{t?.status}</td>
                <td className="p-2 border text-gray-600">{t.priority}</td>
                <td className="p-2 border text-gray-600">{t.urgency}</td>
                <td className="p-2 border text-gray-600">
                  {t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString()
                    : "Not set"}
                </td>
                <td className="p-2 border text-gray-600">{t.timeline}</td>
                <td className="p-2 border text-gray-600">
                  {t.project?.projectName}
                </td>
                <td className="p-2 border text-gray-600">
                  {t.assignedTo
                    .map(
                      (a) =>
                        `${a.staff.firstName} ${a.staff.lastName} (${a.role})`
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
