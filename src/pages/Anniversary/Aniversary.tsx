"use client";

import { Search } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import React, { useEffect, useState } from "react";
import Api from "@/utils/api"; // ✅ your Axios instance

interface StaffAnniversary {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | StaticImageData | null;
  nextAnniversary: string;
  yearsCompleted: number;
}
const Aniversary = () => {
  const [monthAnniversaries, setMonthAnniversaries] = useState<
    StaffAnniversary[]
  >([]);
  const [recentAnniversaries, setRecentAnniversaries] = useState<
    StaffAnniversary[]
  >([]);
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch This Month's Anniversaries
  useEffect(() => {
    const fetchMonthAnniversaries = async () => {
      try {
        const res = await Api.get<StaffAnniversary[]>(
          "/staff-register/anniversaries/month"
        );
        setMonthAnniversaries(res.data);
      } catch (error) {
        console.error("Error fetching this month anniversaries:", error);
      } finally {
        setLoadingMonth(false);
      }
    };
    fetchMonthAnniversaries();
  }, []);

  // ✅ Fetch Upcoming (Recent) Anniversaries
  useEffect(() => {
    const fetchRecentAnniversaries = async () => {
      try {
        const res = await Api.get<StaffAnniversary[]>(
          "/staff-register/anniversaries/all/upcoming"
        );
        setRecentAnniversaries(res.data.slice(0, 4)); // only 4
      } catch (error) {
        console.error("Error fetching recent anniversaries:", error);
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecentAnniversaries();
  }, []);

  // ✅ Search filter
  const filterBySearch = (list: StaffAnniversary[]) =>
    list.filter((staff) =>
      `${staff.firstName} ${staff.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

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
          <div className="mt-12">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-6xl">
              This Month
            </h1>

            {loadingMonth ? (
              <p>Loading this month&apos;s anniversaries...</p>
            ) : filterBySearch(monthAnniversaries).length === 0 ? (
              <p className="text-gray-500">No anniversaries this month 🎉</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
                {filterBySearch(monthAnniversaries).map((staff) => (
                  <AnniversaryCard key={staff.id} staff={staff} />
                ))}
              </div>
            )}
          </div>

          {/* =================== RECENT ANNIVERSARIES =================== */}
          <div className="mt-16 pb-16">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-6xl">
              Recent Anniversary
            </h1>

            {loadingRecent ? (
              <p>Loading recent anniversaries...</p>
            ) : filterBySearch(recentAnniversaries).length === 0 ? (
              <p className="text-gray-500">No recent anniversaries 🎉</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
                {filterBySearch(recentAnniversaries).map((staff) => (
                  <AnniversaryCard key={staff.id} staff={staff} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Reusable Card
const AnniversaryCard = ({ staff }: { staff: StaffAnniversary }) => {
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

      <span className="text-gray-500 text-sm">
        {new Date(staff.nextAnniversary).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    </div>
  );
};

export default Aniversary;
