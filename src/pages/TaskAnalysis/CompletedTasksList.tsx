"use client";

import React from "react";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

interface CompletedTask {
  id: number;
  title: string;
  status: string;
  startDate: string | null;
  dueDate: string;
  project: string;
  projectId: number | null;
}

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface CompletedTasksListProps {
  tasks?: CompletedTask[];
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  onTaskClick?: (task: { id: number; projectId: number | null }) => void;
}

const CompletedTasksList = ({
  tasks = [],
  pagination = { currentPage: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
  onPageChange = () => {},
  loading = false,
  onTaskClick,
}: CompletedTasksListProps) => {
  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-[#95D700] text-xs font-bold uppercase tracking-wider mb-4">
          COMPLETED TASKS (Loading...)
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
        COMPLETED TASKS ({pagination.totalCount})
      </h3>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          No completed tasks found
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-[#1a1a1a] flex justify-between items-center hover:shadow-md transition-colors cursor-pointer"
              onClick={() =>
                onTaskClick &&
                onTaskClick({ id: task.id, projectId: task.projectId })
              }
            >
              <div className="flex items-center gap-3 flex-1">
                <CheckCircle2
                  className="text-[#95D700] flex-shrink-0"
                  size={18}
                  strokeWidth={2}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 block">
                    {task.title}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                    {task.project}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 ml-2 whitespace-nowrap">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  Start: {task.startDate ? new Date(task.startDate).toLocaleDateString() : "—"}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                </span>
              </div>
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

export default CompletedTasksList;
