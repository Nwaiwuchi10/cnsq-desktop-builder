"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SubscriptionStats {
  target_subscriptions: number;
  total_subscriptions: number;
  total_subscriptions_left: number;
}

import targetIcon from "../../assests/images/TargetSub.png";
import totalIcon from "../../assests/images/totalsub.png";
import leftIcon from "../../assests/images/subscriptionLeft.png";

export default function SubscriptionStatsCards() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);

  const CN_API_BASE = process.env.NEXT_PUBLIC_CN_API_BASE_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${CN_API_BASE}/api/v1/quote-request/generic/subscription-stats`
        );
        const jsonRes = await res.json();
        setStats(jsonRes.data);
      } catch (error) {
        console.error("Error fetching subscription stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsView = [
    {
      id: 1,
      label: "Target subscriptions",
      value: stats?.target_subscriptions ?? 0,
      icon: targetIcon,
      borderColor: "border-t-lime-400",
    },
    {
      id: 2,
      label: "Total subscriptions",
      value: stats?.total_subscriptions ?? 0,
      icon: totalIcon,

      borderColor: "border-t-[#00D0D7]",
    },
    {
      id: 3,
      label: "Total subscriptions left",
      value: stats?.total_subscriptions_left ?? 0,
      icon: leftIcon,
      borderColor: "border-t-[#0007D7]",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <p>Loading subscription stats...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-[40vh] flex flex-col items-center px-8 sm:px-6 md:px-20 pt-20">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-7xl">
        Quote Request
      </h1>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-8 justify-center w-full max-w-7xl">
        {statsView.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col gap-4 border border-gray-200 bg-white rounded-2xl p-5 flex-1 
              min-w-[48%] sm:min-w-[48%] md:min-w-[30%] lg:min-w-[22%] border-t-4 ${item.borderColor}`}
          >
            {/* Top section */}
            <div className="flex items-center gap-4">
              <Image src={item.icon} alt="icon" width={40} height={40} />
              <span className="text-gray-700 text-lg font-medium">
                {item.label}
              </span>
            </div>

            {/* Value */}
            <h2 className="text-2xl font-bold text-gray-900 mt-1 mb-1">
              {item.value}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
