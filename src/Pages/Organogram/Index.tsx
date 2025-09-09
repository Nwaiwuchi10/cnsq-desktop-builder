"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import OrganogramPage from "./Organnogram";

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
