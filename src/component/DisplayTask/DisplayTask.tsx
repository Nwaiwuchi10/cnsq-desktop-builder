"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import TaskBoard from "./TaskBoard";
import ProjectTasksSheet from "../ProjectTrackSheet/ProjectTrackingSheet";
import { StaticImageData } from "next/image";
interface Project {
  id: number;
  uuid: string;
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
  assignedTo: {
    id: number;
    role: string;
    staff: {
      id: number;
      uuid: string;
      firstName: string;
      lastName: string;
      email: string;
      photoUrl: string | StaticImageData | null;
    };
  }[];
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
interface DisplayTaskProps {
  project?: Project; // optional now
}

const DisplayTask: React.FC<DisplayTaskProps> = ({ project }) => {
  const [showTable, setShowTable] = useState(true);
  console.log("Project in DisplayTask:", project);
  return (
    <div>
      <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        {project ? `To-Do for ${project.projectName}` : "All My Tasks"}
      </h1>

      {/* Search + Actions */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center w-full sm:w-1/3 bg-white dark:bg-[#141414] transition-colors border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2">
          <Search className="text-gray-500 dark:text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by staff name, position, role..."
            className="ml-2 w-full outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />

          {/* Mobile buttons */}
          <div className="flex sm:hidden gap-2 ml-2">
            <button
              style={{ cursor: "pointer" }}
              onClick={() => setShowTable((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            >
              {showTable ? "View Board" : "View Task Table"}
              <Filter size={16} />
            </button>

            <Link href={project ? `/project/${project?.uuid}/add-task` : "/add-task"}>
              <button className="flex items-center gap-2 px-3 py-1 bg-[#95D700] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition">
                Add New Task <Plus size={16} />
              </button>
            </Link>
          </div>
        </div>

        {/* Desktop buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            style={{ cursor: "pointer" }}
            onClick={() => setShowTable((prev) => !prev)}
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
          >
            {showTable ? "View Board" : "View Task Table"}
            <Filter size={16} />
          </button>

          <Link href={project ? `/project/${project?.uuid}/add-task` : "/add-task"}>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition">
              Add New Task <Plus size={18} />
            </button>
          </Link>
        </div>
      </div>

      {/* Toggle views */}
      <div className="mt-12 text-gray-600 dark:text-gray-400">
        {showTable ? (
          <ProjectTasksSheet projectId={project?.id} />
        ) : (
          <TaskBoard projectId={project?.id} />
        )}
      </div>
    </div>
  );
};

export default DisplayTask;
