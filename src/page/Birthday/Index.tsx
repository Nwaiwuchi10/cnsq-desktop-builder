"use client";

import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import Birthday from "./Birthday";
import Footer from "@/component/Footer/Footer";

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
