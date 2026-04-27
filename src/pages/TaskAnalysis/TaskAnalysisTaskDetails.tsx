"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Edit, Trash, X } from "lucide-react";
import Api from "@/utils/api";

import { TaskDTO } from "@/dataTypes/Data-Types";

import imgIcon from "../../assests/images/Icon.png";
import editIcon from "../../assests/images/Button.png";

interface TaskModalProps {
  task: TaskDTO;
  onClose: () => void;
}

export default function TaskAnalysisTaskDetailsModal({
  task,
  onClose,
}: TaskModalProps) {
  const [taskData, setTaskData] = useState<TaskDTO | null>(null);
  const [commentText, setCommentText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<any | null>(null);
  const [deletingComment, setDeletingComment] = useState<any | null>(null);
  const [mentionedStaff, setMentionedStaff] = useState<any | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);

  //  Load token and user info
  useEffect(() => {
    const t = localStorage.getItem("user-token");
    const u = localStorage.getItem("userId");
    if (t) setToken(t);
    if (u) {
      // const parsed = JSON.parse(u);
      setCurrentUserId(parseInt(u));
    }
  }, []);
  //   // Fetch staff for mentions
  useEffect(() => {
    if (!task?.project?.id) return;
    const fetchProjectStaff = async () => {
      if (!task?.project?.id) return; // make sure projectId exists

      try {
        const res = await Api.get(`/projects/${task.project?.id}/staffs`);
        // Assuming your backend returns [{ staff: { id, firstName, lastName, ... }, role }]
        const projectStaff = res?.data?.map((item: any) => item?.staff);
        setStaffList(projectStaff);
      } catch (err) {
        console.error("Error fetching project staff:", err);
      }
    };

    fetchProjectStaff();
  }, [task?.project?.id]);
  // 🔁 Fetch Task Details
  useEffect(() => {
    if (!task?.project?.id) return;
    if (!task?.id || !token) return;
    const fetchTask = async () => {
      try {
        const res = await Api.get(`/task/${task.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTaskData(res?.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTask();
  }, [task?.id, token]);

  // ✨ Render comment text
  const renderCommentText = (text: string) => {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const linkedText = text.replace(urlRegex, (url) => {
      const validUrl = url.startsWith("http") ? url : `https://${url}`;
      return `<a href="${validUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${url}</a>`;
    });
    return linkedText.replace(
      /@(\w+)/g,
      '<span class="text-[#95D700] font-medium">@$1</span>',
    );
  };

  const statusColors: Record<string, string> = {
    Not_started: "bg-red-100 text-red-600",
    Failed_Test: "bg-red-100 text-red-700",
    In_progress: "bg-yellow-100 text-yellow-600",
    Ready_To_Test: "bg-blue-100 text-blue-600",
    Testing_In_Progress: "bg-purple-100 text-purple-600",
    On_Hold: "bg-orange-200 text-orange-600",
    Passed_Test: "bg-green-100 text-green-500",
    Dev_Completed: "bg-green-300 text-green-500",
    Completed: "bg-green-200 text-green-600",
  };

  const priorityColors: Record<string, string> = {
    Low: "bg-green-100 text-green-600",
    Medium: "bg-yellow-100 text-yellow-600",
    High: "bg-red-100 text-red-600",
  };

  if (!task) return null;

  const displayTask = taskData || task;

  // 🗑 Delete Task

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white dark:bg-[#141414] w-full max-w-2xl rounded-2xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh] transition-colors">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xl"
          >
            ✕
          </button>

          {/* Status + Priority */}

          {/* Title */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold dark:text-white">Task Title</h2>
          </div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold dark:text-white">{displayTask?.title}</h2>
          </div>
          {/* Assigned Staff */}
          <div className="flex items-center gap-2 mb-4">
            {displayTask?.assignedTo?.filter(Boolean).map((assign) => (
              <div
                key={assign?.id}
                className="w-10 h-10 rounded-full overflow-hidden border dark:border-gray-700"
              >
                {assign?.staff?.photoUrl ? (
                  <Image
                    src={assign?.staff?.photoUrl}
                    alt={assign?.staff?.firstName}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="bg-gray-400 dark:bg-gray-600 w-full h-full flex items-center justify-center text-white font-bold">
                    {assign?.staff?.firstName[0]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Task Info */}
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <p className="mb-2">Sprint: {displayTask?.sprint || "—"}</p>
            <p>Timeline: {displayTask?.timeline || "—"}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
            <Image src={imgIcon} alt="date icon" />
            <p>
              Due Date:{" "}
              {displayTask?.dueDate
                ? new Date(displayTask.dueDate).toLocaleString()
                : "No due date"}
            </p>
          </div>

          {/* Description */}
          <h3 className="font-semibold mb-1 dark:text-white">Description</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {displayTask?.description || "No description provided."}
          </p>

          {/* Module */}
          <h3 className="font-semibold mb-1 dark:text-white">Task Feature/Module</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {displayTask?.taskModule || "No Module/Feature provided."}
          </p>

          {/* Comments */}
          <h3 className="font-semibold mb-2 dark:text-white">Comments</h3>
          <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-3 mb-3 transition-colors">
            {displayTask?.comments?.length ? (
              displayTask?.comments?.filter(Boolean).map((c) => (
                <div key={c.id} className="relative text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <p>
                    <span className="font-semibold">{c?.staff?.firstName}</span>
                    {c?.mentionedStaff && (
                      <span className="text-blue-500">
                        → @{c?.mentionedStaff?.firstName}
                      </span>
                    )}
                    :
                  </p>
                  <p
                    className="mt-1"
                    dangerouslySetInnerHTML={{
                      __html: renderCommentText(c.text),
                    }}
                  />
                  {c?.fileUrl && (
                    <a
                      href={c.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-xs mt-1 inline-block hover:underline"
                    >
                      📎 View Attached File
                    </a>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>

                  {c?.staff?.id === currentUserId && (
                    <div className="absolute top-2 right-2 flex gap-3 text-xs text-gray-500 dark:text-gray-400 z-20 ">
                      <button
                        onClick={() => setEditingComment(c)}
                        className="text-[#95D700] hover:text-green-700"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => setDeletingComment(c)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No Comment</p>
            )}
          </div>

          {/* Add Comment */}

          {/* Suggestions dropdown */}

          {/* Modals */}

          {/* Delete Task Confirmation Modal */}
        </div>
      </div>

      {/* Edit Task Modal */}
    </>
  );
}
