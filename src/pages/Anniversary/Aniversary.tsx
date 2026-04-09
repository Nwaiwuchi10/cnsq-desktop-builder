"use client";

import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import Api from "@/utils/api"; // ✅ Axios instance
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";

interface StaffAnniversary {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | StaticImageData | null;
  nextAnniversary?: string;
  lastAnniversary?: string;
  yearsCompleted: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const Anniversary = () => {
  // ================= State =================
  const [monthAnniversaries, setMonthAnniversaries] = useState<
    StaffAnniversary[]
  >([]);
  const [upcomingAnniversaries, setUpcomingAnniversaries] = useState<
    StaffAnniversary[]
  >([]);
  const [recentAnniversaries, setRecentAnniversaries] = useState<
    StaffAnniversary[]
  >([]);

  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [pageMonth, setPageMonth] = useState(1);
  const [pageUpcoming, setPageUpcoming] = useState(1);
  const [pageRecent, setPageRecent] = useState(1);

  const limit = 4;
  const [totalMonth, setTotalMonth] = useState(0);
  const [totalUpcoming, setTotalUpcoming] = useState(0);
  const [totalRecent, setTotalRecent] = useState(0);

  // ================= Fetch Data =================
  useEffect(() => {
    const fetchData = async () => {
      setLoadingMonth(true);
      try {
        const res = await Api.get<PaginatedResult<StaffAnniversary>>(
          `/staff-register/anniversaries/month?page=${pageMonth}&limit=${limit}`,
        );
        setMonthAnniversaries(res.data.data);
        setTotalMonth(res.data.total);
      } catch (err) {
        console.error("Error fetching month anniversaries:", err);
      } finally {
        setLoadingMonth(false);
      }
    };
    fetchData();
  }, [pageMonth]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingUpcoming(true);
      try {
        const res = await Api.get<PaginatedResult<StaffAnniversary>>(
          `/staff-register/anniversaries/all/upcoming?page=${pageUpcoming}&limit=${limit}`,
        );
        setUpcomingAnniversaries(res.data.data);
        setTotalUpcoming(res.data.total);
      } catch (err) {
        console.error("Error fetching upcoming anniversaries:", err);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchData();
  }, [pageUpcoming]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingRecent(true);
      try {
        const res = await Api.get<PaginatedResult<StaffAnniversary>>(
          `/staff-register/anniversaries/all/recent?page=${pageRecent}&limit=${limit}`,
        );
        setRecentAnniversaries(res.data.data);
        setTotalRecent(res.data.total);
      } catch (err) {
        console.error("Error fetching recent anniversaries:", err);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchData();
  }, [pageRecent]);

  // ================= Helpers =================
  const filterBySearch = (list: StaffAnniversary[]) =>
    list.filter((staff) =>
      `${staff.firstName} ${staff.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

  return (
    <StaffLayout>
      {/* Header */}
      <div className="bg-[#FF990C] text-white h-[50vh] flex items-center justify-center w-full mt-4">
        <h1 className="text-3xl sm:text-5xl font-bold">Anniversary</h1>
      </div>

      <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-[#0d0d0d] transition-colors pb-12">
        <div className="max-w-[100%] mx-auto px-4 sm:px-8">
          <h1 className="pt-12 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Anniversary
          </h1>

          <p className="mt-8 text-gray-600 dark:text-gray-300 text-base sm:text-lg">
            Browse and connect with your colleagues across the organization
          </p>

          {/* 🔎 Search */}
          <div className="mt-8 flex items-center w-full sm:w-1/3 bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 transition-colors">
            <Search className="text-gray-500 dark:text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search anniversaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-2 w-full outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
            />
          </div>

          {/* Sections */}
          <Section
            title="This Month"
            loading={loadingMonth}
            data={filterBySearch(monthAnniversaries)}
            page={pageMonth}
            total={totalMonth}
            limit={limit}
            setPage={setPageMonth}
          />

          <Section
            title="Upcoming Anniversaries"
            loading={loadingUpcoming}
            data={filterBySearch(upcomingAnniversaries)}
            page={pageUpcoming}
            total={totalUpcoming}
            limit={limit}
            setPage={setPageUpcoming}
          />

          <Section
            title="Recent Anniversaries"
            loading={loadingRecent}
            data={filterBySearch(recentAnniversaries)}
            page={pageRecent}
            total={totalRecent}
            limit={limit}
            setPage={setPageRecent}
          />
        </div>
      </div>
    </StaffLayout>
  );
};

// ================= Reusable Section =================
const Section = ({
  title,
  loading,
  data,
  page,
  total,
  limit,
  setPage,
}: {
  title: string;
  loading: boolean;
  data: StaffAnniversary[];
  page: number;
  total: number;
  limit: number;
  setPage: (p: number) => void;
}) => {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mt-16 pb-16">
      <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-10 w-full max-w-6xl">
        {title}
      </h1>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">
          Loading {title.toLowerCase()}...
        </p>
      ) : data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No anniversaries 🎉</p>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
            {data.map((staff) => (
              <AnniversaryCard key={staff.id} staff={staff} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          )}
        </>
      )}
    </div>
  );
};

// ================= Card =================
const AnniversaryCard = ({ staff }: { staff: StaffAnniversary }) => {
  const anniversaryDate = staff.nextAnniversary || staff.lastAnniversary;

  return (
    <div className="flex flex-col items-start text-left w-full">
      <div className="relative w-[315px] h-[315px] sm:w-[420px] sm:h-[250px] md:w-[380px] md:h-[260px] lg:w-[280px] lg:h-[280px] rounded-lg overflow-hidden shadow-sm">
        <Image
          src={staff?.photoUrl || "/default-avatar.png"}
          alt={`${staff.firstName} ${staff.lastName}`}
          width={280}
          height={280}
          className="w-full h-full object-cover bg-gray-100 dark:bg-gray-800"
        />
      </div>

      <p className="mt-3 text-gray-900 dark:text-gray-100 font-semibold text-lg">
        {staff.firstName} {staff.lastName}
      </p>

      {anniversaryDate && (
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {new Date(anniversaryDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
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
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm sm:text-base ${
          page === 1
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
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-2 rounded-lg text-sm sm:text-base font-medium ${
              page === p
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
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm sm:text-base ${
          page === totalPages
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-[#95D700] text-white"
        }`}
      >
        Next <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default Anniversary;
