"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Edit, Trash, X } from "lucide-react";
import Api from "@/utils/api";
import CustomModal from "../Message/Message";
import EditCommentModal from "@/pages/Task/EditTaskComment/EditTaskcomment";
import DeleteCommentModal from "@/pages/Task/DeleteTaskComment/DeleteTaskComment";
import { TaskDTO } from "@/dataTypes/Data-Types";
import TaskUpdateModal from "@/pages/Task/UpdateTask/UpdateTaskModel";
import imgIcon from "../../assests/images/Icon.png";
import editIcon from "../../assests/images/Button.png";
import { AxiosError } from "axios";

interface TaskModalProps {
  task: TaskDTO;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
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

  // 🧠 Load token and user info
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
    const fetchProjectStaff = async () => {
      if (!task?.project?.id) return; // make sure projectId exists

      try {
        const res = await Api.get(`/projects/${task.project?.id}/staffs`);
        // Assuming your backend returns [{ staff: { id, firstName, lastName, ... }, role }]
        const projectStaff = res.data.map((item: any) => item.staff);
        setStaffList(projectStaff);
      } catch (err) {
        console.error("Error fetching project staff:", err);
      }
    };

    fetchProjectStaff();
  }, [task?.project?.id]);
  // 🔁 Fetch Task Details
  useEffect(() => {
    if (!task?.id || !token) return;
    const fetchTask = async () => {
      try {
        const res = await Api.get(`/task/${task.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTaskData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTask();
  }, [task?.id, token]);

  // Handle typing for mentions
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentText(value);

    // Detect @ typing
    const match = value.match(/@(\w*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const filtered = staffList.filter((s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Insert selected staff
  const handleSelectStaff = (staff: any) => {
    setCommentText((prev) =>
      prev.replace(/@\w*$/, `@${staff.firstName} ${staff.lastName} `)
    );
    setMentionedStaff(staff);
    setSuggestions([]);
  };

  // 📎 Attach file to comment
  const handleAttachFile = async (commentId: number) => {
    const dto = {
      text: commentText,
    };
    if (!file) return;
    const formData = new FormData();
    formData.append("dto", JSON.stringify(dto));
    formData.append("file", file);

    await Api.patch(`/task/${commentId}/comments/attach-file`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  };
  // 💬 Add new comment
  const handleAddComments = async () => {
    if (!commentText.trim() || !taskData) return;
    setLoading(true);
    try {
      const res = await Api.patch(
        `/task/${task.id}/comments`,
        { text: commentText, mentionedStaffId: mentionedStaff?.id ?? null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // If file attached, upload it
      if (file) {
        await handleAttachFile(res.data.id);
        setFile(null);
      }

      setCommentText("");
      setMentionedStaff(null);

      setModal({ type: "success", message: "Comment added successfully!" });
      await refreshTask();
      //       window.location.reload(); // or update state with new comment
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to add comment.",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAddComment = async () => {
    if ((!commentText.trim() && !file) || !taskData) return; // ⬅️ Allow either text or file

    setLoading(true);
    try {
      // First, create a comment (even if it's empty text)
      const res = await Api.patch(
        `/task/${task.id}/comments`,
        {
          text: commentText || "",
          mentionedStaffId: mentionedStaff?.id ?? null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const commentId = res.data?.id;

      // If a file is attached, upload it
      if (file && commentId) {
        await handleAttachFile(commentId);
        setFile(null);
      }

      // Reset fields
      setCommentText("");
      setMentionedStaff(null);

      setModal({ type: "success", message: "Comment added successfully!" });
      await refreshTask();
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to add comment.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Refresh task data
  const refreshTask = async () => {
    try {
      const res = await Api.get(`/task/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaskData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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
      '<span class="text-[#95D700] font-medium">@$1</span>'
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

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>

          {/* Status + Priority */}
          <div className="flex items-center justify-between mb-4">
            <span className=" text-green-700 px-3 py-1 rounded-full text-xs font-medium">
              {task.status ? (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[task.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {task.status?.replace("_", " ")}
                </span>
              ) : (
                "—"
              )}
            </span>
            <span className="text-red-700 px-3 py-1 rounded-full text-xs font-medium mr-12">
              {task.priority ? (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    priorityColors[task.priority] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {task.priority}
                </span>
              ) : (
                "—"
              )}
            </span>
          </div>
          {/* Title */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">{displayTask.title}</h2>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => setShowEditModal(true)}
            >
              <Image src={editIcon} alt="edit icon" />
            </span>
          </div>

          {/* Assigned Staff */}
          <div className="flex items-center gap-2 mb-4">
            {displayTask.assignedTo?.map((assign) => (
              <div
                key={assign.id}
                className="w-10 h-10 rounded-full overflow-hidden border"
              >
                {assign.staff.photoUrl ? (
                  <Image
                    src={assign.staff.photoUrl}
                    alt={assign.staff.firstName}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="bg-gray-400 w-full h-full flex items-center justify-center text-white font-bold">
                    {assign.staff.firstName[0]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Task Info */}
          <div className="text-sm text-gray-600 mb-2">
            <p className="mb-2">Sprint: {displayTask.sprint || "—"}</p>
            <p>Timeline: {displayTask.timeline || "—"}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Image src={imgIcon} alt="date icon" />
            <p>
              Due Date:{" "}
              {displayTask.dueDate
                ? new Date(displayTask.dueDate).toLocaleString()
                : "No due date"}
            </p>
          </div>

          {/* Description */}
          <h3 className="font-semibold mb-1">Description</h3>
          <p className="text-sm text-gray-700 mb-4">
            {displayTask.description || "No description provided."}
          </p>

          {/* Module */}
          <h3 className="font-semibold mb-1">Task Feature/Module</h3>
          <p className="text-sm text-gray-700 mb-4">
            {displayTask.taskModule || "No Module/Feature provided."}
          </p>

          {/* Comments */}
          <h3 className="font-semibold mb-2">Comments</h3>
          <div className="bg-gray-100 rounded-lg p-3 mb-3">
            {displayTask.comments?.length ? (
              displayTask.comments.map((c) => (
                <div key={c.id} className="relative text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-semibold">{c.staff.firstName}</span>
                    {c.mentionedStaff && (
                      <span className="text-blue-500">
                        → @{c.mentionedStaff.firstName}
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
                  {c.fileUrl && (
                    <a
                      href={c.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 text-xs mt-1 inline-block hover:underline"
                    >
                      📎 View Attached File
                    </a>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>

                  {c.staff?.id === currentUserId && (
                    <div className="absolute top-2 right-2 flex gap-3 text-xs text-gray-500 z-20 ">
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
              <p className="text-sm text-gray-600">No Comment</p>
            )}
          </div>

          {/* Add Comment */}
          <div className="mt-5">
            <div className="relative">
              <textarea
                value={commentText}
                onChange={handleChange}
                placeholder="Add a Comment (use @ to mention)"
                className="w-full border rounded-lg p-2 pr-12 text-sm focus:outline-none focus:ring focus:ring-green-200"
              />

              <label className="absolute right-3 top-2 cursor-pointer">
                📎
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-gray-700 truncate">{file.name}</p>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 text-xs hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <ul className="border rounded-lg bg-white shadow-md mt-1 max-h-40 overflow-y-auto">
                {suggestions.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => handleSelectStaff(s)}
                    className="p-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    {s.firstName} {s.lastName}
                  </li>
                ))}
              </ul>
            )}
            {/* ////sugesstions dropdown ends */}
            <div className="mt-3 text-right">
              <button
                style={{ cursor: "pointer" }}
                onClick={handleAddComment}
                disabled={loading || (!commentText.trim() && !file)}
                // disabled={loading}
                className="bg-[#95D700] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {editingComment && (
          <EditCommentModal
            commentId={editingComment.id}
            currentText={editingComment.text}
            onClose={() => setEditingComment(null)}
            onUpdated={refreshTask}
          />
        )}
        {deletingComment && (
          <DeleteCommentModal
            commentId={deletingComment.id}
            name="Comment"
            onClose={() => setDeletingComment(null)}
            onDeleted={refreshTask}
          />
        )}
        {modal && <CustomModal {...modal} onClose={() => setModal(null)} />}
      </div>

      {/* Edit Task Modal */}
      <TaskUpdateModal
        taskId={task.id}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdated={refreshTask}
      />
    </>
  );
}
