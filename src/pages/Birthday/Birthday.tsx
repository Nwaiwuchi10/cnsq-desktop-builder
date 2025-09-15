"use client";
import Api from "@/utils/api";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// Define Staff type
interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  dateOfBirth?: string;
  nextBirthday: string;
  employment?: {
    departmentalRole?: {
      title?: string;
    };
    department?: {
      name?: string;
    };
  };
}

const Birthday = () => {
  const [todaysBirthdays, setTodaysBirthdays] = useState<Staff[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Staff[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // 🔹 search state

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

  // ✅ Fetch upcoming birthdays
  useEffect(() => {
    const fetchUpcomingBirthdays = async () => {
      try {
        const res = await Api.get<Staff[]>(
          "/staff-register/birthdays/all/upcoming"
        );
        setUpcomingBirthdays(res.data.slice(0, 4)); // limit to 4
      } catch (error) {
        console.error("Error fetching upcoming birthdays:", error);
      } finally {
        setLoadingUpcoming(false);
      }
    };

    fetchUpcomingBirthdays();
  }, []);

  // 🔹 Filter both lists by search term
  const filteredTodays = todaysBirthdays.filter((staff) =>
    `${staff.firstName} ${staff.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredUpcoming = upcomingBirthdays.filter((staff) =>
    `${staff.firstName} ${staff.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
              onChange={(e) => setSearchTerm(e.target.value)} // update search state
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
            <div className="grid grid-cols-1 pb-24 gap-16 pt-12 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
              {filteredUpcoming.map((staff) => (
                <BirthdayCard key={staff.id} staff={staff} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 🔹 Reusable Birthday Card Component
// 🔹 Reusable Birthday Card Component
const BirthdayCard = ({ staff }: { staff: Staff }) => {
  // format DOB nicely (e.g., September 11, 2025) using Nigeria timezone

  return (
    <div className="flex flex-col items-center text-center border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm">
      {/* Profile Picture */}
      <Image
        src={staff.photoUrl || "/default-avatar.png"}
        alt={`${staff.firstName} ${staff.lastName}`}
        width={100}
        height={100}
        className="w-34 h-34 rounded-full object-cover border-4 border-[#E9EAEB]"
      />

      {/* Name + Role */}
      <div className="mt-4">
        <span className="text-gray-900 font-semibold text-lg block">
          {staff.firstName} {staff.lastName}
        </span>
        <span className="text-gray-500 text-sm">
          {staff.employment?.departmentalRole?.title || "Staff Member"}
        </span>
      </div>

      {/* Department Badge */}
      <div className="mt-3">
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
          {staff.employment?.department?.name || "Department"}
        </span>
      </div>

      {/* 🔹 Date of Birth */}
      <div className="mt-3 text-gray-600 text-sm">
        🎂
        {new Date(staff?.nextBirthday).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "Africa/Lagos",
        })}
      </div>

      {/* Action Button */}
      <Link href={`/staff/${staff.id}`} className="w-full mt-6">
        <button className="w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-green-500 transition">
          Send Message
        </button>
      </Link>
    </div>
  );
};

export default Birthday;
