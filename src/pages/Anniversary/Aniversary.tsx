"use client";

import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import Api from "@/utils/api"; // ✅ Axios instance

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

  // ================= Fetch This Month =================
  useEffect(() => {
    const fetchMonthAnniversaries = async () => {
      setLoadingMonth(true);
      try {
        const res = await Api.get<PaginatedResult<StaffAnniversary>>(
          `/staff-register/anniversaries/month?page=${pageMonth}&limit=${limit}`
        );
        setMonthAnniversaries(res.data.data);
        setTotalMonth(res.data.total);
      } catch (error) {
        console.error("Error fetching this month anniversaries:", error);
      } finally {
        setLoadingMonth(false);
      }
    };
    fetchMonthAnniversaries();
  }, [pageMonth]);

  // ================= Fetch Upcoming =================
  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoadingUpcoming(true);
      try {
        const res = await Api.get<PaginatedResult<StaffAnniversary>>(
          `/staff-register/anniversaries/all/upcoming?page=${pageUpcoming}&limit=${limit}`
        );
        setUpcomingAnniversaries(res.data.data);
        setTotalUpcoming(res.data.total);
      } catch (error) {
        console.error("Error fetching upcoming anniversaries:", error);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchUpcoming();
  }, [pageUpcoming]);

  // ================= Fetch Recent =================
  useEffect(() => {
    const fetchRecent = async () => {
      setLoadingRecent(true);
      try {
        const res = await Api.get<PaginatedResult<StaffAnniversary>>(
          `/staff-register/anniversaries/all/recent?page=${pageRecent}&limit=${limit}`
        );
        setRecentAnniversaries(res.data.data);
        setTotalRecent(res.data.total);
      } catch (error) {
        console.error("Error fetching recent anniversaries:", error);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecent();
  }, [pageRecent]);

  // ================= Helpers =================
  const filterBySearch = (list: StaffAnniversary[]) =>
    list.filter((staff) =>
      `${staff.firstName} ${staff.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const totalPagesMonth = Math.ceil(totalMonth / limit);
  const totalPagesUpcoming = Math.ceil(totalUpcoming / limit);
  const totalPagesRecent = Math.ceil(totalRecent / limit);

  return (
    <div>
      {/* Header */}
      <div className="bg-[#FF990C] text-white h-[50vh] flex items-center justify-center w-full mt-16">
        <h1 className="text-3xl sm:text-5xl font-bold">Anniversary</h1>
      </div>

      <div className="min-h-screen w-full bg-[#FAFAFA]">
        <div className="max-w-[95%] mx-auto px-4 sm:px-8">
          <h1 className="pt-12 text-2xl sm:text-3xl font-bold text-gray-900">
            Anniversary
          </h1>

          <p className="mt-8 text-gray-600 text-base sm:text-lg">
            Browse and connect with your colleagues across the organization
          </p>

          {/* 🔎 Search */}
          <div className="mt-8 flex items-center w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <Search className="text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search anniversaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* =================== THIS MONTH =================== */}
          <Section
            title="This Month"
            loading={loadingMonth}
            data={filterBySearch(monthAnniversaries)}
            pagination={{
              page: pageMonth,
              totalPages: totalPagesMonth,
              setPage: setPageMonth,
            }}
          />

          {/* =================== UPCOMING ANNIVERSARIES =================== */}
          <Section
            title="Upcoming Anniversaries"
            loading={loadingUpcoming}
            data={filterBySearch(upcomingAnniversaries)}
            pagination={{
              page: pageUpcoming,
              totalPages: totalPagesUpcoming,
              setPage: setPageUpcoming,
            }}
          />

          {/* =================== RECENT ANNIVERSARIES =================== */}
          <Section
            title="Recent Anniversaries"
            loading={loadingRecent}
            data={filterBySearch(recentAnniversaries)}
            pagination={{
              page: pageRecent,
              totalPages: totalPagesRecent,
              setPage: setPageRecent,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ================= Reusable Section =================
const Section = ({
  title,
  loading,
  data,
  pagination,
}: {
  title: string;
  loading: boolean;
  data: StaffAnniversary[];
  pagination?: {
    page: number;
    totalPages: number;
    setPage: (p: number) => void;
  };
}) => {
  return (
    <div className="mt-16 pb-16">
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-6xl">
        {title}
      </h1>

      {loading ? (
        <p>Loading {title.toLowerCase()}...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500">No anniversaries 🎉</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
            {data.map((staff) => (
              <AnniversaryCard key={staff.id} staff={staff} />
            ))}
          </div>

          {/* Custom Pagination UI */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {/* Previous Button */}
              <button
                onClick={() => pagination.setPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                  pagination.page === 1
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#95D700] text-white"
                }`}
              >
                <ArrowLeft size={16} /> Previous
              </button>

              {/* Page Numbers */}
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.setPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      pagination.page === pageNum
                        ? "bg-[#95D700] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => pagination.setPage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                  pagination.page === pagination.totalPages
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#95D700] text-white"
                }`}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ================= Reusable Card =================
const AnniversaryCard = ({ staff }: { staff: StaffAnniversary }) => {
  const anniversaryDate = staff.nextAnniversary || staff.lastAnniversary;

  return (
    <div className="flex flex-col items-start text-left w-full">
      <div className="relative w-[315px] h-[315px] sm:w-[420px] sm:h-[250px] md:w-[380px] md:h-[260px] lg:w-[280px] lg:h-[280px] rounded-lg overflow-hidden shadow-sm">
        <Image
          src={staff.photoUrl || "/default-avatar.png"}
          alt={`${staff.firstName} ${staff.lastName}`}
          width={280}
          height={280}
          className="w-full h-full object-cover bg-gray-100"
        />
      </div>

      <p className="mt-3 text-gray-900 font-semibold text-lg">
        {staff.firstName} {staff.lastName}
      </p>

      {anniversaryDate && (
        <span className="text-gray-500 text-sm">
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

export default Anniversary;
