"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import TaskBoard from "./TaskBoard";
import ProjectTasksSheet from "../ProjectTrackSheet/ProjectTrackingSheet";

interface DisplayTaskProps {
  projectId: number | string; // coming from ProjectDetails
}

const DisplayTask: React.FC<DisplayTaskProps> = ({ projectId }) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <div>
      <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
        To-Do
      </h1>

      {/* Search + Actions */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2">
          <Search className="text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by staff name, position, role..."
            className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
          />

          {/* Mobile buttons */}
          <div className="flex sm:hidden gap-2 ml-2">
            <button
              style={{ cursor: "pointer" }}
              onClick={() => setShowTable((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-100"
            >
              {showTable ? "View Board" : "View Task Table"}
              <Filter size={16} />
            </button>

            <Link href={`/project/${projectId}/add-task`}>
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
            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {showTable ? "View Board" : "View Task Table"}
            <Filter size={16} />
          </button>

          <Link href={`/project/${projectId}/add-task`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition">
              Add New Task <Plus size={18} />
            </button>
          </Link>
        </div>
      </div>

      {/* Toggle views */}
      <div className="mt-12">
        {showTable ? (
          <ProjectTasksSheet projectId={projectId} />
        ) : (
          <TaskBoard />
        )}
      </div>
    </div>
  );
};

export default DisplayTask;
