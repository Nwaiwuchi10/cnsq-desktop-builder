"use client";

import Image from "next/image";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { ProjectStatus } from "@/dataTypes/Data-Types";
export interface Project {
  id: number;
  uuid: string;
  projectName: string;
  desc?: string;
  derivedStatus?: string;
  projectProgress?: number;
  status: string;
  department: {
    id: number;
    name: string;
  };
  startDate: string;
  endDate: string;
  priority: "critical" | "high" | "medium" | "low";
  timeLine: string;
  assignedTo: {
    id: number;
    role: string;
    staff: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      photoUrl?: string;
    };
  }[];
  comments: {
    id: number;
    content: string;
    staff: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }[];
  createdBy: {
    firstName: string;
    lastName: string;
    employment?: {
      department?: {
        name?: string;
      };
    };
  };
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  if (!project) {
    return (
      <div className="p-6 border dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400">
        No project data available
      </div>
    );
  }
  const progressValue = () => {
    switch (project.status as ProjectStatus) {
      case ProjectStatus.NOT_STARTED:
        return 0;
      case ProjectStatus.IN_PROGRESS:
        return 50;
      case ProjectStatus.TESTING:
        return 75;
      case ProjectStatus.COMPLETED:
        return 100;
      default:
        return 0;
    }
  };
  const progress = project.projectProgress ?? 0;

  const getProgressColor = (prog: number) => {
    if (prog >= 90) return "bg-[#10b981]";
    if (prog >= 75) return "bg-[#86CD23]";
    if (prog >= 60) return "bg-[#3b82f6]";
    return "bg-[#f97316]";
  };
  const barColor = getProgressColor(progress);
  const priorityColors: Record<string, string> = {
    critical: "text-red-700 border border-red-500",
    high: "text-red-500 border border-red-500",
    medium: "text-yellow-500 border border-yellow-500",
    low: "text-green-500 border border-green-500",
  };
  const statusColors: Record<ProjectStatus, string> = {
    not_started: "bg-red-100 dark:bg-red-900/30 text-red-600",
    in_progress: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
    testing: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    completed: "bg-green-100 dark:bg-green-900/30 text-green-600",
  };

  const formatStatus = (derivedStatus: string) =>
    derivedStatus?.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="bg-white dark:bg-[#141414] shadow rounded-2xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col gap-4 transition-colors">
      {/* Title + Priority */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {project?.projectName}
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            priorityColors[project?.priority]
          }`}
        >
          {project?.priority}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm">{project?.desc}</p>

      {/* Status */}
      <span
        className={`inline-block px-3 py-1 text-xs rounded-full font-medium w-fit ${
          statusColors[project?.derivedStatus as ProjectStatus]
        }`}
      >
        {formatStatus(project?.derivedStatus || project?.status)}
      </span>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className={`text-sm font-bold ${barColor.replace('bg-', 'text-')}`}>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Calendar size={16} />
        {new Date(project?.startDate).toLocaleDateString()} -{" "}
        {new Date(project?.endDate).toLocaleDateString()}
      </div>

      {/* Assigned Staff */}
      <div className="flex items-center mt-2">
        {project?.assignedTo?.slice(0, 4).map((assign, idx: number) => (
          <div
            key={idx}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 -ml-2 first:ml-0"
          >
            {assign?.staff?.photoUrl ? (
              <Image
                src={assign?.staff?.photoUrl}
                alt={`${assign?.staff?.firstName}`}
                width={32}
                height={32}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="bg-gray-300 dark:bg-gray-600 w-full h-full flex items-center justify-center text-xs text-white">
                {assign?.staff?.firstName?.[0]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Most Recent Comment */}
      {project?.comments?.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span className="font-medium">
            {project?.comments[0].staff?.firstName}{" "}
            {project?.comments[0].staff?.lastName}
          </span>{" "}
          – "{project?.comments[0].content}"
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-3">
        <span className="text-sm text-lime-600 font-medium">
          {project?.department?.name || "—"}
        </span>

        <Link href={`/project/${project?.uuid}`}>
          <button
            style={{ cursor: "pointer" }}
            className="text-lime-600 font-medium text-sm"
          >
            View Details →
          </button>
        </Link>
      </div>
    </div>
  );
}
