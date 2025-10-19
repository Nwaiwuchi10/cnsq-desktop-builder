"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import Notification from "./Notification";

const Index = () => {
  return (
    <div>
      <Navbar />

      <Notification />
      <Footer />
    </div>
  );
};

export default Index;
