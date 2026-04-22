"use client";

import { useState, useEffect } from "react";

import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";

import Api from "@/utils/api";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";

// 🔹 Interface for HeadOfDepartment API response
interface HeadOfDepartment {
  id: number;
  name: string;
  staff: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photoUrl: string | StaticImageData | null;
    address?: {
      city: string;
      state: string;
      country: string;
    };
    employment?: {
      jobTitle: string;
      department?: {
        name: string;
      };
      departmentalRole?: {
        title: string;
      };
    };
  };
  department: {
    id: number;
    name: string;
  };
}

export default function HeadsStaffDirectory() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<HeadOfDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch heads of departments
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await Api.get("/headofdepartment"); // 🔹 updated endpoint
        setStaffList(res.data);
      } catch (error) {
        console.error("Error fetching HODs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Filter staff by search input
  const filteredStaff = staffList.filter((hod) =>
    `${hod.staff.firstName} ${hod.staff.lastName} ${hod.staff.employment?.jobTitle} ${hod.department?.name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] py-24">
      <div className="max-w-[95%] mx-auto px-4 sm:px-8">
        {/* 🔙 Back Button */}
        <div
          className="flex items-center gap-2 text-black cursor-pointer hover:opacity-70"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </div>

        {/* 🏷️ Title */}
        <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
          Heads of Departments
        </h1>

        {/* 📄 Subtitle */}
        <p className="mt-6 text-gray-900 text-base sm:text-lg">
          Browse and connect with your colleagues across the organization
        </p>

        {/* 🔍 Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search Bar */}
          <div className="flex items-center w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <Search className="text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by staff name, position, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
            />

            {/* Filter + Add Staff (MOBILE only) */}
            <div className="flex sm:hidden gap-2 ml-2">
              <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-100">
                Filter <Filter size={16} />
              </button>
              <Link href="/add-dept-head" style={{ cursor: "pointer" }}>
                <button
                  style={{ cursor: "pointer" }}
                  className="flex items-center gap-2 px-3 py-1 bg-[#95D700] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                >
                  Add Staff <Plus size={16} />
                </button>
              </Link>
            </div>
          </div>

          {/* Right Side (DESKTOP only) */}
          <div className="hidden sm:flex items-center gap-3">
            <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">
              <Filter size={16} />
              Filter by
            </button>
            <Link href="/add-dept-head" style={{ cursor: "pointer" }}>
              <button
                style={{ cursor: "pointer" }}
                className="flex items-center gap-2 px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition"
              >
                Add New Staff <Plus size={18} />
              </button>
            </Link>
          </div>
        </div>

        {/* 👥 People Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {loading ? (
            <p className="text-gray-600">Loading staff...</p>
          ) : filteredStaff.length > 0 ? (
            filteredStaff.map((hod) => (
              <div
                key={hod.id}
                className="flex flex-col justify-between border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm"
              >
                {/* Profile Picture + Name + Role */}
                <div className="flex items-center gap-4">
                  <Image
                    src={hod?.staff?.photoUrl || "/default-avatar.png"}
                    alt={`${hod.staff.firstName} ${hod.staff.lastName}`}
                    width={50}
                    height={50}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold">
                      {hod.staff.firstName} {hod.staff.lastName}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {hod.name || "Not Assigned"}
                    </span>
                  </div>
                </div>

                {/* Department */}
                <div className="mt-4">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
                    {hod.department?.name || "No Department"}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
                  <Mail size={16} />
                  <span>{hod.staff.email}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                  <Phone size={16} />
                  <span>{hod.staff.phone}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  <span>
                    {hod.staff.address?.city}, {hod.staff.address?.state}
                  </span>
                </div>

                {/* View Profile */}
                <Link href={`/staff/${hod.staff.id}`} className="w-full">
                  <button
                    style={{ cursor: "pointer" }}
                    className="mt-6 w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-[#78B500] transition"
                  >
                    View Profile
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No heads of department found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
