"use client";

import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import StaffOnboardingForm from "./StaffRegister";
import Footer from "@/component/Footer/Footer";

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
