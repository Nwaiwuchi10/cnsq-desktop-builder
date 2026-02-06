"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// ✅ Import your icons
import svgContact from "../../assests/imageIcons/SVG.png";
import svgContact1 from "../../assests/imageIcons/SVG (1).png";
import svgContact2 from "../../assests/imageIcons/SVG (2).png";
import svgContact3 from "../../assests/imageIcons/SVG (3).png";
import Api from "@/utils/api";
import Link from "next/link";

interface Stats {
  totalEmployees: number;
  totalDepartments: number;
  birthdays: number;
  anniversaries: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await Api.get("/staff-register/stats/dashboard"); // 🔹 replace with your API endpoint
        // Limit to 3 staff members
        setStats(res?.data || null);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsView = [
    {
      id: 1,
      label: "Total Employees",
      value: stats?.totalEmployees ?? 0,
      icon: <Image src={svgContact} alt="employees-icon" />,
      href: "/staff",
    },
    {
      id: 2,
      label: "Departments",
      value: stats?.totalDepartments ?? 0,
      icon: <Image src={svgContact1} alt="departments-icon" />,
      href: "/heads-of-departments",
    },
    {
      id: 3,
      label: "Birthday this month",
      value: stats?.birthdays ?? 0,
      icon: <Image src={svgContact2} alt="birthdays-icon" />,
      href: "/birthday",
    },
    {
      id: 4,
      label: "Anniversaries this Quarter",
      value: stats?.anniversaries ?? 0,
      icon: <Image src={svgContact3} alt="anniversaries-icon" />,
      href: "/anniversary",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <p>Loading stats...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-[80vh] sm:min-h-[100vh] md:min-h-[70vh] lg:min-h-[50vh]  px-8 sm:px-6 md:px-20 pt-20">
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-7xl">
        Quick Analysis
      </h1>
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap gap-6 justify-center w-full max-w-7xl">
          {statsView?.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col items-start gap-3 border border-[#E5E7EB] bg-white rounded-2xl p-6 flex-1 min-w-[48%] sm:min-w-[48%] md:min-w-[22%]"
            >
              <Link href={stat.href} className="hover:opacity-80">
                <div className="text-gray-600">{stat.icon}</div>
                <p className="text-gray-900 font-medium">{stat.label}</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {stat?.value}
                </h2>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
