"use client";

import Image from "next/image";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { ProjectStatus } from "@/dataTypes/Data-Types";
export interface Project {
  id: number;
  projectName: string;
  desc?: string;
  status: string;
  startDate: string;
  endDate: string;
  priority: "high" | "medium" | "low";
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
      <div className="p-6 border rounded-lg text-gray-500">
        No project data available
      </div>
    );
  }
  const progressValue = () => {
    switch (project.status as ProjectStatus) {
      case ProjectStatus.NOT_STARTED:
        return 25;
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
  const progress = progressValue();
  // const progress = 75; // 🔹 Placeholder: you can compute this from your data
  const priorityColors: Record<string, string> = {
    high: "text-red-500 border border-red-500",
    medium: "text-yellow-500 border border-yellow-500",
    low: "text-green-500 border border-green-500",
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 border border-gray-200 flex flex-col gap-4">
      {/* 🔹 Title + Priority */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-bold text-gray-900">
          {project.projectName}
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            priorityColors[project.priority]
          }`}
        >
          {project.priority}
        </span>
      </div>

      {/* 🔹 Description */}
      <p className="text-gray-600 text-sm">{project.desc}</p>

      {/* 🔹 Status */}
      <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-600 font-medium w-fit">
        {project.status.replace("_", " ")}
      </span>

      {/* 🔹 Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-lime-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-700">{progress}%</span>
      </div>

      {/* 🔹 Dates */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar size={16} />
        {new Date(project.startDate).toLocaleDateString()} -{" "}
        {new Date(project.endDate).toLocaleDateString()}
      </div>

      {/* 🔹 Assigned Staff */}
      <div className="flex items-center mt-2">
        {project.assignedTo?.slice(0, 4).map((assign, idx: number) => (
          <div
            key={idx}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-white -ml-2 first:ml-0"
          >
            {assign.staff?.photoUrl ? (
              <Image
                src={assign.staff.photoUrl}
                alt={`${assign.staff.firstName}`}
                width={32}
                height={32}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="bg-gray-300 w-full h-full flex items-center justify-center text-xs text-white">
                {assign.staff?.firstName?.[0]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🔹 Most Recent Comment */}
      {project.comments.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-medium">
            {project.comments[0].staff?.firstName}{" "}
            {project.comments[0].staff?.lastName}
          </span>{" "}
          – "{project.comments[0].content}"
        </p>
      )}

      {/* 🔹 Footer */}
      <div className="flex justify-between items-center mt-3">
        <span className="text-sm text-lime-600 font-medium">
          {project.createdBy?.employment?.department?.name || "—"}
        </span>

        <Link href={`/project/${project.id}`}>
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
