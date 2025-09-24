"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import Api from "@/utils/api";
import ProjectStatsCards from "./ProjectStats/ProjectStats";
import ProjectCard from "./ProjectCrad";
import LoadingSpinner from "@/component/Loading/LoadingSpinner";

interface Project {
  id: number;
  projectName: string;
  desc?: string;
  status: string;
  startDate: string;
  endDate: string;
  department: {
    id: number;
    name: string;
  };
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

export default function ViewProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  // 🔹 New states for filtering
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await Api.get(
          `/projects/paginated/all?page=${page}&limit=${limit}`
        );
        setProjects(res.data.data);
        setAllProjects(res.data.data);
        setTotal(res.data.total);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [page, limit]);

  // 🔹 Apply search + filter
  useEffect(() => {
    let filtered = allProjects;

    if (search.trim()) {
      filtered = filtered.filter((project) =>
        project.projectName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(
        (project) => project.status === selectedStatus
      );
    }

    setProjects(filtered);
  }, [search, selectedStatus, allProjects]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <LoadingSpinner />
        {/* <p>Loading project stats...</p> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] py-24">
      <div className="max-w-[95%] mx-auto px-4 sm:px-8">
        {/* 📊 Stats */}
        <div>
          <ProjectStatsCards />
        </div>

        {/* 🏷️ Title */}
        <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
          Projects
        </h1>

        <p className="mt-6 text-gray-900 text-base sm:text-lg">
          Manage and track organizational projects
        </p>

        {/* 🔍 Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search + Mobile Filter */}
          <div className="flex items-center w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2 relative">
            <Search className="text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by project name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
            />

            {/* Mobile Filter + Add */}
            <div className="flex sm:hidden gap-2 ml-2">
              {/* Filter Dropdown Toggle */}
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-100"
              >
                {selectedStatus || "Filter"}
                <ChevronDown size={16} />
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg w-48 z-10">
                  <ul className="max-h-60 overflow-y-auto">
                    <li
                      onClick={() => {
                        setSelectedStatus("");
                        setShowDropdown(false);
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
                            setShowDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {status.replace("_", " ")}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Add Project */}
              <Link href="/project/create">
                <button className="flex items-center gap-2 px-3 py-1 bg-[#95D700] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition">
                  Add Project <Plus size={16} />
                </button>
              </Link>
            </div>
          </div>

          {/* Desktop Filter + Add */}
          <div className="hidden sm:flex items-center gap-3 relative">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {selectedStatus || "Filter by Status"}
              <ChevronDown size={16} />
            </button>

            {showDropdown && (
              <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg w-56 z-10">
                <ul className="max-h-60 overflow-y-auto">
                  <li
                    onClick={() => {
                      setSelectedStatus("");
                      setShowDropdown(false);
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
                          setShowDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {status.replace("_", " ")}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            <Link href="/project/create">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition">
                Add New Project <Plus size={18} />
              </button>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects found.</p>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
