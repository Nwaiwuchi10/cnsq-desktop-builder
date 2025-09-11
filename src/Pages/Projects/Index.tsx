"use client";

import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import ViewProjects from "./ViewProjects";
import Footer from "@/component/Footer/Footer";

const Index = () => {
  return (
    <div>
      <Navbar />
      <ViewProjects />
      <Footer />
    </div>
  );
};

export default Index;
