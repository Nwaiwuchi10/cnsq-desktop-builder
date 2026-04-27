"use client";
import React from "react";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import DisplayTask from "@/component/DisplayTask/DisplayTask";

const TaskPage = () => {
  return (
    <StaffLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <DisplayTask />
      </div>
    </StaffLayout>
  );
};

export default TaskPage;
