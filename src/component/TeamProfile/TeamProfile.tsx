"use client";

import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import Api from "@/utils/api";

interface HeadOfDepartment {
  id: number;
  name: string;
  staff: {
    id: number;
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
      departmentalRole?: { title?: string };
      department?: { name?: string };
    };
  };
  department?: { name?: string };
}

export default function TeamProfiles() {
  const [hodList, setHodList] = useState<HeadOfDepartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHod = async () => {
      try {
        const res = await Api.get("/headofdepartment"); // ✅ correct API endpoint
        setHodList(res.data.slice(0, 3)); // limit to 3 for homepage
      } catch (error) {
        console.error("Error fetching heads of departments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHod();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">Loading heads of departments...</div>
    );
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
        {hodList?.map((hod) => (
          <div
            key={hod.id}
            className="flex flex-col justify-between border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm"
          >
            {/* Profile Picture + Name + Role */}
            <div className="flex items-center gap-4">
              <Image
                src={hod.staff.photoUrl || "/default-avatar.png"}
                alt={`${hod.staff.firstName} ${hod.staff.lastName}`}
                width={50}
                height={50}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-gray-900 font-semibold">
                  {hod.staff.firstName} {hod.staff.lastName}
                </span>
                <span className="text-gray-500 text-sm">
                  {hod.name || "Head of Department"}
                </span>
              </div>
            </div>

            {/* Department Badge */}
            <div className="mt-4">
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
                {hod.department?.name ||
                  hod.staff.employment?.department?.name ||
                  "Department"}
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
                {hod.staff.address?.city}, {hod.staff.address?.state},{" "}
                {hod.staff.address?.country}
              </span>
            </div>

            {/* View Profile Button */}
            <Link href={`/staff/${hod.staff.id}`} className="w-full">
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
