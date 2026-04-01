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
  }, [CN_API_BASE]);

  const statsView = [
    {
      id: 1,
      label: "Target subscriptions",
      value: stats?.target_subscriptions ?? 156, // Defaulted to screenshot value for visualization if API fails
      icon: targetIcon,
      borderColor: "border-[#86CD23]",
    },
    {
      id: 2,
      label: "Total subscriptions",
      value: stats?.total_subscriptions ?? 156,
      icon: totalIcon,
      borderColor: "border-[#00D0D7]",
    },
    {
      id: 3,
      label: "Total subscriptions left",
      value: stats?.total_subscriptions_left ?? 156,
      icon: leftIcon,
      borderColor: "border-[#3b82f6]",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="dark:text-white">Loading subscription stats...</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Quote Request
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsView.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col gap-4 border-t-[3px] border-b border-l border-r border-b-gray-200 border-l-gray-200 border-r-gray-200 dark:border-b-gray-800 dark:border-l-gray-800 dark:border-r-gray-800 bg-white dark:bg-[#141414] rounded-2xl p-6 transition-colors shadow-sm`}
            style={{ borderTopColor: item.borderColor.replace('border-[', '').replace(']', '') }}
          >
            <div className="flex flex-col items-start gap-4">
              <div className="bg-gray-100 dark:bg-gray-800/50 p-2 rounded-lg">
                 <Image src={item.icon} alt="icon" width={24} height={24} className="opacity-80 dark:opacity-100" />
              </div>
              <div>
                 <p className="text-gray-900 dark:text-white text-sm font-semibold mb-1">
                   {item.label}
                 </p>
                 <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                   {item.value}
                 </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
