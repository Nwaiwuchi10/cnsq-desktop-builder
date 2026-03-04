import React, { useEffect, useState } from "react";
import Api from "@/utils/api";

interface DashboardData {
  productivity: {
    completionRate: number;
    workloadUtilization: number;
    capacityLabel: string;
  };
}

interface ProductivityDashboardProps {
  staffId: number | null;
  dashboardData: DashboardData | null;
}

const ProductivityDashboard = ({
  staffId,
  dashboardData,
}: ProductivityDashboardProps) => {
  const [loading, setLoading] = useState(false);

  if (!dashboardData || loading) {
    return (
      <div className="mt-8">
        <h3 className="text-[#95D700] text-xs font-bold uppercase tracking-wider mb-4">
          PRODUCTIVITY DASHBOARD
        </h3>
        <div className="p-4 text-center text-gray-500 text-sm">
          {loading ? "Loading dashboard..." : "No data available"}
        </div>
      </div>
    );
  }

  const { completionRate, workloadUtilization, capacityLabel } =
    dashboardData.productivity;

  return (
    <div className="mt-8">
      <h3 className="text-[#95D700] text-xs font-bold uppercase tracking-wider mb-4">
        PRODUCTIVITY DASHBOARD
      </h3>
      <div className="mb-6 flex flex-col items-start">
        <span className="text-[40px] leading-none font-extrabold text-[#F97316]">
          {completionRate}%
        </span>
        <span className="text-xs text-gray-400 font-medium mt-1">
          Completion Rate
        </span>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 font-medium">
            Workload Utilization
          </span>
          <span className="text-sm text-[#F97316] font-semibold">
            {workloadUtilization}% · {capacityLabel}
          </span>
        </div>
        <div className="w-full bg-[#E5E7EB] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#95D700] h-2.5 rounded-full"
            style={{ width: `${workloadUtilization}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityDashboard;
