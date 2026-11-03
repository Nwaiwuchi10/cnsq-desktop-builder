"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/component/Navbar/Navbar";
import Footer from "@/component/Footer/Footer";
import Api from "@/utils/api";
import { WeeklyMetricsData, WeeklyMetricsProject } from "@/component/ProjectMetrics/ProjectMetricsSection";

export default function ProjectMetricsPage() {
  const [metrics, setMetrics] = useState<WeeklyMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const res = await Api.get("/squad-metrics");
        if (isMounted && res.data) {
          setMetrics(res.data);
        }
      } catch (err) {
        console.error("Error fetching project metrics:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter projects by Search and Stage
  const filteredProjects = useMemo(() => {
    if (!metrics?.projects) return [];
    return metrics.projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.developerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.statusText.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (stageFilter === "ALL") return true;
      if (stageFilter === "AT_RISK") return Boolean(p.isAtRisk);
      if (stageFilter === "SHIPPED") return p.progressPercent === 100;
      if (stageFilter === "IN_PROGRESS")
        return !p.isAtRisk && p.progressPercent > 0 && p.progressPercent < 100;
      return true;
    });
  }, [metrics, searchTerm, stageFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0d0d0d] flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-20 pt-28 sm:pt-32 pb-12">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] text-xs sm:text-sm font-semibold text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white shadow-2xs hover:shadow-xs transition-all active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black tracking-widest text-[#95D700] uppercase block mb-1.5 font-mono">
              {metrics?.weekBadgeText ? `PROJECTS · ${metrics.weekBadgeText.toUpperCase()}` : "PROJECT METRICS"}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight">
              All Project Metrics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Complete status, timeline, progress tracking, and developer assignments.
            </p>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
          <div className="bg-[#F2F8E8] dark:bg-[#152312] border border-[#E1EFCE] dark:border-[#22381d] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4F7302] dark:text-[#95D700] leading-none mb-2">
              {loading ? "..." : metrics?.totalProjects ?? 0}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#4F7302] dark:text-[#95D700] tracking-wider uppercase font-mono">
              PROJECTS
            </span>
          </div>

          <div className="bg-[#F4F8EB] dark:bg-[#172414] border border-[#E5EED3] dark:border-[#23381e] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4F7302] dark:text-[#95D700] leading-none mb-2">
              {loading ? "..." : metrics?.shippedProjects ?? 0}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#4F7302] dark:text-[#95D700] tracking-wider uppercase font-mono">
              SHIPPED
            </span>
          </div>

          <div className="bg-[#FFF6ED] dark:bg-[#281c12] border border-[#FEE7D0] dark:border-[#402a18] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#EA580C] dark:text-[#FB923C] leading-none mb-2">
              {loading ? "..." : metrics?.atRiskProjects ?? 0}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#EA580C] dark:text-[#FB923C] tracking-wider uppercase font-mono">
              AT RISK
            </span>
          </div>

          <div className="bg-[#FFF4E8] dark:bg-[#281b10] border border-[#FFE3CC] dark:border-[#422915] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#D97706] dark:text-[#FBBF24] leading-none mb-2">
              {loading ? "..." : metrics?.birthdaysCount ?? 0}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#D97706] dark:text-[#FBBF24] tracking-wider uppercase font-mono">
              BIRTHDAYS
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects, developers, or status..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#95D700]/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "All" },
              { id: "IN_PROGRESS", label: "Active" },
              { id: "SHIPPED", label: "Shipped" },
              { id: "AT_RISK", label: "At Risk" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStageFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  stageFilter === tab.id
                    ? "bg-[#95D700] text-black shadow-xs"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xs animate-pulse"
              >
                <div className="h-5 w-44 bg-gray-200 dark:bg-gray-800 rounded-sm mb-3"></div>
                <div className="h-3.5 w-52 bg-gray-100 dark:bg-gray-800 rounded-sm mb-4"></div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full mb-3"></div>
                <div className="h-3 w-36 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
              </div>
            ))}
          </div>
        ) : paginatedProjects.length === 0 ? (
          <div className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500">
            No projects matched your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {paginatedProjects.map((project, idx) => {
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
                        width: `${Math.min(Math.max(project.progressPercent || 0, 0), 100)}%`,
                      }}
                    />
                  </div>

                  {/* Footer status text */}
                  <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {project.progressPercent}% · {project.statusText}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414] text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === pageNum
                        ? "bg-[#95D700] text-black font-bold"
                        : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414] text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

