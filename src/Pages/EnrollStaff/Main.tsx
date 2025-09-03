"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import StaffOnboardingForm from "./StaffRegister";

const Main = () => {
  return (
    <div>
      <Navbar />
      <StaffOnboardingForm />
      <Footer />
    </div>
  );
};

export default Main;
