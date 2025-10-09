"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import CreateTaskForm from "./CreateTask";
import UploadTasksPage from "./UploadCSV";

const Index = () => {
  return (
    <div>
      <Navbar />
    
      <CreateTaskForm />
      <Footer />
    </div>
  );
};

export default Index;
