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
      <div className="flex flex-col gap-2">
         {/* Top Inspiration Block */}
         <DailyInspiration />

         {/* Stats Row 1 */}
         <SubscriptionStatsCards />

         {/* Stats Row 2 */}
         <StatsCards />

         {/* Bottom Grid for Projects and Celebrations */}
         <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 pb-12">
            <ActiveProjects />
            <TodayCelebrations />
         </div>
      </div>
    </StaffLayout>
  );
}
