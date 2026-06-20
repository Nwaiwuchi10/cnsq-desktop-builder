"use client";

import React, { useState } from "react";
import { TaskDTO } from "@/dataTypes/Data-Types";
import TaskModal from "./TaskDetailsModal";

interface TableViewProps {
  tasks: TaskDTO[];
  projectId?: number;
  loading?: boolean;
  selectedTask?: TaskDTO | null;
  onTaskSelect?: (task: TaskDTO) => void;
  onTaskClose?: () => void;
  onTasksUpdate?: () => void;
}

const TableView: React.FC<TableViewProps> = ({
  tasks,
  projectId,
  loading = false,
  selectedTask = null,
  onTaskSelect = () => {},
  onTaskClose = () => {},
  onTasksUpdate = () => {},
}) => {
  const formatLabel = (val?: string) => {
    if (!val) return "—";
    return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const statusColors: Record<string, string> = {
    Not_started: "bg-red-100 text-red-700",
    In_progress: "bg-blue-100 text-blue-700",
    Ready_To_Test: "bg-yellow-100 text-yellow-700",
    Testing_In_Progress: "bg-purple-100 text-purple-700",
    Passed_Test: "bg-green-100 text-green-700",
    Completed: "bg-green-100 text-green-700",
  };

  const priorityColors: Record<string, string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-orange-100 text-orange-700",
    Low: "bg-green-100 text-green-700",
  };

  const urgencyColors: Record<string, string> = {
    Immediately: "bg-red-100 text-red-700",
    Short_Term: "bg-orange-100 text-orange-700",
    Med_Term: "bg-yellow-100 text-yellow-700",
    High_Term: "bg-blue-100 text-blue-700",
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Title
              </th>
              {projectId && (
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Sprint
                </th>
              )}
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Priority
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Urgency
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Start Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Due Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Timeline
              </th>
              {!projectId && (
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Project
                </th>
              )}
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Team
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Created By
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer bg-white dark:bg-[#0a0a0a]"
                onClick={() => onTaskSelect(task)}
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                  {task.title}
                </td>
                {projectId && (
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {task.sprint || "—"}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status || ""] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                  >
                    {formatLabel(task.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority || ""] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                  >
                    {formatLabel(task.priority)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${urgencyColors[task.urgency || ""] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
                  >
                    {formatLabel(task.urgency)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {task.startDate
                    ? new Date(task.startDate).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {task.timeline || "—"}
                </td>
                {!projectId && (
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                    {task.project?.projectName || "—"}
                  </td>
                )}
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                  {task.department?.name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                  {task.createdBy
                    ? `${task.createdBy.firstName} ${task.createdBy.lastName}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                  {task.assignedTo
                    ?.filter((a) => a?.staff)
                    .map((a) => `${a.staff.firstName} ${a.staff.lastName}`)
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {new Date(task.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={onTaskClose}
          onTasksUpdate={onTasksUpdate}
        />
      )}
    </>
  );
};

export default TableView;
