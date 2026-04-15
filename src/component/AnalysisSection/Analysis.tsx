"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Api from "@/utils/api";
import {
  Users,
  FolderKanban,
  CheckSquare,
  Cake,
  Building2,
  CheckLine,
} from "lucide-react";

interface Stats {
  totalEmployees: number;
  activeProjects: number;
  tasksInProgress: number;
  birthdays: number;
  totalDepartments: number;
  totalProjects: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await Api.get("/staff-register/stats/dashboard");
        setStats(res?.data || null);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsView = [
    {
      id: 1,
      label: "Total Staff",
      value: stats?.totalEmployees ?? 0, // Default to mock data from screenshot
      subtitle: "+3 new this month",
      subtitleColor: "text-[#86CD23]",
      icon: <Users className="w-5 h-5 text-[#86CD23]" />,
      href: "/staff",
    },
    {
      id: 2,
      label: "Departments",
      value: stats?.totalDepartments ?? 0,
      subtitle: "",
      icon: <Building2 className="w-5 h-5 text-[#86CD23]" />,
      href: "/heads_of_departments",
    },
    {
      id: 3,
      label: "Total Projects",
      value: stats?.totalProjects ?? 0,
      subtitle: "",
      subtitleColor: "text-amber-500",
      icon: <CheckLine className="w-5 h-5 text-[#86CD23]" />,
      href: "/projects",
    },
    {
      id: 4,
      label: "Birthday this month",
      value: stats?.birthdays ?? 0,
      subtitle: "Next 7 days",
      subtitleColor: "text-[#86CD23]",
      icon: <Cake className="w-5 h-5 text-[#86CD23]" />,
      href: "/birthday",
    },
    {
      id: 5,
      label: "Anniversaries this Quarter",
      value: stats?.tasksInProgress ?? 0,
      subtitle: "6 due today",
      subtitleColor: "text-amber-500",
      icon: <CheckSquare className="w-5 h-5 text-[#86CD23]" />,
      href: "/anniversary",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="dark:text-white">Loading analysis stats...</p>
      </div>
    );
  }

  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Quick Analysis
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {statsView.map((stat) => (
          <Link
            key={stat.id}
            href={stat.href}
            className="flex flex-col justify-between border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] rounded-lg sm:rounded-2xl p-3 sm:p-4 md:p-5 hover:border-[#86CD23] dark:hover:border-[#86CD23] transition-all shadow-sm group w-full"
          >
            <div className="flex items-start mb-2 sm:mb-4">
              <div className="text-[#86CD23] opacity-80 group-hover:opacity-100 transition-opacity">
                {stat.icon}
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                {stat.value}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-2 line-clamp-2">
                {stat.label}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
