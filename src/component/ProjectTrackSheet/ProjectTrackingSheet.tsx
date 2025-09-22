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
  projectId: number | string; // coming from ProjectDetails
}

const ProjectTasksSheet: React.FC<DisplayTaskProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [sprintFilter, setSprintFilter] = useState<number | "all">("all");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    Api.get(`/task/project/${projectId}`)
      .then((res) => {
        setTasks(res.data);
      })
      .catch((err) => console.error("Error fetching tasks", err))
      .finally(() => setLoading(false));
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

  // Apply filter
  let displayedTasks = [...tasks];
  if (sprintFilter !== "all") {
    displayedTasks = displayedTasks.filter((t) => t.sprint === sprintFilter);
  }

  // Apply sort
  displayedTasks.sort((a, b) =>
    sortAsc ? a.sprint - b.sprint : b.sprint - a.sprint
  );

  // Collect all sprints for dropdown
  const uniqueSprints = Array.from(new Set(tasks.map((t) => t.sprint))).sort(
    (a, b) => a - b
  );

  return (
    <>
      <div className="p-6 w-full overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Project Tasks</h2>
          <div className="space-x-3 flex items-center">
            <select
              className="px-3 py-2 border rounded-lg"
              value={sprintFilter}
              onChange={(e) =>
                setSprintFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
            >
              <option value="all">All Sprints</option>
              {uniqueSprints.map((s) => (
                <option key={s} value={s}>
                  Sprint {s}
                </option>
              ))}
            </select>

            {/* <button
              onClick={() => setSortAsc(!sortAsc)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90"
            >
              Sort: {sortAsc ? "Ascending" : "Descending"}
            </button> */}

            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-[#95D700] text-white rounded-lg hover:opacity-90"
            >
              Export CSV
            </button>
          </div>
        </div>

        <table className="min-w-full border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Sprint</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Priority</th>
              <th className="p-2 border">Urgency</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Timeline</th>
              <th className="p-2 border">Project</th>
              <th className="p-2 border">Assigned To</th>
              <th className="p-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {displayedTasks.map((t) => (
              <tr key={t.id} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 border">{t?.sprint}</td>
                <td
                  className="p-2 border cursor-pointer"
                  onClick={() => setSelectedTask(t)}
                >
                  {t.title}
                </td>
                <td className="p-2 border">{t?.status}</td>
                <td className="p-2 border">{t.priority}</td>
                <td className="p-2 border">{t.urgency}</td>
                <td className="p-2 border">
                  {t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString()
                    : "Not set"}
                </td>
                <td className="p-2 border">{t.timeline}</td>
                <td className="p-2 border">{t.project?.projectName}</td>
                <td className="p-2 border">
                  {t.assignedTo
                    .map(
                      (a) =>
                        `${a.staff.firstName} ${a.staff.lastName} (${a.role})`
                    )
                    .join(", ")}
                </td>
                <td className="p-2 border">
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
