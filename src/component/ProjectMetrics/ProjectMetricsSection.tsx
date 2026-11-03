"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Api from "@/utils/api";

export interface WeeklyMetricsProject {
  id?: number;
  uuid?: string;
  name: string;
  stageBadge: {
    label: string;
    bg: string;
    color: string;
  };
  developerName: string;
  developerGender?: string;
  progressPercent: number;
  progressColor?: string;
  statusText: string;
  isAtRisk?: boolean;
}

export interface WeeklyMetricsData {
  weekBadgeText: string;
  totalProjects: number;
  shippedProjects: number;
  atRiskProjects: number;
  birthdaysCount: number;
  projects: WeeklyMetricsProject[];
}

/**
 * Calculates current calendar week badge: e.g. "PROJECTS · WEEK 45 · NOV 2026"
 */
function getLiveCalendarWeekBadge(): string {
  const now = new Date();
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const monthShort = now.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = now.getFullYear();
  return `PROJECTS · WEEK ${weekNo} · ${monthShort} ${year}`;
}

export default function ProjectMetricsSection() {
  const [metrics, setMetrics] = useState<WeeklyMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic live calendar week text
  const currentWeekBadge = useMemo(() => getLiveCalendarWeekBadge(), []);

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const res = await Api.get("/squad-metrics");
        if (isMounted && res.data) {
          setMetrics(res.data);
        }
      } catch (err) {
        console.error("Error fetching squad metrics for homepage:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Display top 6 projects on homepage preview
  const previewProjects = useMemo(() => {
    if (!metrics || !metrics.projects) return [];
    return metrics.projects.slice(0, 6);
  }, [metrics]);

  return (
    <section className="w-full bg-[#FAFAFA] dark:bg-[#0d0d0d] px-4 sm:px-6 md:px-20 py-8 md:py-12 transition-colors">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-black tracking-widest text-[#95D700] uppercase block mb-1.5 font-mono">
              {currentWeekBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight">
              Where every project stands
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-normal">
              The bar shows progress; the tag shows the current stage.
            </p>
          </div>

          <Link
            href="/project-metrics"
            className="self-start sm:self-auto px-4 py-2 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-white dark:bg-[#141414] text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold rounded-lg shadow-2xs hover:shadow-xs transition-all active:scale-98"
          >
            View All
          </Link>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Card 1: Projects */}
          <div className="bg-[#F2F8E8] dark:bg-[#152312] border border-[#E1EFCE] dark:border-[#22381d] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4F7302] dark:text-[#95D700] leading-none mb-2">
              {loading ? "..." : metrics?.totalProjects ?? 0}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#4F7302] dark:text-[#95D700] tracking-wider uppercase font-mono">
              PROJECTS
            </span>
          </div>

          {/* Card 2: Shipped */}
          <div className="bg-[#F4F8EB] dark:bg-[#172414] border border-[#E5EED3] dark:border-[#23381e] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4F7302] dark:text-[#95D700] leading-none mb-2">
              {loading ? "..." : metrics?.shippedProjects ?? 0}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#4F7302] dark:text-[#95D700] tracking-wider uppercase font-mono">
              SHIPPED
            </span>
          </div>

          {/* Card 3: At Risk */}
          <div className="bg-[#FFF6ED] dark:bg-[#281c12] border border-[#FEE7D0] dark:border-[#402a18] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#EA580C] dark:text-[#FB923C] leading-none mb-2">
              {loading ? "..." : metrics?.atRiskProjects ?? 0}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#EA580C] dark:text-[#FB923C] tracking-wider uppercase font-mono">
              AT RISK
            </span>
          </div>

          {/* Card 4: Birthdays */}
          <div className="bg-[#FFF4E8] dark:bg-[#281b10] border border-[#FFE3CC] dark:border-[#422915] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#D97706] dark:text-[#FBBF24] leading-none mb-2">
              {loading ? "..." : metrics?.birthdaysCount ?? 0}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#D97706] dark:text-[#FBBF24] tracking-wider uppercase font-mono">
              BIRTHDAYS
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Project Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xs animate-pulse"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="h-5 w-44 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                </div>
                <div className="h-3.5 w-52 bg-gray-100 dark:bg-gray-800 rounded-sm mb-4"></div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full mb-3"></div>
                <div className="h-3 w-36 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
              </div>
            ))}
          </div>
        ) : previewProjects.length === 0 ? (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-500">
            No projects available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {previewProjects.map((project, idx) => {
              const isAtRisk = Boolean(project.isAtRisk);
              const progressColor = isAtRisk ? "bg-[#EA580C]" : "bg-[#95D700]";

              return (
                <div
                  key={project.uuid || project.id || idx}
                  className={`bg-white dark:bg-[#141414] rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-md ${
                    isAtRisk
                      ? "border border-[#F97316] bg-[#FFFDFB] dark:bg-[#171412] dark:border-[#EA580C]"
                      : "border border-gray-100 dark:border-gray-800/80 shadow-2xs hover:border-gray-200 dark:hover:border-gray-700"
                  }`}
                >
                  {/* Title & Stage Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base sm:text-[17px] font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-snug">
                      {project.name}
                    </h3>

                    {/* Badge */}
                    {isAtRisk ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE2BF] dark:bg-[#3d230d] text-[#B35A00] dark:text-[#FFA043] flex-shrink-0">
                        <span>▲</span> At risk
                      </span>
                    ) : project.stageBadge ? (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0"
                        style={{
                          backgroundColor: project.stageBadge.bg || "#EEF2E6",
                          color: project.stageBadge.color || "#3F4A38",
                        }}
                      >
                        {project.stageBadge.label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex-shrink-0">
                        In progress
                      </span>
                    )}
                  </div>

                  {/* Developer In Charge */}
                  <div className="text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 mb-4 font-normal">
                    Developer in charge:{" "}
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {project.developerName || "Unassigned"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#E5E7EB] dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${progressColor} transition-all duration-500 rounded-full`}
                      style={{
                        width: `${Math.min(
                          Math.max(project.progressPercent || 0, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  {/* Footer status text e.g. "100% · Launched Oct 14" */}
                  <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {project.progressPercent}% · {project.statusText}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

