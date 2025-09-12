"use client";
import Navbar from "@/component/Navbar/Navbar";

import React from "react";
import StaffDirectory from "./Staffs";
import Footer from "@/component/Footer/Footer";

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
