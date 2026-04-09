"use client";

import React, { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";
import Link from "next/link";
import Api from "@/utils/api";

type Staff = {
  id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  employment?: {
    department?: { name: string };
  };
};

export default function TodayCelebrations() {
  const [celebrations, setCelebrations] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpcoming, setIsUpcoming] = useState(false);

  useEffect(() => {
    const fetchCelebrations = async () => {
      try {
        // Fallback strategy: fetch today first, if empty, fetch upcoming
        let res = await Api.get("/staff-register/birthdays/today");
        if (res.data && res.data.length > 0) {
          setCelebrations(res.data.slice(0, 4));
          setIsUpcoming(false);
        } else {
          // fetch upcoming
          let upcomingRes = await Api.get(
            "/staff-register/birthdays/all/upcoming?page=1&limit=4",
          );
          setCelebrations(upcomingRes?.data?.data || []);
          setIsUpcoming(true);
        }
      } catch (error) {
        console.error("Error fetching celebrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCelebrations();
  }, []);

  return (
    <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 transition-colors w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 mb-6">
        <div className="flex items-center gap-2">
          <PartyPopper className="w-5 h-5 text-[#86CD23] flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
            {isUpcoming ? "Upcoming Celebrations" : "Today's Celebrations"}
          </h3>
        </div>
        <Link
          href="/birthday"
          className="text-xs sm:text-sm font-medium text-[#86CD23] hover:underline whitespace-nowrap"
        >
          All &rarr;
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 text-xs sm:text-sm">
          Loading celebrations...
        </p>
      ) : celebrations.length === 0 ? (
        <p className="text-gray-500 text-xs sm:text-sm">
          No celebrations coming up.
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {celebrations.map((staff, idx) => {
            const initials =
              `${staff.firstName?.charAt(0) || ""}${staff.lastName?.charAt(0) || ""}`.toUpperCase();
            const fullName = `${staff.firstName} ${staff.lastName}`;
            const dept = staff.employment?.department?.name || "Staff";

            // Generate some consistent color based on index for the mock badges
            const colors = [
              {
                bgWrap: "bg-pink-600 focus:bg-pink-600",
                badgeColor: "bg-pink-100 text-pink-600 dark:bg-pink-900/30",
              },
              {
                bgWrap: "bg-blue-600 focus:bg-blue-600",
                badgeColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
              },
              {
                bgWrap: "bg-green-600 focus:bg-green-600",
                badgeColor: "bg-green-100 text-green-600 dark:bg-green-900/30",
              },
              {
                bgWrap: "bg-purple-600 focus:bg-purple-600",
                badgeColor:
                  "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
              },
            ];

            const theme = colors[idx % colors.length];

            return (
              <div
                key={staff.uuid || idx}
                className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors gap-2"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {staff.photoUrl ? (
                    <img
                      src={staff.photoUrl}
                      alt="avatar"
                      className="h-9 sm:h-10 w-9 sm:w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 shrink-0 rounded-full ${theme.bgWrap} text-white font-semibold text-xs`}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                      {fullName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {dept}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${theme.badgeColor}`}
                >
                  <span>🎂</span>
                  <span>Birthday</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
