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
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";
import Api from "@/utils/api";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/component/Loading/LoadingSpinner";
import StaffCompletionModal from "@/component/StaffCompletionModal/StaffCompletionModal";

// === Completion Data Interface ===
interface CompletionData {
  staffId: number;
  staffName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  performance: {
    level: "GREEN" | "YELLOW" | "RED" | "PINK";
    colorCode: string;
    label: "Excellent" | "Moderate" | "Needs Attention" | "Available";
  };
}

// === Staff Interface ===
// ... (keep interface as is)
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
  taskPerformance?: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    performance: {
      level: string;
      colorCode: string;
      label: string;
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


  const [showDropdown, setShowDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Multi-filter state
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [locations, setLocations] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    department: "All",
    role: "All",
    location: "All",
    completion: "All",
  });
  const [tempFilters, setTempFilters] = useState({
    department: "All",
    role: "All",
    location: "All",
    completion: "All",
  });

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedCompletionData, setSelectedCompletionData] =
    useState<CompletionData | null>(null);

  const handleShowCompletion = (person: Staff) => {
    if (person.taskPerformance) {
      setSelectedCompletionData({
        staffId: person.id,
        staffName: `${person.firstName} ${person.lastName}`,
        totalTasks: person.taskPerformance.totalTasks,
        completedTasks: person.taskPerformance.completedTasks,
        completionRate: person.taskPerformance.completionRate,
        performance: person.taskPerformance.performance as any,
      });
      setShowCompletionModal(true);
    }
  };

  // Fetch staff data (with search + pagination)
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const query = `/staff-register/all/staffs/dept?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""
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
    const fetchData = async () => {
      try {
        const [rolesRes, deptsRes] = await Promise.all([
          Api.get<DepartmentalRole[]>(`/departmental-role`),
          Api.get<{ id: number; name: string }[]>(`/departments`),
        ]);
        setRoles(rolesRes.data);
        setDepartments(deptsRes.data);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchData();
  }, []);

  // Extract unique locations from staff list
  useEffect(() => {
    if (staffList.length > 0) {
      const locs = Array.from(
        new Set(
          staffList
            .map((s) =>
              s.address?.city && s.address?.state
                ? `${s.address.city}, ${s.address.state}`
                : s.address?.city || s.address?.state || "",
            )
            .filter((l) => l !== ""),
        ),
      );
      setLocations(locs);
    }
  }, [staffList]);

  const handleApplyFilter = () => {
    setFilters(tempFilters);
    setShowDropdown(false);
  };

  // Client-side multi-criteria filter
  const filteredStaff = staffList.filter((person) => {
    const matchesDept =
      filters.department === "All" ||
      person.employment?.department?.name === filters.department;

    const matchesRole =
      filters.role === "All" ||
      person.employment?.departmentalRole?.title === filters.role;

    const matchesLocation =
      filters.location === "All" ||
      `${person.address?.city}, ${person.address?.state}`.includes(
        filters.location,
      );

    const matchesCompletion = (() => {
      if (filters.completion === "All") return true;
      const rate = person.taskPerformance?.completionRate || 0;
      if (filters.completion === "0-25%") return rate <= 25;
      if (filters.completion === "26-50%") return rate > 25 && rate <= 50;
      if (filters.completion === "51-75%") return rate > 50 && rate <= 75;
      if (filters.completion === "76-100%") return rate > 75;
      return true;
    })();

    return matchesDept && matchesRole && matchesLocation && matchesCompletion;
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
    <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-[#0d0d0d] py-24 transition-colors">
      <div className="max-w-[95%] mx-auto px-4 sm:px-8">
        {/* 🔙 Back Button */}
        <div
          className="flex items-center gap-2 text-black dark:text-white cursor-pointer hover:opacity-70"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </div>

        {/* 🏷️ Title & Toggle */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Staff Directory
          </h1>



        </div>

        {/* 📄 Subtitle */}
        <p className="mt-6 text-gray-900 dark:text-gray-300 text-base sm:text-lg">
          Browse and Connect with your colleagues across the organization
        </p>

        {/* 🔍 Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search Bar */}
          <div className="flex items-center w-full sm:w-1/3 bg-white dark:bg-[#141414] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 transition-colors relative">
            <Search className="text-gray-500 dark:text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by staff name, position, role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="ml-2 w-full outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
            />

            {/* 📱 Mobile-only buttons */}
            <div className="flex sm:hidden gap-2 ml-2">
              {/* view toggle */}
              <div className="flex items-center bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 rounded-xl p-1 gap-1 w-fit">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white shadow-sm"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  title="Grid View"
                >
                  <LayoutGrid size={22} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white shadow-sm"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  title="List View"
                >
                  <List size={22} />
                </button>
              </div>
              {/* Filter Dropdown */}
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-1 px-2 py-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141414] rounded-lg text-gray-600 dark:text-gray-300 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>Filter</span>
                <ChevronDown size={14} />
              </button>

              {showDropdown && (
                <div className="absolute top-16 left-0 right-0 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[100] p-5 space-y-4 animate-in fade-in zoom-in duration-200 min-w-[280px]">
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                    Filter by
                  </h3>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Department
                    </label>
                    <select
                      value={tempFilters.department}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                    >
                      <option value="All">All</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Role
                    </label>
                    <select
                      value={tempFilters.role}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                    >
                      <option value="All">All</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.title}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Location
                    </label>
                    <select
                      value={tempFilters.location}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                    >
                      <option value="All">All</option>
                      {locations.map((loc, i) => (
                        <option key={i} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Task Completion */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Task Completion
                    </label>
                    <select
                      value={tempFilters.completion}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          completion: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                    >
                      <option value="All">All</option>
                      <option value="0-25%">0-25%</option>
                      <option value="26-50%">26-50%</option>
                      <option value="51-75%">51-75%</option>
                      <option value="76-100%">76-100%</option>
                    </select>
                  </div>

                  <button
                    onClick={handleApplyFilter}
                    className="w-full py-3 bg-[#95D700] text-white font-bold rounded-lg hover:bg-[#78B500] transition-colors shadow-lg active:scale-[0.98] mt-2"
                  >
                    Apply Filter
                  </button>
                </div>
              )}
              {/* download card button */}
              {/* <button
                onClick={downloadAllContacts}
                className="flex cursor-pointer items-center gap-1 px-2 py-1 bg-[#95D700] text-white rounded-lg text-xs font-medium hover:bg-green-600 transition"
              >
                Download Contacts
              </button> */}

              {/* Add Staff (MOBILE) */}
              <Link href="/add_staff" style={{ cursor: "pointer" }}>
                <button className="flex cursor-pointer items-center gap-1 px-2 py-1 bg-[#95D700] text-white rounded-lg text-xs font-medium hover:bg-green-600 transition">
                  <Plus size={14} /> Add New Staff
                </button>
              </Link>
            </div>
          </div>

          {/* 💻 Desktop-only Filter + Add Staff */}
          <div className="hidden sm:flex items-center gap-3 relative">
            <div className="flex items-center bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 rounded-xl p-1 gap-1 w-fit">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
                  ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white shadow-sm"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                title="Grid View"
              >
                <LayoutGrid size={22} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                  ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white shadow-sm"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                title="List View"
              >
                <List size={22} />
              </button>
            </div>
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#141414] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
              >
                <span>Filter by</span>
                <ChevronDown size={18} />
              </button>

              {showDropdown && (
                <div className="absolute top-12 right-0 bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-[280px] z-[100] p-5 space-y-4 animate-in fade-in zoom-in duration-200">
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                    Filter by
                  </h3>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Department
                    </label>
                    <select
                      value={tempFilters.department}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                    >
                      <option value="All">All</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Role
                    </label>
                    <select
                      value={tempFilters.role}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                    >
                      <option value="All">All</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.title}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Location
                    </label>
                    <select
                      value={tempFilters.location}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                    >
                      <option value="All">All</option>
                      {locations.map((loc, i) => (
                        <option key={i} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Task Completion */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Task Completion percentage
                    </label>
                    <select
                      value={tempFilters.completion}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          completion: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#95D700] outline-none transition-all"
                    >
                      <option value="All">All</option>
                      <option value="0-25%">0-25%</option>
                      <option value="26-50%">26-50%</option>
                      <option value="51-75%">51-75%</option>
                      <option value="76-100%">76-100%</option>
                    </select>
                  </div>

                  <button
                    onClick={handleApplyFilter}
                    className="w-full py-3 bg-[#95D700] text-white font-bold rounded-lg hover:bg-[#78B500] transition-colors shadow-lg active:scale-[0.98] mt-2"
                  >
                    Apply Filter
                  </button>
                </div>
              )}
            </div>
            {/* download card button */}
            {/* <button
              onClick={downloadAllContacts}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition"
            >
              Download Contacts
            </button> */}

            {/* Add Staff */}
            <Link href="/add_staff" style={{ cursor: "pointer" }}>
              <button className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-[#95D700] text-white rounded-lg font-medium hover:bg-green-600 transition">
                Add New Staff <Plus size={18} />
              </button>
            </Link>
          </div>
        </div>

        {/* 👥 People View */}
        <div className="mt-8 w-full">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredStaff?.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStaff.map((person) => (
                  <div
                    key={person.id}
                    className="flex flex-col justify-between border border-[#E5E7EB] dark:border-gray-800 bg-white dark:bg-[#141414] rounded-2xl p-6 shadow-sm transition-colors"
                  >
                    {/* Profile Picture + Name + Role */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <Image
                          src={person?.photoUrl || "/default-avatar.png"}
                          alt={`${person?.firstName} ${person?.lastName}`}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-full object-cover border"
                        />
                        {/* Completion Indicator */}
                        {person.taskPerformance && (
                          <div
                            className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-125 transition-transform duration-200"
                            style={{
                              backgroundColor:
                                person.taskPerformance.performance.colorCode,
                            }}
                            onClick={() => handleShowCompletion(person)}
                            title="Click to view workload status"
                            role="button"
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white font-semibold">
                          {person?.firstName} {person?.lastName}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {person?.employment?.jobTitle?.length ? (
                            person.employment.jobTitle.map(
                              (title: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs"
                                >
                                  {title}
                                </span>
                              ),
                            )
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              Not Assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="mt-4">
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] dark:bg-gray-800 text-[#496C08] dark:text-[#95D700]">
                        {person?.employment?.department?.name ||
                          "No Department"}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 mt-4 text-gray-600 dark:text-gray-400 text-sm">
                      <Mail size={16} />
                      <span>{person?.email}</span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400 text-sm">
                      <Phone size={16} />
                      <span>{person?.phone}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400 text-sm">
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
                ))}
              </div>
            ) : (
              /* --- Detailed Column (List) View --- */
              <div className="flex flex-col gap-6">
                {filteredStaff.map((person) => (
                  <div
                    key={person.id}
                    className="bg-white dark:bg-[#141414] border border-[#F1F1F1] dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow"
                  >
                    {/* Top Row: Avatar, Info, Link */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 flex-shrink-0">
                          <Image
                            src={person?.photoUrl || "/default-avatar.png"}
                            alt={`${person?.firstName} ${person?.lastName}`}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-full object-cover shadow-sm border"
                          />
                          {/* Completion Indicator */}
                          {person.taskPerformance && (
                            <div
                              className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-125 transition-transform duration-200"
                              style={{
                                backgroundColor:
                                  person.taskPerformance.performance.colorCode,
                              }}
                              onClick={() => handleShowCompletion(person)}
                              title="Click to view workload status"
                              role="button"
                            />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-gray-900 dark:text-white font-bold text-lg">
                            {person?.firstName} {person?.lastName}
                          </h3>
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {person?.employment?.jobTitle?.join(", ") ||
                              "Not Assigned"}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/staff/${person.uuid}`}
                        className="text-[#95D700] font-bold text-sm hover:underline"
                      >
                        View Profile
                      </Link>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-800" />

                    {/* Bottom Row: 4 Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-900 dark:text-gray-200 font-bold text-sm">
                          Department
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {person?.employment?.department?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-900 dark:text-gray-200 font-bold text-sm">
                          Email
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm break-all">
                          {person?.email}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-900 dark:text-gray-200 font-bold text-sm">
                          Phone
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {person?.phone}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-900 dark:text-gray-200 font-bold text-sm">
                          Location
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {person.address?.city}, {person.address?.state}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-12">No staff found.</p>
          )}
        </div>

        {/* 📄 Pagination (Anniversary style) */}
        <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
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
                  className={`px-3 py-2 rounded-lg text-sm sm:text-base font-medium ${page === p
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
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm sm:text-base ${page === totalPages
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-[#95D700] text-white"
              }`}
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <StaffCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        data={selectedCompletionData}
      />
    </div>
  );
}
