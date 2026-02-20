"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  ChevronDown,
  Plus,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import Api from "@/utils/api";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/component/Loading/LoadingSpinner";

// === Staff Interface ===
interface Staff {
  id: number;
  uuid: string;
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
    jobTitle: string[];
    department?: {
      name: string;
    };
    departmentalRole?: {
      title: string;
    };
  };
}

// === Departmental Role Interface ===
interface DepartmentalRole {
  id: number;
  title: string;
  department: {
    name: string;
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
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<DepartmentalRole[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch staff data (with search + pagination)
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const query = `/staff-register/all/staffs/dept?page=${page}&limit=${limit}${
          search ? `&search=${encodeURIComponent(search)}` : ""
        }`;
        const res = await Api.get<StaffResponse>(query);
        setStaffList(res?.data?.data);
        setTotalPages(res?.data?.totalPages);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [page, limit, search]);

  // Fetch departmental roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await Api.get<DepartmentalRole[]>(`/departmental-role`);
        setRoles(res.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // Client-side role filter
  const filteredStaff = staffList.filter((person) => {
    const matchesRole = selectedRole
      ? person.employment?.departmentalRole?.title === selectedRole
      : true;
    return matchesRole;
  });

  const generateVCard = (person: Staff) => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${person.firstName} ${person.lastName}
EMAIL:${person?.email}
TEL:${person?.phone}
ORG:${person.employment?.department?.name || ""}
TITLE:${person.employment?.jobTitle?.join(", ") || ""}
ADR:;;${person.address?.city || ""};${person.address?.state || ""};;${person.address?.country || ""}
END:VCARD`;
  };
  const downloadAllContacts = () => {
    const vCards = filteredStaff
      .map((person) => generateVCard(person))
      .join("\n");

    const blob = new Blob([vCards], { type: "text/vcard;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `staff-directory.vcf`;
    link.click();
  };

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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
            />

            {/* 📱 Mobile-only buttons */}
            <div className="flex sm:hidden gap-2 ml-2">
              {/* Filter Dropdown */}
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-lg text-gray-600 text-xs hover:bg-gray-100"
              >
                <span>{selectedRole || "Filter"}</span>
                <ChevronDown size={14} />
              </button>

              {showDropdown && (
                <div className="absolute top-16 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <ul className="max-h-60 overflow-y-auto text-gray-600">
                    <li
                      onClick={() => {
                        setSelectedRole("");
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      All Roles
                    </li>
                    {roles.map((role) => (
                      <li
                        key={role.id}
                        onClick={() => {
                          setSelectedRole(role.title);
                          setShowDropdown(false);
                        }}
                        className="px-4 text-gray-600 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {role.title} ({role.department?.name})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* download card button */}
              <button
                onClick={downloadAllContacts}
                className="flex cursor-pointer items-center gap-1 px-2 py-1 bg-[#95D700] text-white rounded-lg text-xs font-medium hover:bg-green-600 transition"
              >
                Download Contacts
              </button>

              {/* Add Staff (MOBILE) */}
              <Link href="/add-staff" style={{ cursor: "pointer" }}>
                <button className="flex cursor-pointer items-center gap-1 px-2 py-1 bg-[#95D700] text-white rounded-lg text-xs font-medium hover:bg-green-600 transition">
                  <Plus size={14} /> Add New Staff
                </button>
              </Link>
            </div>
          </div>

          {/* 💻 Desktop-only Filter + Add Staff */}
          <div className="hidden sm:flex items-center gap-3 relative">
            {/* Filter Dropdown */}
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <span>{selectedRole || "Filter by Dept Unit"}</span>
              <ChevronDown size={16} />
            </button>

            {showDropdown && (
              <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg w-56 z-10">
                <ul className="max-h-60 overflow-y-auto">
                  <li
                    onClick={() => {
                      setSelectedRole("");
                      setShowDropdown(false);
                    }}
                    className="px-4 text-gray-600 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    All Roles
                  </li>
                  {roles.map((role) => (
                    <li
                      key={role.id}
                      onClick={() => {
                        setSelectedRole(role.title);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      {role.title} ({role.department?.name})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* download card button */}
            <button
              onClick={downloadAllContacts}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition"
            >
              Download Contacts
            </button>

            {/* Add Staff */}
            <Link href="/add-staff" style={{ cursor: "pointer" }}>
              <button className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition">
                Add New Staff <Plus size={18} />
              </button>
            </Link>
          </div>
        </div>

        {/* 👥 People Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {loading ? (
            <p className="text-gray-600">
              <LoadingSpinner />
            </p>
          ) : filteredStaff?.length > 0 ? (
            filteredStaff?.map((person) => (
              <div
                key={person.id}
                className="flex flex-col justify-between border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm"
              >
                {/* Profile Picture + Name + Role */}
                <div className="flex items-center gap-4">
                  <Image
                    src={person?.photoUrl || "/default-avatar.png"}
                    alt={`${person?.firstName} ${person?.lastName}`}
                    width={50}
                    height={50}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold">
                      {person?.firstName} {person?.lastName}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {person?.employment?.jobTitle?.length ? (
                        person.employment.jobTitle.map(
                          (title: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                            >
                              {title}
                            </span>
                          ),
                        )
                      ) : (
                        <span className="text-gray-500 text-sm">
                          Not Assigned
                        </span>
                      )}
                    </div>
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
                <Link href={`/staff/${person.uuid}`} className="w-full">
                  <button className="mt-6 w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-[#78B500] transition">
                    View Profile
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No staff found.</p>
          )}
        </div>

        {/* 📄 Pagination (Anniversary style) */}
        <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
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

          {/* Page Numbers with ellipsis */}
          {(() => {
            const pages: (number | string)[] = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              if (page <= 3) {
                pages.push(1, 2, 3, "...", totalPages);
              } else if (page >= totalPages - 2) {
                pages.push(
                  1,
                  "...",
                  totalPages - 2,
                  totalPages - 1,
                  totalPages,
                );
              } else {
                pages.push(
                  1,
                  "...",
                  page - 1,
                  page,
                  page + 1,
                  "...",
                  totalPages,
                );
              }
            }
            return pages.map((p, idx) =>
              typeof p === "string" ? (
                <span key={idx} className="px-3 py-2 text-gray-500">
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
            );
          })()}

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
      </div>
    </div>
  );
}
