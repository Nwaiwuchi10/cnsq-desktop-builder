"use client";

import Api from "@/utils/api";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// Define Staff type
interface Department {
  name: string;
  description: string;
}

interface DepartmentalRole {
  title: string;
  description: string;
}
interface Employment {
  employeeCode: string;
  jobTitle: string[];
  employmentType: string;
  workMode: string;
  hireDate: string;
  reportingManager: string;
  directReport: string;
  contractEndDate?: string | null;
  status: string;
  workLocation?: string | null;
  department: Department;
  departmentalRole: DepartmentalRole;
}
interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  dateOfBirth?: string;
  nextBirthday: string;
  employment?: Employment;
}

interface PaginatedResult {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
}

const Birthday = () => {
  const [todaysBirthdays, setTodaysBirthdays] = useState<Staff[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);

  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Staff[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  // Pagination state for upcoming
  const [pageUpcoming, setPageUpcoming] = useState(1);
  const [totalUpcoming, setTotalUpcoming] = useState(0);
  const limit = 6;

  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch today's birthdays
  useEffect(() => {
    const fetchTodaysBirthdays = async () => {
      try {
        const res = await Api.get<Staff[]>("/staff-register/birthdays/today");
        setTodaysBirthdays(res.data);
      } catch (error) {
        console.error("Error fetching today's birthdays:", error);
      } finally {
        setLoadingToday(false);
      }
    };
    fetchTodaysBirthdays();
  }, []);

  // ✅ Fetch upcoming birthdays with pagination
  useEffect(() => {
    const fetchUpcomingBirthdays = async () => {
      setLoadingUpcoming(true);
      try {
        const res = await Api.get<PaginatedResult>(
          `/staff-register/birthdays/all/upcoming?page=${pageUpcoming}&limit=${limit}`
        );
        setUpcomingBirthdays(res.data.data);
        setTotalUpcoming(res.data.total);
      } catch (error) {
        console.error("Error fetching upcoming birthdays:", error);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchUpcomingBirthdays();
  }, [pageUpcoming]);

  // 🔹 Filter by search term
  const filterBySearch = (staff: Staff[]) =>
    staff.filter((s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const filteredTodays = filterBySearch(todaysBirthdays);
  const filteredUpcoming = filterBySearch(upcomingBirthdays);

  const totalPagesUpcoming = Math.ceil(totalUpcoming / limit);

  return (
    <div>
      {/* Header */}
      <div className="bg-[#FF990C] text-white h-[50vh] flex items-center justify-center w-full mt-16">
        <h1 className="text-3xl sm:text-5xl font-bold">Birthdays</h1>
      </div>

      <div className="min-h-screen w-full bg-[#FAFAFA]">
        <div className="max-w-[95%] mx-auto px-4 sm:px-8">
          <h1 className="pt-12 text-2xl sm:text-3xl font-bold text-gray-900">
            Birthdays
          </h1>

          <p className="mt-8 text-gray-600 text-base sm:text-lg">
            Browse and connect with your colleagues across the organization
          </p>

          {/* 🔹 Search Bar */}
          <div className="mt-8 flex items-center w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <Search className="text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search birthdays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* 🔹 Today's Birthday Section */}
          <h1 className="pt-12 text-2xl sm:text-3xl font-bold text-gray-900">
            🎉 Today&apos;s Birthday
          </h1>
          {loadingToday ? (
            <div className="p-6 text-center">
              Loading today&apos;s birthdays...
            </div>
          ) : filteredTodays.length === 0 ? (
            <p className="mt-6 text-gray-500">No birthdays today 🎂</p>
          ) : (
            <div className="grid grid-cols-1 gap-16 pt-12 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
              {filteredTodays.map((staff) => (
                <BirthdayCard key={staff.id} staff={staff} />
              ))}
            </div>
          )}

          {/* 🔹 Upcoming Birthdays Section */}
          <h1 className="pt-12 text-2xl sm:text-3xl font-bold text-gray-900">
            🎉 Upcoming Birthdays
          </h1>
          {loadingUpcoming ? (
            <div className="p-6 text-center">Loading upcoming birthdays...</div>
          ) : filteredUpcoming.length === 0 ? (
            <p className="mt-6 text-gray-500">No upcoming birthdays 🎂</p>
          ) : (
            <>
              <div className="grid grid-cols-1 pb-12 gap-16 pt-12 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
                {filteredUpcoming.map((staff) => (
                  <BirthdayCard2 key={staff.id} staff={staff} />
                ))}
              </div>

              {/* 🔹 Pagination Controls */}
              {totalPagesUpcoming > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 pb-12 flex-wrap">
                  {/* Previous */}
                  <button
                    onClick={() => setPageUpcoming((p) => Math.max(p - 1, 1))}
                    disabled={pageUpcoming === 1}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                      pageUpcoming === 1
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-[#95D700] text-white hover:bg-green-600"
                    }`}
                  >
                    <ArrowLeft size={16} /> Prev
                  </button>

                  {/* ✅ Mobile: simplified (Prev, X of Y, Next) */}
                  <span className="block sm:hidden px-3 py-2 text-gray-700 font-medium">
                    {pageUpcoming} / {totalPagesUpcoming}
                  </span>

                  {/* ✅ Desktop: detailed pagination with ellipsis */}
                  <div className="hidden sm:flex gap-2">
                    {(() => {
                      const pages: (number | string)[] = [];
                      if (totalPagesUpcoming <= 5) {
                        for (let i = 1; i <= totalPagesUpcoming; i++)
                          pages.push(i);
                      } else {
                        pages.push(1);
                        if (pageUpcoming > 3) pages.push("...");
                        const start = Math.max(2, pageUpcoming - 1);
                        const end = Math.min(
                          totalPagesUpcoming - 1,
                          pageUpcoming + 1
                        );
                        for (let i = start; i <= end; i++) pages.push(i);
                        if (pageUpcoming < totalPagesUpcoming - 2)
                          pages.push("...");
                        pages.push(totalPagesUpcoming);
                      }

                      return pages.map((p, i) =>
                        typeof p === "string" ? (
                          <span key={i} className="px-3 py-2 text-gray-500">
                            {p}
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPageUpcoming(p)}
                            className={`px-4 py-2 rounded-lg font-medium ${
                              pageUpcoming === p
                                ? "bg-[#95D700] text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      );
                    })()}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() =>
                      setPageUpcoming((p) =>
                        Math.min(p + 1, totalPagesUpcoming)
                      )
                    }
                    disabled={pageUpcoming === totalPagesUpcoming}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                      pageUpcoming === totalPagesUpcoming
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-[#95D700] text-white hover:bg-green-600"
                    }`}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 🔹 Reusable Card Components
const BirthdayCard = ({ staff }: { staff: Staff }) => (
  <div className="flex flex-col items-center text-center border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm">
    <Image
      src={staff.photoUrl || "/default-avatar.png"}
      alt={`${staff.firstName} ${staff.lastName}`}
      width={100}
      height={100}
      className="w-34 h-34 rounded-full object-cover border-4 border-[#E9EAEB]"
    />

    <div className="mt-4">
      <span className="text-gray-900 font-semibold text-lg block">
        {staff.firstName} {staff.lastName}
      </span>

      <span className="text-gray-500 text-sm">
        {staff?.employment?.jobTitle?.length ? (
          staff.employment.jobTitle.map((title: string, i: number) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
            >
              {title}
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-sm">Not Assigned</span>
        )}
        {/* {staff.employment?.departmentalRole?.title || "Staff Member"} */}
      </span>
    </div>

    <div className="mt-3">
      <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
        {staff.employment?.department?.name || "Department"}
      </span>
    </div>

    <div className="mt-3 text-gray-600 text-sm">
      🎂{" "}
      {staff?.dateOfBirth
        ? `**** ${new Date(staff.dateOfBirth).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            timeZone: "Africa/Lagos",
          })}`
        : "N/A"}
    </div>

    <Link href={`/staff/${staff.id}`} className="w-full mt-6">
      <button className="w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-[#78B500] transition">
        View Profile
      </button>
    </Link>
  </div>
);

const BirthdayCard2 = ({ staff }: { staff: Staff }) => (
  <div className="flex flex-col items-center text-center border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm">
    <Image
      src={staff.photoUrl || "/default-avatar.png"}
      alt={`${staff.firstName} ${staff.lastName}`}
      width={100}
      height={100}
      className="w-34 h-34 rounded-full object-cover border-4 border-[#E9EAEB]"
    />

    <div className="mt-4">
      <span className="text-gray-900 font-semibold text-lg block">
        {staff.firstName} {staff.lastName}
      </span>
      <span className="text-gray-500 text-sm">
        {staff?.employment?.jobTitle?.length ? (
          staff.employment.jobTitle.map((title: string, i: number) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
            >
              {title}
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-sm">Not Assigned</span>
        )}
        {/* {staff.employment?.departmentalRole?.title || "Staff Member"} */}
      </span>
    </div>

    <div className="mt-3">
      <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
        {staff.employment?.department?.name || "Department"}
      </span>
    </div>

    <div className="mt-3 text-gray-600 text-sm">
      🎂{" "}
      {new Date(staff?.nextBirthday).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "Africa/Lagos",
      })}
    </div>

    <Link href={`/staff/${staff.id}`} className="w-full mt-6">
      <button className="w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-[#78B500] transition">
        View Profile
      </button>
    </Link>
  </div>
);

export default Birthday;
