"use client";

import React, { useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import Api from "@/utils/api";
import { Project } from "@/pages/Projects/ProjectCrad";

export default function ActiveProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await Api.get("/projects/paginated/all?page=1&limit=4");
        setProjects(res?.data?.data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getProgressColor = (prog: number) => {
    if (prog >= 90) return "bg-[#10b981]";
    if (prog >= 75) return "bg-[#86CD23]";
    if (prog >= 60) return "bg-[#3b82f6]";
    return "bg-[#f97316]";
  };

  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 transition-colors w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 mb-6">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-[#86CD23] flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Active Projects
          </h3>
        </div>
        <Link
          href="/projects"
          className="text-xs sm:text-sm font-medium text-[#86CD23] hover:underline whitespace-nowrap"
        >
          View all &rarr;
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 text-xs sm:text-sm">
          Loading active projects...
        </p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500 text-xs sm:text-sm">
          No active projects right now.
        </p>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {projects.map((project) => {
            const progress = project.projectProgress ?? 0;
            const barColor = getProgressColor(progress);

            // Format deadline date
            const dateStr = project.endDate;
            const dueStr = dateStr
              ? `Due ${new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : "No deadline";

            const memberCount = project.assignedTo?.length || 0;
            const deptName = project.department?.name || "Multiple";

            const details = `${deptName} · ${memberCount} members · ${dueStr}`;

            return (
              <div key={project.id}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                      {project.projectName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {details}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold flex-shrink-0 ${barColor.replace("bg-", "text-")}`}
                  >
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className={`${barColor} h-2 rounded-full`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
