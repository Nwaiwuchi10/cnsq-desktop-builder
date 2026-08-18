"use client";
import React from "react";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import TicketingDashboard from "@/modules/ticketing/components/TicketingDashboard";

const TicketingPage = () => {
  return (
    <StaffLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <TicketingDashboard />
      </div>
    </StaffLayout>
  );
};

export default TicketingPage;
