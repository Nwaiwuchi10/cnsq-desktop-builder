"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
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

// === Staff Interface ===
interface Staff {
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
}

// === API Response Type ===
interface StaffResponse {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function StaffDirectory() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch staff data
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const res = await Api.get<StaffResponse>(
          `/staff-register/all/staffs/dept?page=${page}&limit=${limit}`
        );
        setStaffList(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [page, limit]);

  // Filter staff by search input
  const filteredStaff = staffList.filter((person) =>
    `${person.firstName} ${person.lastName} ${person.employment?.jobTitle} ${person.employment?.department?.name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] py-24">
      <div className="max-w-[95%] mx-auto px-4 sm:px-8">
        {/* 🔙 Back Button */}
        <div className="flex items-center gap-2 text-black cursor-pointer hover:opacity-70">
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </div>

        {/* 🏷️ Title */}
        <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
          Staff Directory
        </h1>

        {/* 📄 Subtitle */}
        <p className="mt-6 text-gray-900 text-base sm:text-lg">
          Browse and Connect with your colleagues across the organization
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
          </div>

          {/* Right Side (DESKTOP only) */}
          <div className="hidden sm:flex items-center gap-3">
            <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">
              <Filter size={16} />
              Filter by
            </button>
            <Link href="/add-staff" style={{ cursor: "pointer" }}>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition">
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
            filteredStaff.map((person) => (
              <div
                key={person.id}
                className="flex flex-col justify-between border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm"
              >
                {/* Profile Picture + Name + Role */}
                <div className="flex items-center gap-4">
                  <Image
                    src={person.photoUrl || "/default-avatar.png"}
                    alt={`${person.firstName} ${person.lastName}`}
                    width={50}
                    height={50}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold">
                      {person.firstName} {person.lastName}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {person?.employment?.jobTitle || "Not Assigned"}
                    </span>
                  </div>
                </div>

                {/* Department */}
                <div className="mt-4">
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
                    {person?.employment?.department?.name || "No Department"}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
                  <Mail size={16} />
                  <span>{person?.email}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                  <Phone size={16} />
                  <span>{person?.phone}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                  <MapPin size={16} />
                  <span>
                    {person.address?.city}, {person.address?.state}
                  </span>
                </div>

                {/* View Profile */}
                <Link href={`/staff/${person.id}`} className="w-full">
                  <button className="mt-6 w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-green-500 transition">
                    View Profile
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No staff found.</p>
          )}
        </div>

        {/* 📄 Pagination */}
        <div className="flex justify-center items-center gap-2 mt-34">
          {/* Previous Button */}
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
              page === 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#95D700] text-white"
            }`}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          {/* Page Numbers */}
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                style={{ cursor: "pointer" }}
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  page === pageNum
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
            style={{ cursor: "pointer" }}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
              page === totalPages
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#95D700] text-white"
            }`}
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
