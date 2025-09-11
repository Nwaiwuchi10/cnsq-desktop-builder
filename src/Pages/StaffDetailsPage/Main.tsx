"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import StaffDetails from "./StaffDetails";

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
