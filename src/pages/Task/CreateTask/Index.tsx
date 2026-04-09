"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import CreateTaskForm from "./CreateTask";
import UploadTasksPage from "./UploadCSV";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";

const Index = () => {
  return (
    <div>
      <StaffLayout>

        <CreateTaskForm />
      </StaffLayout>
    </div>
  );
};

export default Index;
