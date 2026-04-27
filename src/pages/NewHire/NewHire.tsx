"use client";

import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import Api from "@/utils/api";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import DailyInspiration from "@/component/StaffDashboard/DailyInspiration";

interface NewHireStaff {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | StaticImageData | null;
  newHire: {
    daysOnBoard: number | null;
    hireDate: string | null;
    isNewHire: boolean;
  };
  taskPerformance: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    performance: {
      level: string;
      colorCode: string;
      label: string;
    };
  };
  employment?: {
    department?: {
      name?: string;
    };
    jobTitle?: string[];
  };
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const NewHire = () => {
  // ================= State =================
  const [newHires, setNewHires] = useState<NewHireStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // ================= Fetch Data =================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await Api.get<PaginatedResult<NewHireStaff>>(
          `/staff-register/all/staffs/new-hires?page=${page}&limit=${limit}&search=${searchTerm}`,
        );
        setNewHires(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Error fetching new hires:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, searchTerm]);

  return (
    <StaffLayout>
      {/* Header */}
      {/* <div className="bg-[#FF990C] text-white h-[50vh] flex items-center justify-center w-full mt-4">
        <h1 className="text-3xl sm:text-5xl font-bold">New Hires</h1>
      </div> */}
      <div>
        <DailyInspiration />
      </div>

      <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-[#0d0d0d] transition-colors pb-12">
        <div className="max-w-[100%] mx-auto px-4 sm:px-8">
          <h1 className="pt-12 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            New Hires
          </h1>

          <p className="mt-8 text-gray-600 dark:text-gray-300 text-base sm:text-lg">
            Welcome our latest colleagues who recently joined the team
          </p>

          {/* 🔎 Search */}
          <div className="mt-8 flex items-center w-full sm:w-1/3 bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 transition-colors">
            <Search className="text-gray-500 dark:text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search new hires..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="ml-2 w-full outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
            />
          </div>

          {/* Grid Section */}
          <div className="mt-16 pb-16">
            {loading ? (
              <p className="text-gray-600 dark:text-gray-400">
                Loading new hires...
              </p>
            ) : newHires.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No new hires found 🎉
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
                  {newHires.map((staff) => (
                    <NewHireCard key={staff.id} staff={staff} />
                  ))}
                </div>

                {/* Pagination */}
                {total > limit && (
                  <Pagination
                    page={page}
                    totalPages={Math.ceil(total / limit)}
                    setPage={setPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

// ================= Card =================
const NewHireCard = ({ staff }: { staff: NewHireStaff }) => {
  const hireDate = staff.newHire?.hireDate;

  return (
    <div className="flex flex-col items-start text-left w-full">
      <div className="relative w-full aspect-square sm:aspect-[420/250] md:aspect-[380/260] lg:aspect-[280/280] rounded-lg overflow-hidden shadow-sm">
        <Image
          src={staff?.photoUrl || "/default-avatar.png"}
          alt={`${staff.firstName} ${staff.lastName}`}
          fill
          className="object-cover bg-gray-100 dark:bg-gray-800"
        />
      </div>

      <p className="mt-3 text-gray-900 dark:text-gray-100 font-semibold text-lg">
        {staff.firstName} {staff.lastName}
      </p>

      {hireDate && (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          Joined:{" "}
          {new Date(hireDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      )}

      {staff.employment?.department?.name && (
        <span className="mt-1 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
          {staff.employment.department.name}
        </span>
      )}
    </div>
  );
};

// ================= Pagination =================
const Pagination = ({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) => {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm sm:text-base ${page === 1
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-[#95D700] text-white"
          }`}
      >
        <ArrowLeft size={16} /> Prev
      </button>

      {/* Page numbers */}
      {generatePageNumbers().map((p, idx) =>
        typeof p === "string" ? (
          <span
            key={idx}
            className="px-3 py-2 text-gray-500 dark:text-gray-400"
          >
            {p}
          </span>
        ) : (
          <button
            key={idx}
            onClick={() => setPage(p)}
            className={`px-3 py-2 rounded-lg text-sm sm:text-base font-medium ${page === p
                ? "bg-[#95D700] text-white"
                : "bg-gray-200 text-gray-700"
              }`}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm sm:text-base ${page === totalPages
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-[#95D700] text-white"
          }`}
      >
        Next <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default NewHire;
