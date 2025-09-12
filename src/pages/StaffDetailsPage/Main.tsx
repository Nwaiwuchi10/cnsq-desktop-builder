"use client";

import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import StaffDetails from "./StaffDetails";
import Footer from "@/component/Footer/Footer";

const Main = () => {
  return (
    <div>
      <Navbar />
      <StaffDetails />
      <Footer />
    </div>
  );
};

export default Main;
