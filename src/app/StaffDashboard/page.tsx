"use client";

import React from "react";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import DailyInspiration from "@/component/StaffDashboard/DailyInspiration";
import SubscriptionStatsCards from "@/component/QuoteRequestSubscriptionStat/SubscriptionStatCard";
import StatsCards from "@/component/AnalysisSection/Analysis";
import ActiveProjects from "@/component/StaffDashboard/ActiveProjects";
import TodayCelebrations from "@/component/StaffDashboard/TodayCelebrations";

export default function StaffDashboardPage() {
  return (
    <StaffLayout>
      <div className="w-full flex flex-col gap-3 md:gap-4">
        {/* Top Inspiration Block */}
        <div className="w-full">
          <DailyInspiration />
        </div>

        {/* Stats Row 1 */}
        <div className="w-full">
          <SubscriptionStatsCards />
        </div>

        {/* Stats Row 2 */}
        <div className="w-full">
          <StatsCards />
        </div>

        {/* Bottom Grid for Projects and Celebrations */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 md:gap-6 pb-12 w-full">
          <div className="w-full overflow-hidden">
            <ActiveProjects />
          </div>
          <div className="w-full overflow-hidden">
            <TodayCelebrations />
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
