"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { TaskDTO } from "@/dataTypes/Data-Types";
import TaskModal from "./TaskDetailsModal";
import Api from "@/utils/api";
import TaskUpdateModal from "@/pages/Task/UpdateTask/UpdateTaskModel";

interface BoardViewProps {
  tasks: TaskDTO[];
  projectId?: number;
  loading?: boolean;
  onTasksUpdate?: () => void;
  allProjects?: any[];
}

interface StatusColumn {
  key: string;
  label: string;
  dotColor: string;
}

const statusColumns: StatusColumn[] = [
  { key: "Not_started", label: "Not Started", dotColor: "bg-red-500" },
  { key: "In_progress", label: "In Progress", dotColor: "bg-orange-500" },
  { key: "Ready_To_Test", label: "Ready to Test", dotColor: "bg-yellow-500" },
  { key: "Testing_In_Progress", label: "Testing", dotColor: "bg-purple-500" },
  { key: "Failed_Test", label: "Failed Test", dotColor: "bg-rose-500" },
  { key: "Passed_Test", label: "Passed Test", dotColor: "bg-teal-500" },
  { key: "Dev_Completed", label: "Dev Completed", dotColor: "bg-blue-500" },
  { key: "Completed", label: "Completed", dotColor: "bg-emerald-500" },
  { key: "On_Hold", label: "On Hold", dotColor: "bg-gray-500" },
];

const BoardView: React.FC<BoardViewProps> = ({
  tasks: initialTasks,
  projectId,
  loading = false,
  onTasksUpdate,
  allProjects = [],
}) => {
  const [tasks, setTasks] = useState<TaskDTO[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);
  const [draggedTask, setDraggedTask] = useState<TaskDTO | null>(null);
  const [draggedFromStatus, setDraggedFromStatus] = useState<string | null>(
    null,
  );
  const [editTaskId, setEditTaskId] = useState<number | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const updateTaskStatus = useCallback(
    (taskId: number, newStatus: string) => {
      // Optimistically update local state immediately
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );

      // Detach the API call so React can complete painting the optimistic update
      setTimeout(async () => {
        try {
          const token = localStorage.getItem("user-token");

          await Api.patch(
            `/task/${taskId}`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (onTasksUpdate) {
            onTasksUpdate();
          }
        } catch (error) {
          console.error("Error updating task status:", error);
          // If the request fails, move it back to its initial status position
          setTasks(initialTasks);
        }
      }, 0);
    },
    [onTasksUpdate, initialTasks],
  );

  const handleDragStart = (
    e: React.DragEvent,
    task: TaskDTO,
    status: string,
  ) => {
    setDraggedTask(task);
    setDraggedFromStatus(status);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropColumn = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();

    if (!draggedTask || draggedFromStatus === newStatus) {
      setDraggedTask(null);
      setDraggedFromStatus(null);
      return;
    }

    const taskId = draggedTask.id;

    // Reset drag state immediately for a smooth UI transition
    setDraggedTask(null);
    setDraggedFromStatus(null);

    // Call synchronously to execute optimistic update without awaiting API latency
    updateTaskStatus(taskId, newStatus);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedFromStatus(null);
  };

  if (loading && initialTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto pb-8">
        <div className="flex gap-6 min-w-full">
          {statusColumns.map((col) => {
            const columnTasks = tasks.filter((t) => (t.status || "Not_started") === col.key);
            const isDragOver = draggedTask && draggedFromStatus !== col.key;

            return (
              <div
                key={col.key}
                className="w-full md:w-96 flex-shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropColumn(e, col.key)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${col.dotColor}`}
                    ></span>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {col.label}
                    </h3>
                  </div>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 dark:bg-gray-700 text-white text-xs font-bold">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Tasks Container */}
                <div
                  className={`space-y-3 min-h-96 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 transition-colors rounded-lg p-1 ${isDragOver ? "bg-green-50 dark:bg-green-900/20" : ""}`}
                >
                  {columnTasks.length === 0 ? (
                    <div className="flex items-start justify-start h-32 text-gray-400 text-sm">
                      No tasks
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task, col.key)}
                        onDragEnd={handleDragEnd}
                        className="bg-white dark:bg-[#1a1a1a] rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-move hover:scale-[1.01] border border-gray-100 dark:border-gray-700"
                        onClick={() => setSelectedTask(task)}
                      >
                        {/* Task Title */}
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {task.title}
                        </h4>

                        {!projectId && (task.project?.projectName || (task as any).linkedProjectId) && (
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 truncate">
                            {task.project?.projectName || 
                             (allProjects.find(p => p.id === (task as any).linkedProjectId)?.projectName) || 
                             `Project #${(task as any).linkedProjectId}`}
                          </p>
                        )}

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Priority Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {task.priority && (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white ${task.priority === "High"
                                  ? "bg-red-500"
                                  : task.priority === "Medium"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                                }`}
                            >
                              {task.priority === "High"
                                ? "HIGH"
                                : task.priority === "Medium"
                                  ? "MED"
                                  : "LOW"}
                            </span>
                          )}
                        </div>

                        {/* Date and Progress */}
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <div className="flex flex-col gap-1">
                            {task.startDate && (
                              <span>
                                Start: {new Date(task.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                            {task.dueDate && (
                              <span>
                                Due: {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            )}
                            {!task.startDate && !task.dueDate && <span>No dates set</span>}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTaskId(task.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ⋮
                          </button>
                        </div>

                        {/* Assignees */}
                        <div className="flex items-center gap-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                          {task.assignedTo && task.assignedTo.length > 0 ? (
                            <div className="flex -space-x-2">
                              {task.assignedTo
                                .slice(0, 3)
                                .map((assign, idx) => {
                                  const colors = [
                                    "bg-blue-500",
                                    "bg-green-500",
                                    "bg-purple-500",
                                    "bg-pink-500",
                                    "bg-yellow-500",
                                  ];
                                  const bgColor = colors[idx % colors.length];
                                  const initials = (
                                    assign?.staff?.firstName?.[0] +
                                    (assign?.staff?.lastName?.[0] || "")
                                  ).toUpperCase();

                                  return (
                                    <div
                                      key={idx}
                                      className={`w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 ${bgColor} flex-shrink-0 overflow-hidden flex items-center justify-center`}
                                      title={`${assign?.staff?.firstName} ${assign?.staff?.lastName}`}
                                    >
                                      {assign?.staff?.photoUrl ? (
                                        <Image
                                          src={assign.staff.photoUrl}
                                          alt={assign.staff.firstName}
                                          width={24}
                                          height={24}
                                          className="object-cover w-full h-full"
                                          unoptimized
                                        />
                                      ) : (
                                        <span className="text-xs text-white font-bold">
                                          {initials}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              {task.assignedTo.length > 3 && (
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
                                  <span className="text-xs text-gray-700 dark:text-white font-bold">
                                    +{task.assignedTo.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No assignee
                            </span>
                          )}
                        </div>

                        {editTaskId === task.id && (
                          <TaskUpdateModal
                            taskId={task.id}
                            isOpen={true}
                            onClose={() => setEditTaskId(null)}
                            onUpdated={() => {
                              setEditTaskId(null);
                              onTasksUpdate?.();
                            }}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTasksUpdate={onTasksUpdate}
        />
      )}
    </>
  );
};

export default BoardView;
