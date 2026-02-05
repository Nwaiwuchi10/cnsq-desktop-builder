"use client";

import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import Api from "@/utils/api";
import Link from "next/link";

// TS interface matching StaffAnniversaryDto
interface StaffAnniversary {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | StaticImageData | null;
  nextAnniversary: string;
  yearsCompleted: number;
}

export default function LatestAnniversary() {
  const [anniversaries, setAnniversaries] = useState<StaffAnniversary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnniversaries = async () => {
      try {
        // ✅ backend returns { data, total, page, limit }
        const res = await Api.get("/staff-register/anniversaries/all/upcoming");
        setAnniversaries(res.data.data.slice(0, 4)); // ✅ limit to 4
      } catch (error) {
        console.error("Error fetching anniversaries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnniversaries();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-600">Loading upcoming anniversaries...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] pb-24 min-h-[60vh] flex flex-col items-center px-4 sm:px-6 md:px-12 lg:px-20 pt-12">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-7xl">
        Latest Anniversary
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
        {anniversaries.map((person) => (
          <>
            <Link href={`/staff/${person?.uuid}`}>
              <div
                key={person.id}
                className="flex flex-col items-start text-left w-full"
              >
                {/* Image */}
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
                    alt={`${person.firstName} ${person.lastName}`}
                    width={280}
                    height={280}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>

                {/* Name */}
                <p className="mt-3 text-gray-900 font-semibold text-lg">
                  {person.firstName} {person.lastName}
                </p>

                {/* Anniversary Date with Lagos timezone */}
                <span className="text-gray-500 text-sm">
                  {new Date(person.nextAnniversary).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "Africa/Lagos",
                    },
                  )}
                </span>

                {/* Years Completed (optional, keep commented) */}
                {/* <span className="text-gray-600 text-xs">
              {person.yearsCompleted} years completed
            </span> */}
              </div>
            </Link>
          </>
        ))}
      </div>
    </div>
  );
}
