"use client";

import { TaskDTO } from "@/dataTypes/Data-Types";
import Api from "@/utils/api";
import { X, Calendar } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";

interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | StaticImageData | null;
  email?: string;
}

interface TaskAssignment {
  id?: number;
  role?: string;
  staff: Staff;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: TaskAssignment[];
}

interface Project {
  id: number;
  projectName: string;
  desc?: string;
  status: string;
  startDate: string;
  endDate: string;
  priority: string;
  timeLine: string;
  prodUrl: string;
  stagingUrl: string;
  apk?: string;
  assignedTo: TaskAssignment[];
  comments: {
    id: number;
    text: string;
    staff: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }[];
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

interface NotificationModalProps {
  onClose: () => void;
  notification: any;
  icon?: JSX.Element;
}

export default function NotificationModal({
  onClose,
  notification,
}: NotificationModalProps) {
  const [open, setOpen] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [taskData, setTaskData] = useState<TaskDTO | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const router = useRouter();

  if (!open || !notification) return null;

  const relatedTask: Task | undefined = notification.relatedTask;
  const relatedProject: Project | undefined = notification.relatedProject;

  // 🔹 Get user token
  useEffect(() => {
    const t = localStorage.getItem("user-token");
    if (t) setToken(t);
  }, []);

  // 🔹 Fetch related project
  useEffect(() => {
    if (!notification.relatedProject?.id) return;
    const fetchProject = async () => {
      try {
        const res = await Api.get(
          `/projects/${notification.relatedProject.id}`
        );
        setProject(res.data);
      } catch (err) {
        console.error("Failed to fetch project", err);
      } finally {
        setLoadingProject(false);
      }
    };
    fetchProject();
  }, [notification.relatedProject?.id]);

  // 🔹 Fetch related task
  useEffect(() => {
    if (!notification.relatedTask?.id || !token) return;
    const fetchTask = async () => {
      try {
        const res = await Api.get(`/task/${notification.relatedTask.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTaskData(res.data);
      } catch (err) {
        console.error("Failed to fetch task", err);
      }
    };
    fetchTask();
  }, [notification.relatedTask?.id, token]);

  ////mark notification as read
  useEffect(() => {
    if (!notification?.id) return;

    const markAsRead = async () => {
      try {
        await Api.patch(`/notification/${notification.id}/read`, {
          isRead: true,
        });
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    };

    markAsRead();
  }, [notification?.id]);
  //   const handleOpen = () => {
  //     if (relatedTask) router.push(`/tasks/${relatedTask.id}`);
  //     else if (relatedProject) router.push(`/project/${relatedProject.id}`);
  //   };
  const handleOpen = () => {
    if (relatedProject) {
      router.push(`/project/${relatedProject.id}`);
    } else if (project) {
      router.push(`/project/${project.id}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayTask = taskData || relatedTask;

  // 🔹 Unified assigned list for mapping safely
  const assignedList: TaskAssignment[] =
    project?.assignedTo || displayTask?.assignedTo || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 h-full">
      <div className="mt-12 mb-8 relative w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="mb-4">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">
              {notification.triggeredByStaff
                ? `${notification.triggeredByStaff.firstName} ${notification.triggeredByStaff.lastName}`
                : notification.triggeredByAdmin
                ? "Admin"
                : project?.createdBy
                ? `${project.createdBy.firstName} ${project.createdBy.lastName}`
                : "Project Manager"}
            </span>
            <span className="ml-1">
              {notification.type?.includes("task")
                ? "assigned a task"
                : notification.type?.includes("project")
                ? "assigned a project"
                : "sent you a notification"}
            </span>
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-1">
            {notification.title}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {formatDate(notification.createdAt)}
          </p>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-700 mt-4">{notification.message}</p>

        {/* === Dynamic Task/Project Preview === */}
        {(project || displayTask) && (
          <div className="border border-gray-200 rounded-xl p-4 mt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 ml-3">
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900">
                  {displayTask?.title || relatedProject?.projectName}
                </h3>

                {/* Staff Assigned */}
                {assignedList.length > 0 && (
                  <div className="flex -space-x-2 items-center mt-3">
                    {assignedList.slice(0, 10).map((assign, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white -ml-2 first:ml-0"
                      >
                        {assign.staff?.photoUrl ? (
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
                            {assign.staff.firstName?.[0]}
                          </div>
                        )}
                      </div>
                    ))}

                    <button className="w-10 h-10 text-gray-600 rounded-full bg-gray-100 border flex items-center justify-center">
                      +
                    </button>
                  </div>
                )}

                {/* Due Date */}
                {displayTask?.dueDate && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                      <Calendar size={16} className="text-gray-500" />
                      <span>{formatDate(displayTask.dueDate)}</span>
                    </div>
                  </div>
                )}

                {/* Description */}
                {(displayTask?.description || project?.desc) && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-800 mb-1">
                      Description
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {displayTask?.description || project?.desc}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Button */}
        <div className="flex justify-center mt-8">
          <button
            style={{ cursor: "pointer" }}
            onClick={handleOpen}
            className="bg-[#95D700] hover:bg-[#80C400] text-white font-medium text-sm px-6 py-2.5 rounded-md"
          >
            {notification.type?.toLowerCase().includes("task") ||
            notification.type?.toLowerCase() === "deadline" ||
            taskData ||
            relatedTask
              ? "Open Task"
              : "Open Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
