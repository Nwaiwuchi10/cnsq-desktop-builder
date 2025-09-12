"use client";

import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import ProjectDetails from "./ProjectDetails";
import Footer from "@/component/Footer/Footer";

const Index = () => {
  return (
    <div>
      <Navbar />
      <ProjectDetails />
      <Footer />
    </div>
  );
};

export default Index;
