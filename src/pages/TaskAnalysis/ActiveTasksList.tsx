"use client";

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  urgency: string;
  progress: number;
  project: string;
  projectId: number | null;
  dueDate: string | null;
  startDate: string | null;
  sprint: number;
  createdBy: string | null;
  description?: string;
}

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface ActiveTasksListProps {
  tasks?: Task[];
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  onTaskClick?: (task: { id: number; projectId: number | null }) => void;
}

const ActiveTasksList = ({
  tasks = [],
  pagination = { currentPage: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
  onPageChange = () => {},
  loading = false,
  onTaskClick,
}: ActiveTasksListProps) => {
  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-[#95D700] text-xs font-bold uppercase tracking-wider mb-4">
          ACTIVE TASKS (Loading...)
        </h3>
        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          Loading tasks...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-[#95D700] text-xs font-bold uppercase tracking-wider mb-4">
        ACTIVE TASKS ({pagination.totalCount})
      </h3>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          No active tasks found
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-[#1a1a1a] hover:shadow-md transition-colors cursor-pointer"
              onClick={() =>
                onTaskClick &&
                onTaskClick({ id: task.id, projectId: task.projectId })
              }
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 block">
                    {task.title}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    {task.project} • Sprint {task.sprint}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#95D700] whitespace-nowrap ml-2">
                  {task.progress}%
                </span>
              </div>
              <div className="w-full bg-[#E5E7EB] dark:bg-gray-800 transition-colors rounded-full h-1.5 overflow-hidden mb-3">
                <div
                  className="bg-[#95D700] h-1.5 rounded-full"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
              {/* <div className="flex gap-2 flex-wrap text-xs">
                <span
                  className={`px-2 py-1 rounded ${
                    task.priority === "High"
                      ? "bg-red-100 text-red-700"
                      : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {task.priority}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {task.urgency}
                </span>
                {task.dueDate && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div> */}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          {/* Previous */}
          <button
            onClick={() =>
              onPageChange(Math.max(pagination.currentPage - 1, 1))
            }
            disabled={pagination.currentPage === 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm ${
              pagination.currentPage === 1
                ? "bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                : "bg-[#95D700] text-white hover:bg-green-600"
            }`}
          >
            <ArrowLeft size={16} /> Prev
          </button>

          {/* Mobile: simplified */}
          <span className="block sm:hidden px-3 py-2 text-gray-700 dark:text-gray-300 font-medium text-sm">
            {pagination.currentPage} / {pagination.totalPages}
          </span>

          {/* Desktop: detailed pagination */}
          <div className="hidden sm:flex gap-2">
            {(() => {
              const pages: (number | string)[] = [];
              if (pagination.totalPages <= 5) {
                for (let i = 1; i <= pagination.totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (pagination.currentPage > 3) pages.push("...");
                const start = Math.max(2, pagination.currentPage - 1);
                const end = Math.min(
                  pagination.totalPages - 1,
                  pagination.currentPage + 1,
                );
                for (let i = start; i <= end; i++) pages.push(i);
                if (pagination.currentPage < pagination.totalPages - 2)
                  pages.push("...");
                pages.push(pagination.totalPages);
              }

              return pages.map((p, i) =>
                typeof p === "string" ? (
                  <span key={i} className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                    {p}
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      pagination.currentPage === p
                        ? "bg-[#95D700] text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                ),
              );
            })()}
          </div>

          {/* Next */}
          <button
            onClick={() =>
              onPageChange(
                Math.min(pagination.currentPage + 1, pagination.totalPages),
              )
            }
            disabled={pagination.currentPage === pagination.totalPages}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm ${
              pagination.currentPage === pagination.totalPages
                ? "bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                : "bg-[#95D700] text-white hover:bg-green-600"
            }`}
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveTasksList;
