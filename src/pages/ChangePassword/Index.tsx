"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import ChangePassword from "./ChangePassword";

const Index = () => {
  return (
    <div>
      <Navbar />
      <ChangePassword />
      <Footer />
    </div>
  );
};

export default Index;
