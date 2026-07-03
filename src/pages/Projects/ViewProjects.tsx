"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Plus, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Api from "@/utils/api";
import ProjectStatsCards from "./ProjectStats/ProjectStats";
import ProjectCard from "./ProjectCrad";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";

interface Project {
  id: number;
  uuid: string;
  projectName: string;
  desc?: string;
  derivedStatus?: string;
  status: string;
  startDate: string;
  endDate: string;
  projectProgress?: number;
  department: { id: number; name: string };
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
    staff: { firstName: string; lastName: string };
    createdAt: string;
  }[];
  createdBy: { firstName: string; lastName: string };
}

export default function ViewProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{
    status: string;
    sort: "newest" | "oldest";
  }>({
    status: "",
    sort: "newest",
  });
  const [tempFilters, setTempFilters] = useState<{
    status: string;
    sort: "newest" | "oldest";
  }>({
    status: "",
    sort: "newest",
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleApplyFilter = () => {
    setFilters(tempFilters);
    setShowFilterDropdown(false);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await Api.get(
          `/projects/paginated/all?page=${page}&limit=${limit}&search=${search}&status=${filters.status}&sort=${filters.sort}`,
        );
        setProjects(res?.data?.data);
        setTotal(res?.data?.total);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [page, limit, search, filters]);

  const totalPages = Math.ceil(total / limit);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 3;
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > maxVisible) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <StaffLayout>
      <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-[#0d0d0d] py-4 transition-colors">
        <div className="max-w-[100%] mx-auto px-4 sm:px-8">
          <ProjectStatsCards />

          <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors">
            Projects
          </h1>
          <p className="mt-6 text-gray-600 dark:text-gray-400 text-base sm:text-lg transition-colors">
            Manage and track organizational projects
          </p>

          {/* 🔍 Toolbar Section */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
            {/* Search Bar */}
            <div className="flex items-center w-full sm:w-1/3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 transition-colors">
              <Search className="text-gray-500 dark:text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by project name, status, or department..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="ml-2 w-full outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
              />
            </div>

            {/* Buttons (Desktop Layout) */}
            <div className="hidden sm:flex items-center gap-3 relative">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown((prev) => !prev)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141414] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
                >
                  <span>Filter & Sort</span>
                  <ChevronDown size={18} />
                </button>

                {showFilterDropdown && (
                  <div className="absolute top-12 right-0 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-[280px] z-[100] p-5 space-y-4 animate-in fade-in zoom-in duration-200">
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                      Filter & Sort
                    </h3>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Status
                      </label>
                      <select
                        value={tempFilters.status}
                        onChange={(e) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                      >
                        <option value="">All Statuses</option>
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="testing">Testing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Sort
                      </label>
                      <select
                        value={tempFilters.sort}
                        onChange={(e) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            sort: e.target.value as "newest" | "oldest",
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                      </select>
                    </div>

                    <button
                      onClick={handleApplyFilter}
                      className="w-full py-3 bg-[#95D700] text-white font-bold rounded-lg hover:bg-[#78B500] transition-colors shadow-lg active:scale-[0.98] mt-2"
                    >
                      Apply Filter
                    </button>
                  </div>
                )}
              </div>

              {/* Add Project */}
              <Link href="/project/create">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#86CD23] hover:bg-[#7ab520] text-black font-semibold rounded-lg font-medium hover:bg-green-600 transition">
                  Add New Project <Plus size={18} />
                </button>
              </Link>
            </div>

            {/* 📱 Mobile Layout */}
            <div className="flex flex-col sm:hidden gap-2 mt-2 relative z-20">
              {/* Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown((prev) => !prev)}
                  className="flex items-center justify-between gap-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-[#1a1a1a] transition-colors"
                >
                  Filter & Sort
                  <ChevronDown size={16} />
                </button>

                {showFilterDropdown && (
                  <div className="absolute top-12 left-0 right-0 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-full z-30 p-4 space-y-4">
                    <h3 className="text-gray-900 dark:text-white font-bold text-base mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                      Filter & Sort
                    </h3>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Status
                      </label>
                      <select
                        value={tempFilters.status}
                        onChange={(e) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                      >
                        <option value="">All Statuses</option>
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="testing">Testing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Sort
                      </label>
                      <select
                        value={tempFilters.sort}
                        onChange={(e) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            sort: e.target.value as "newest" | "oldest",
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                      </select>
                    </div>

                    <button
                      onClick={handleApplyFilter}
                      className="w-full py-3 bg-[#95D700] text-white font-bold rounded-lg hover:bg-[#78B500] transition-colors shadow-lg active:scale-[0.98] mt-2"
                    >
                      Apply Filter
                    </button>
                  </div>
                )}
              </div>

              {/* Add Project */}
              <Link href="/project/create" className="w-full">
                <button className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition">
                  Add New Project <Plus size={18} />
                </button>
              </Link>
            </div>
          </div>

          {/* 🗂 Project Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {projects?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No projects found.
              </p>
            ) : (
              projects?.map((project) => (
                <ProjectCard key={project?.id} project={project} />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${page === 1
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    : "bg-[#95D700] text-white hover:bg-green-600"
                  }`}
              >
                <ArrowLeft size={16} /> Prev
              </button>

              {getPageNumbers().map((p, idx) =>
                typeof p === "string" ? (
                  <span
                    key={idx}
                    className="px-3 py-2 text-gray-500 dark:text-gray-400"
                  >
                    {p}
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg font-medium ${page === p
                        ? "bg-[#95D700] text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${page === totalPages
                    ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    : "bg-[#95D700] text-white hover:bg-green-600"
                  }`}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
