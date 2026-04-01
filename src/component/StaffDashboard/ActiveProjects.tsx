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
    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-[#86CD23]" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Projects</h3>
        </div>
        <Link href="/projects" className="text-sm font-medium text-[#86CD23] hover:underline">
          View all &rarr;
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading active projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500 text-sm">No active projects right now.</p>
      ) : (
        <div className="space-y-6">
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
                <div className="flex justify-between items-end mb-2">
                   <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{project.projectName}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{details}</p>
                   </div>
                   <span className={`text-sm font-bold ${barColor.replace('bg-', 'text-')}`}>{progress}%</span>
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
