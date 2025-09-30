import React, { useEffect, useState } from "react";
import Api from "@/utils/api";
import Image, { StaticImageData } from "next/image";
import imgIcon from "../../assests/images/Icon.png";
import { useParams } from "next/navigation";
import TaskModal from "./TaskDetailsModal";
import { TaskDTO } from "@/dataTypes/Data-Types";
import TaskUpdateModal from "@/pages/Task/UpdateTask/UpdateTaskModel";
import Link from "next/link";

const statusColumns = [
  { key: "Not_started", label: "Not Started", color: "bg-gray-400" },
  { key: "In_progress", label: "In Progress", color: "bg-[#95D700]" },
  { key: "Testing_In_Progress", label: "Testing", color: "bg-orange-500" },
  { key: "Completed", label: "Completed", color: "bg-emerald-500" },
  // { key: "ALL", label: "All Tasks", color: "bg-blue-500" },
];

export default function TaskBoard() {
  const params = useParams();

  const projectId = Number(params?.id);

  console.log("projectId", projectId);
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);

  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await Api.get(`/task/project/${projectId}`);
        setTasks(res.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  if (!tasks.length)
    return <p className="p-6">No Task Found for this project.</p>;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-x-auto">
        {statusColumns.map((col) => (
          <div
            key={col.key}
            className="w-full md:w-72 bg-white p-4 rounded-xl shadow flex-shrink-0"
          >
            {/* Column header */}
            <h2 className="font-bold mb-4 flex items-center justify-between">
              {col.label}
              <span
                className={`text-xs px-2 py-1 rounded ${col.color} text-white`}
              >
                {tasks.filter((t) => t.status === col.key).length}
              </span>
            </h2>

            {/* Tasks in column */}
            <div className="flex flex-col gap-3">
              {tasks
                .filter((t) => t.status === col.key)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-[#FAFAFA] rounded-xl p-3 shadow border border-[#FAFAFA] flex flex-col gap-2"
                  >
                    {/* Title + 3 dots */}
                    <div className="flex items-start justify-between">
                      <h3
                        style={{ cursor: "pointer" }}
                        className="font-semibold text-base"
                        onClick={() => setSelectedTask(task)}
                      >
                        {task.title}
                      </h3>{" "}
                      {/* ⬆️ Increased font */}
                      <span
                        className="text-[#717680] text-2xl cursor-pointer"
                        style={{ cursor: "pointer" }}
                        onClick={() => setEditTaskId(task.id)}
                      >
                        ...
                      </span>{" "}
                      {/* 3 dots */}
                    </div>
                    {editTaskId === task.id && (
                      <TaskUpdateModal
                        taskId={task.id}
                        isOpen={true}
                        onClose={() => setEditTaskId(null)}
                        onUpdated={() => window.location.reload()}
                      />
                    )}

                    <p className="text-xs font-medium text-gray-600 -mt-2 mb-2">
                      Sprint: {task?.sprint}{" "}
                    </p>
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium border rounded-full w-fit
    ${
      col.key === "Not_started"
        ? "text-gray-600 bg-gray-100 border-gray-400"
        : col.key === "In_progress"
        ? "text-green-700 bg-green-100 border-green-500"
        : col.key === "Testing_In_Progress"
        ? "text-orange-700 bg-orange-100 border-orange-500"
        : "text-emerald-700 bg-emerald-100 border-emerald-500"
    }
//   `}
                      //                     className={`text-xs px-2 py-1 rounded-lg ${col.color} text-white w-fit`}
                      // ⬆️ rounded → rounded-lg for smoother curve
                    >
                      {col.label}
                    </span>
                    <hr className="border-t border-[#D5D7DA] mt-2" />
                    {/* Avatars + Created Date */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        {task.assignedTo
                          ?.slice(0, 4)
                          .map((assign, idx: number) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full overflow-hidden border-2 border-white -ml-2 first:ml-0"
                            >
                              {assign.staff?.photoUrl ? (
                                <Image
                                  src={assign?.staff?.photoUrl}
                                  alt={`${assign?.staff?.firstName}`}
                                  width={32}
                                  height={32}
                                  className="object-cover w-full h-full"
                                  unoptimized
                                />
                              ) : (
                                <div className="bg-gray-300 w-full h-full flex items-center justify-center text-xs text-white">
                                  {assign?.staff?.firstName?.[0]}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>

                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Image src={imgIcon} alt="date icon" />
                        {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Horizontal line below avatars */}
                  </div>
                ))}
            </div>

            {/* Add task button */}
            <Link href="/project/create">
              {" "}
              <button className="mt-4 text-green-600 text-sm">
                + New Task
              </button>
            </Link>
          </div>
        ))}

        {/* ////card to display all task */}

        {/* ////end of card to display all task */}
      </div>

      {/* /// */}
      <div className="w-full md:w-96 bg-white p-4 rounded-xl shadow">
        {/* Header */}
        <h2 className="font-bold mb-4 flex items-center justify-between text-gray-600">
          All Tasks
          <span className="text-xs px-2 py-1 rounded bg-blue-500 text-white">
            {tasks.length}
          </span>
        </h2>

        {/* Tasks List */}
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-[#FAFAFA] rounded-xl p-3 shadow border border-[#FAFAFA] flex flex-col gap-2"
            >
              {/* Title + 3 dots */}
              <div className="flex items-start justify-between">
                <h3
                  style={{ cursor: "pointer" }}
                  className="font-semibold text-base text-gray-600"
                  onClick={() => setSelectedTask(task)}
                >
                  {task.title}
                </h3>
                <span
                  className="text-[#717680] text-2xl cursor-pointer"
                  onClick={() => setEditTaskId(task.id)}
                >
                  ...
                </span>
              </div>

              {editTaskId === task.id && (
                <TaskUpdateModal
                  taskId={task.id}
                  isOpen={true}
                  onClose={() => setEditTaskId(null)}
                  onUpdated={() => window.location.reload()}
                />
              )}
              <p className="text-xs font-medium text-gray-600 -mt-2 mb-2">
                Sprint: {task?.sprint}{" "}
              </p>
              {/* Status Badge */}
              <span
                className={`inline-flex items-center text-gray-600 px-3 py-1 text-xs font-medium border rounded-full w-fit
            ${
              task.status === "Not_started"
                ? "text-gray-600 bg-gray-100 border-gray-400"
                : task.status === "In_progress"
                ? "text-green-700 bg-green-100 border-green-500"
                : task.status === "Testing_In_Progress"
                ? "text-orange-700 bg-orange-100 border-orange-500"
                : "text-emerald-700 bg-emerald-100 border-emerald-500"
            }`}
              >
                {task?.status?.replace("_", " ")}
              </span>

              <hr className="border-t border-[#D5D7DA] mt-2" />

              {/* Avatars + Created Date */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  {task.assignedTo?.slice(0, 4).map((assign, idx: number) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full overflow-hidden border-2 border-white -ml-2 first:ml-0"
                    >
                      {assign.staff?.photoUrl ? (
                        <Image
                          src={assign?.staff?.photoUrl}
                          alt={assign?.staff?.firstName}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <div className="bg-gray-300 w-full h-full flex items-center justify-center text-xs text-white">
                          {assign?.staff?.firstName?.[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Image src={imgIcon} alt="date icon" />
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add task button */}
        <Link href="/project/create">
          {" "}
          <button className="mt-4 text-green-600 text-sm">+ New Task</button>
        </Link>
      </div>
      {/* /// */}
      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </>
  );
}
