"use client";
import Navbar from "@/component/Navbar/Navbar";

import React from "react";
import OrganogramPage from "./Organnogram";
import Footer from "@/component/Footer/Footer";

const Index = () => {
  return (
    <div>
      <Navbar />
      <OrganogramPage />
      <Footer />
    </div>
  );
};

export default Index;
