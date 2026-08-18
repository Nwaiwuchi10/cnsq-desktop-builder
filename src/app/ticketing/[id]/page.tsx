"use client";
import React from "react";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import TicketDetailsPage from "@/modules/ticketing/components/TicketDetailsPage";
import { useParams } from "next/navigation";

const TicketDetailsWrapper = () => {
  const params = useParams();
  const ticketId = params?.id as string;
  
  return (
    <StaffLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <TicketDetailsPage />
      </div>
    </StaffLayout>
  );
};

export default TicketDetailsWrapper;
