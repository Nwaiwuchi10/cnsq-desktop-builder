"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  ArrowLeft,
  ArrowRight,
  SortDesc,
} from "lucide-react";
import Link from "next/link";
import Api from "@/utils/api";
import ProjectStatsCards from "./ProjectStats/ProjectStats";
import ProjectCard from "./ProjectCrad";

interface Project {
  id: number;
  uuid: string;
  projectName: string;
  desc?: string;
  derivedStatus?: string; // 🔹 New field for derived status
  status: string;
  startDate: string;
  endDate: string;
  projectProgress?: number; // 🔹 New field for progress percentage
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
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await Api.get(
          `/projects/paginated/all?page=${page}&limit=${limit}&search=${search}&status=${selectedStatus}&sort=${sortOrder}`,
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
  }, [page, limit, search, selectedStatus, sortOrder]);

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
    <div className="min-h-screen w-full bg-[#FAFAFA] py-24">
      <div className="max-w-[95%] mx-auto px-4 sm:px-8">
        <ProjectStatsCards />

        <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
          Projects
        </h1>
        <p className="mt-6 text-gray-900 text-base sm:text-lg">
          Manage and track organizational projects
        </p>

        {/* 🔍 Toolbar Section */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
          {/* Search Bar */}
          <div className="flex items-center w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <Search className="text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by project name, status, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Buttons (Desktop Layout) */}
          <div className="hidden sm:flex items-center gap-3 relative">
            {/* Filter by Status */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusDropdown((prev) => !prev);
                  setShowSortDropdown(false);
                }}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {selectedStatus
                  ? selectedStatus.replace("_", " ")
                  : "Filter by Status"}
                <ChevronDown size={16} />
              </button>

              {showStatusDropdown && (
                <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg w-56 z-20">
                  <ul className="max-h-60 text-gray-600 overflow-y-auto">
                    <li
                      onClick={() => {
                        setSelectedStatus("");
                        setShowStatusDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      All Statuses
                    </li>
                    {["not_started", "in_progress", "testing", "completed"].map(
                      (status) => (
                        <li
                          key={status}
                          onClick={() => {
                            setSelectedStatus(status);
                            setShowStatusDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer capitalize"
                        >
                          {status.replace("_", " ")}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown((prev) => !prev);
                  setShowStatusDropdown(false);
                }}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <SortDesc size={16} />
                {sortOrder === "newest" ? "Newest" : "Oldest"}
                <ChevronDown size={16} />
              </button>

              {showSortDropdown && (
                <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg w-44 z-20">
                  <ul className="text-gray-600">
                    <li
                      onClick={() => {
                        setSortOrder("newest");
                        setShowSortDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Newest
                    </li>
                    <li
                      onClick={() => {
                        setSortOrder("oldest");
                        setShowSortDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Oldest
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Add Project */}
            <Link href="/project/create">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition">
                Add New Project <Plus size={18} />
              </button>
            </Link>
          </div>

          {/* 📱 Mobile Layout */}
          <div className="flex flex-col sm:hidden gap-2 mt-2 relative z-20">
            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusDropdown((prev) => !prev);
                  setShowSortDropdown(false);
                }}
                className="flex items-center justify-between gap-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {selectedStatus
                  ? selectedStatus.replace("_", " ")
                  : "Filter by Status"}
                <ChevronDown size={16} />
              </button>

              {showStatusDropdown && (
                <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg w-full z-30">
                  <ul className="max-h-60 text-gray-600 overflow-y-auto">
                    <li
                      onClick={() => {
                        setSelectedStatus("");
                        setShowStatusDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      All Statuses
                    </li>
                    {["not_started", "in_progress", "testing", "completed"].map(
                      (status) => (
                        <li
                          key={status}
                          onClick={() => {
                            setSelectedStatus(status);
                            setShowStatusDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer capitalize"
                        >
                          {status.replace("_", " ")}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown((prev) => !prev);
                  setShowStatusDropdown(false);
                }}
                className="flex items-center justify-between gap-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <SortDesc size={16} />
                {sortOrder === "newest" ? "Newest" : "Oldest"}
                <ChevronDown size={16} />
              </button>

              {showSortDropdown && (
                <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg w-full z-30">
                  <ul className="text-gray-600">
                    <li
                      onClick={() => {
                        setSortOrder("newest");
                        setShowSortDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Newest
                    </li>
                    <li
                      onClick={() => {
                        setSortOrder("oldest");
                        setShowSortDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Oldest
                    </li>
                  </ul>
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
            <p className="text-gray-500">No projects found.</p>
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
              className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                page === 1
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#95D700] text-white hover:bg-green-600"
              }`}
            >
              <ArrowLeft size={16} /> Prev
            </button>

            {getPageNumbers().map((p, idx) =>
              typeof p === "string" ? (
                <span key={idx} className="px-3 py-2 text-gray-500">
                  {p}
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    page === p
                      ? "bg-[#95D700] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                page === totalPages
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#95D700] text-white hover:bg-green-600"
              }`}
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
