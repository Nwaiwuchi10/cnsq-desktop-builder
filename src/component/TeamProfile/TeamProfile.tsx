"use client";

import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Mail, Phone, MapPin } from "lucide-react"; // icons
import Link from "next/link";
import Api from "@/utils/api";
interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string | StaticImageData | null;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  employment?: {
    departmentalRole?: {
      title?: string;
    };
    department?: {
      name?: string;
    };
  };
}

export default function TeamProfiles() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
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
    <div className="bg-[#FAFAFA] min-h-[80vh] flex flex-col items-center px-6 sm:px-10 md:px-16 pt-12">
      {/* Heading */}
      <div className="flex items-center justify-between w-full max-w-6xl mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-black">
          Heads of Departments
        </h1>

        <Link href="/heads-of-departments">
          <button
            style={{ cursor: "pointer" }}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            View All
          </button>
        </Link>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {staffList?.map((staff) => (
          <div
            key={staff.id}
            className="flex flex-col justify-between border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm"
          >
            {/* Profile Picture + Name + Role */}
            <div className="flex items-center gap-4">
              <Image
                src={staff.photoUrl || "/default-avatar.png"}
                alt={`${staff.firstName} ${staff.lastName}`}
                width={50}
                height={50}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-gray-900 font-semibold">
                  {staff.firstName} {staff.lastName}
                </span>
                <span className="text-gray-500 text-sm">
                  {staff.employment?.departmentalRole?.title || "Staff Member"}
                </span>
              </div>
            </div>

            {/* Department Badge */}
            <div className="mt-4">
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
                {staff.employment?.department?.name || "Department"}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
              <Mail size={16} />
              <span>{staff.email}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
              <Phone size={16} />
              <span>{staff.phone}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
              <MapPin size={16} />
              <span>
                {staff.address?.city}, {staff.address?.state},{" "}
                {staff.address?.country}
              </span>
            </div>

            {/* View Profile Button */}
            <Link href={`/staff/${staff.id}`} className="w-full">
              <button
                style={{ cursor: "pointer" }}
                className="mt-6 w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-green-500 transition"
              >
                View Profile
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
