"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import Birthday from "./Birthday";

const Index = () => {
  return (
    <div>
      <Navbar />

      <Birthday />

      <Footer />
    </div>
  );
};

export default Index;
