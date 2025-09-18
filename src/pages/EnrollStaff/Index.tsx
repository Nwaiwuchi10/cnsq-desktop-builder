"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import HeadOfDeptOnboardingForm from "./HeadOfDepartmentEnroll";

const Index = () => {
  return (
    <div>
      <Navbar />

      <HeadOfDeptOnboardingForm />
      <Footer />
    </div>
  );
};

export default Index;
