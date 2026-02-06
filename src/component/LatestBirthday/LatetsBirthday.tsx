"use client";

import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Api from "@/utils/api";
import Link from "next/link";

// Define TS interface matching StaffBirthdayDto
interface StaffBirthday {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nextBirthday: string; // from backend
  photoUrl?: string | StaticImageData | null; // optional
}

export default function LatestBirthday() {
  const [birthdays, setBirthdays] = useState<StaffBirthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        // ✅ backend returns { data, total, page, limit }
        const res = await Api.get("/staff-register/birthdays/all/upcoming");
        setBirthdays(res?.data?.data.slice(0, 4)); // ✅ only 4 records
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-600">Loading upcoming birthdays...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-[60vh] flex flex-col items-center px-4 sm:px-6 md:px-12 lg:px-20 pt-12">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-7xl">
        Latest Birthdays
      </h1>

      {/* Responsive Grid */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-8
          w-full max-w-7xl
        "
      >
        {birthdays.map((person) => (
          <>
            <div
              key={person.id}
              className="flex flex-col items-start text-left w-full"
            >
              <Link href={`/staff/${person?.uuid}`}>
                {/* Image Container with fallback if no photo */}
                <div
                  className="
                relative
                w-[315px]
                h-[315px]
                sm:w-[420px] sm:h-[250px]
                md:w-[380px] md:h-[260px]
                lg:w-[280px] lg:h-[280px]
                rounded-lg
                overflow-hidden
                shadow-sm
                bg-gray-200
              "
                >
                  <Image
                    src={person?.photoUrl || "/default-avatar.png"}
                    alt={`${person?.firstName} ${person?.lastName}`}
                    width={280}
                    height={280}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>

                {/* Name */}
                <p className="mt-3 text-gray-900 font-semibold text-lg">
                  {person?.firstName} {person?.lastName}
                </p>

                {/* Next Birthday (with Lagos timezone) */}
                <span className="text-gray-500 text-sm">
                  {new Date(person.nextBirthday).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "Africa/Lagos",
                  })}
                </span>
              </Link>
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
