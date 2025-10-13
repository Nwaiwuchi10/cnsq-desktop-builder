// components/TaskModal.tsx
import React, { useEffect, useState } from "react";
import Image from "next/image";
import imgIcon from "../../assests/images/Icon.png"; // adjust path
import { TaskDTO } from "@/dataTypes/Data-Types";
import editIcon from "../../assests/images/Button.png";
import TaskUpdateModal from "@/pages/Task/UpdateTask/UpdateTaskModel";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import CustomModal from "../Message/Message";
interface TaskModalProps {
  task: TaskDTO | null;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  // const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mentionedStaff, setMentionedStaff] = useState<any | null>(null);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  useEffect(() => {
    const t = localStorage.getItem("user-token");
    setToken(t);
  }, []);
  if (!task) return null;

  // Fetch staff for mentions
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

  // Submit comment
  const handlePostComment = async () => {
    try {
      await Api.patch(
        `/task/${task.id}/comments`,
        {
          text: commentText,
          mentionedStaffId: mentionedStaff?.id ?? null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCommentText("");
      setMentionedStaff(null);
      setModal({ type: "success", message: "Comment added successfully!" });
      window.location.reload(); // or update state with new comment
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Failed to create project.",
      });
    }
  };

  const statusColors: Record<string, string> = {
    Not_started: "bg-red-100 text-red-600",
    Failed_Test: "bg-red-100 text-red-700", // Not Started → Red
    In_progress: "bg-yellow-100 text-yellow-600",
    Ready_To_Test: "bg-blue-100 text-blue-600",
    Testing_In_Progress: "bg-purple-100 text-purple-600",
    Passed_Test: "bg-green-100 text-green-500",
    Completed: "bg-green-200 text-green-600",
  };

  const priorityColors: Record<string, string> = {
    Low: "bg-green-100 text-green-600",
    Medium: "bg-yellow-100 text-yellow-600",
    High: "bg-red-100 text-red-600",
  };
  // Insert selected staff
  // Helper to detect links and make them clickable
  const renderCommentText = (text: string) => {
    if (!text) return "";

    // Regex to match URLs (http, https, www)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    // Replace URLs with anchor tags
    const linkedText = text.replace(urlRegex, (url) => {
      const validUrl = url.startsWith("http") ? url : `https://${url}`;
      return `<a href="${validUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${url}</a>`;
    });

    return linkedText;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
          {/* Close button */}
          <button
            style={{ cursor: "pointer" }}
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
          <div className="flex justify-between items-center">
            {" "}
            <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => setShowEditModal(true)}
            >
              <Image src={editIcon} alt="edit icon" />
            </span>
          </div>

          {/* Staff Assigned */}
          <div className="flex items-center gap-2 mb-4">
            {task.assignedTo.map((assign) => (
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
            <button
              onClick={() => setShowEditModal(true)}
              className="w-10 h-10 rounded-full border flex items-center justify-center text-lg text-gray-500"
            >
              +
            </button>
          </div>

          {/* Due Date */}
          <div className="text-sm text-gray-600 mb-4">
            {" "}
            <p>Sprint: {task?.sprint} </p>
          </div>
          <div className="text-sm text-gray-600 mb-4">
            {" "}
            <p>Timeline: {task?.timeline} </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Image src={imgIcon} alt="date icon" />

            <p>
              Due Date:
              {task.dueDate
                ? new Date(task.dueDate).toLocaleString()
                : "No due date"}
            </p>
          </div>

          {/* Description */}
          <h3 className="font-semibold mb-1">Description</h3>
          <p className="text-sm text-gray-700 mb-4">
            {task.description || "No description provided."}
          </p>

          <h3 className="font-semibold mb-1">Task Feature/Module</h3>
          <p className="text-sm text-gray-700 mb-4">
            {task.taskModule || "No Module/Feature provided."}
          </p>
          {/* Comments section */}
          {/* Comments section */}
          <h3 className="font-semibold mb-2">Comments</h3>
          <div className="bg-gray-100 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700">Most Recent Comment:</p>
            {task.comments?.length ? (
              <div className="mt-2">
                {task?.comments.map((c) => (
                  <div key={c.id} className="text-sm text-gray-600 mb-4">
                    <p>
                      <span className="font-semibold">{c.staff.firstName}</span>{" "}
                      {c.mentionedStaff && (
                        <span className="text-blue-500">
                          → @{c.mentionedStaff.firstName}
                        </span>
                      )}
                      :
                    </p>

                    {/* Render text with clickable links */}
                    <p
                      className="mt-1"
                      dangerouslySetInnerHTML={{
                        __html: renderCommentText(c.text),
                      }}
                    />

                    <p className="text-xs text-gray-500 mt-1">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleString()
                        : "No due date"}
                    </p>
                  </div>

                  // <p key={c.id} className="text-sm text-gray-600">
                  //   <span className="font-semibold">{c.staff.firstName}</span>{" "}
                  //   {c.mentionedStaff && (
                  //     <span className="text-blue-500">
                  //       → @{c.mentionedStaff.firstName}
                  //     </span>
                  //   )}
                  //   : {c.text}
                  //   <p className="mb-4">
                  //     {c.createdAt
                  //       ? new Date(c.createdAt).toLocaleString()
                  //       : "No due date"}{" "}
                  //   </p>
                  // </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No Comment</p>
            )}
          </div>

          {/* Comment Input */}

          <textarea
            value={commentText}
            onChange={handleChange}
            placeholder="Add a Comment (use @ to mention)"
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring focus:ring-green-200"
          />

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

          <button
            onClick={handlePostComment}
            className="mt-3 px-4 py-2 bg-[#95D700] text-white text-sm rounded-lg"
          >
            Post Comment
          </button>
        </div>
        {modal && (
          <CustomModal
            type={modal.type}
            message={modal.message}
            onClose={() => setModal(null)}
          />
        )}
      </div>
      <div>
        <TaskUpdateModal
          taskId={task.id}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => window.location.reload()}
        />
      </div>
    </>
  );
}
