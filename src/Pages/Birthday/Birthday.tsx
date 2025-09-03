"use client";
import Api from "@/utils/api";
import { ChevronDown, Mail, MapPin, Phone, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Birthday = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await Api.get("/staff-register"); // 🔹 replace with your API endpoint
        // Limit to 3 staff members
        setStaffList(res.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading staff...</div>;
  }
  return (
    <div>
      <div className="bg-[#FF990C] text-white h-[50vh] flex items-center justify-center  w-full mt-16 ">
        <h1 className="text-3xl sm:text-5xl font-bold">Birthdays</h1>
      </div>
      <div className="min-h-screen w-full bg-[#FAFAFA]  ">
        <div className="max-w-[95%] mx-auto px-4 sm:px-8">
          <h1 className="pt-12 text-2xl sm:text-3xl font-bold text-gray-900">
            Birthdays
          </h1>

          {/* 📄 Subtitle */}
          <p className="mt-8 text-gray-600 text-base sm:text-lg">
            Browse and connect with your colleagues across the organization
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex items-center w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Search className="text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search"
                className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />

              {/* Filter + Add Staff (MOBILE only) */}
              <div className="flex sm:hidden gap-2 ml-2">
                <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-100">
                  Sort By <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Right Side (DESKTOP only) */}
            <div className="hidden sm:flex items-center gap-3">
              <button className="flex bg-white items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">
                Sort by
                <ChevronDown size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
          <h1 className="pt-12 text-2xl sm:text-3xl font-bold text-gray-900">
            🎉 Today's Birthday
          </h1>

          {/* cards section */}

          <div className="grid grid-cols-1 gap-16 pt-12 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
            {staffList.map((staff: any) => (
              <div
                key={staff.id}
                className="flex flex-col items-center text-center border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm"
              >
                {/* Profile Picture */}
                <Image
                  src={staff.photoUrl || "/default-avatar.png"}
                  alt={`${staff.firstName} ${staff.lastName}`}
                  width={100} // increased size
                  height={100}
                  className="w-34 h-34 rounded-full object-cover border-4 border-[#E9EAEB]"
                />

                {/* Name + Role */}
                <div className="mt-4">
                  <span className="text-gray-900 font-semibold text-lg block">
                    {staff.firstName} {staff.lastName}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {staff.employment?.departmentalRole?.title ||
                      "Staff Member"}
                  </span>
                </div>

                {/* Department Badge */}
                <div className="mt-3">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
                    {staff.employment?.department?.name || "Department"}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                  <span>Today - 20/Aug</span>
                </div>

                {/* Location */}

                {/* View Profile Button */}
                <Link href={`/staff/${staff.id}`} className="w-full mt-6">
                  <button
                    style={{ cursor: "pointer" }}
                    className="w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-green-500 transition"
                  >
                    Send Message
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <h1 className="pt-12 text-2xl sm:text-3xl font-bold text-gray-900">
            🎉 Upcoming Birthdays
          </h1>
          <div className="grid grid-cols-1 pb-24 gap-16 pt-12 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
            {staffList.map((staff: any) => (
              <div
                key={staff.id}
                className="flex flex-col items-center text-center border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm"
              >
                {/* Profile Picture */}
                <Image
                  src={staff.photoUrl || "/default-avatar.png"}
                  alt={`${staff.firstName} ${staff.lastName}`}
                  width={100} // increased size
                  height={100}
                  className="w-34 h-34 rounded-full object-cover border-4 border-[#E9EAEB]"
                />

                {/* Name + Role */}
                <div className="mt-4">
                  <span className="text-gray-900 font-semibold text-lg block">
                    {staff.firstName} {staff.lastName}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {staff.employment?.departmentalRole?.title ||
                      "Staff Member"}
                  </span>
                </div>

                {/* Department Badge */}
                <div className="mt-3">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
                    {staff.employment?.department?.name || "Department"}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                  <span>Today - 20/Aug</span>
                </div>

                {/* Location */}

                {/* View Profile Button */}
                <Link href={`/staff/${staff.id}`} className="w-full mt-6">
                  <button
                    style={{ cursor: "pointer" }}
                    className="w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-green-500 transition"
                  >
                    Send Message
                  </button>
                </Link>
              </div>
            ))}
          </div>

          {/* card section */}
        </div>
        {/* card section */}

        {/* anniversary card section */}
      </div>
    </div>
  );
};

export default Birthday;
