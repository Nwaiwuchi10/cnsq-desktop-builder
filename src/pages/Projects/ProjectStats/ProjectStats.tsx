"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Api from "@/utils/api";

// ✅ Import icons for projects
import totalIcon from "../../../assests/imageIcons/file.png";
import activeIcon from "../../../assests/imageIcons/clock.png";
import completedIcon from "../../../assests/imageIcons/check-circle.png";
import planningIcon from "../../../assests/imageIcons/calendar.png";

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
}

export default function ProjectStatsCards() {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        const res = await Api.get("/projects/all/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching project stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStats();
  }, []);

  const statsView = [
    {
      id: 1,
      label: "Total Projects",
      value: stats?.total ?? 0,
      icon: <Image src={totalIcon} alt="total-projects" unoptimized />,
    },
    {
      id: 2,
      label: "Active Projects",
      value: stats?.active ?? 0,
      icon: <Image src={activeIcon} alt="active-projects" unoptimized />,
    },
    {
      id: 3,
      label: "Completed Projects",
      value: stats?.completed ?? 0,
      icon: <Image src={completedIcon} alt="completed-projects" unoptimized />,
    },
    {
      id: 4,
      label: "Planning Projects",
      value: stats?.planning ?? 0,
      icon: <Image src={planningIcon} alt="planning-projects" unoptimized />,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <p>Loading project stats...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-[45vh] flex items-center justify-center">
      <div className="flex flex-wrap gap-6 justify-center w-full ">
        {statsView.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col items-start gap-3 border border-[#E5E7EB] bg-white rounded-2xl p-6 flex-1 min-w-[48%] sm:min-w-[48%] md:min-w-[22%]"
          >
            <div className="text-gray-600">{stat.icon}</div>
            <p className="text-gray-900 font-medium">{stat.label}</p>
            <h2 className="text-2xl font-bold text-gray-900">{stat.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
