"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import HeadsStaffDirectory from "./HeadsOfDepts";

const Main = () => {
  return (
    <div>
      <Navbar />
      <HeadsStaffDirectory />
      <Footer />
    </div>
  );
};

export default Main;
