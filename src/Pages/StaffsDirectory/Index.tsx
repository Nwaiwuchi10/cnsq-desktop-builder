"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import StaffDirectory from "./Staffs";

const Index = () => {
  return (
    <div>
      <Navbar />
      <StaffDirectory />

      <Footer />
    </div>
  );
};

export default Index;
