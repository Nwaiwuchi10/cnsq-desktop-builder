// components/TaskModal.tsx
import React, { useState } from "react";
import Image from "next/image";
import imgIcon from "../../assests/images/Icon.png"; // adjust path
import { TaskDTO } from "@/dataTypes/Data-Types";
import editIcon from "../../assests/images/Button.png";
import TaskUpdateModal from "@/pages/Task/UpdateTask/UpdateTaskModel";
interface TaskModalProps {
  task: TaskDTO | null;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  if (!task) return null;

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
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
              {task.status?.replace("_", " ")}
            </span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium mr-12">
              {task.priority}
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
            <button className="w-10 h-10 rounded-full border flex items-center justify-center text-lg text-gray-500">
              +
            </button>
          </div>

          {/* Due Date */}
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

          {/* Comments section */}
          <h3 className="font-semibold mb-2">Comments</h3>
          <div className="bg-gray-100 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700">Most Recent Comment:</p>
            {/* Example placeholder, you can map actual comments from backend */}
            <div className="mt-2">
              {/* <p className="text-sm">
              <span className="font-semibold">Darlington Quin</span> · 21 Aug
              2025, 14:33
            </p> */}
              <p className="text-sm text-gray-600">No Comment</p>
            </div>
          </div>

          {/* Comment Input */}
          <textarea
            placeholder="Add a Comment"
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring focus:ring-green-200"
          />
          <button className="mt-3 px-4 py-2 bg-[#95D700] text-white text-sm rounded-lg">
            Post Comment
          </button>
        </div>
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
