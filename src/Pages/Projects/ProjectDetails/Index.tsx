"use client";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";

import Footer from "@/component/Footer/Footer";
import ProjectDetails from "./ProjectDetails";

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
