"use client";
import Navbar from "@/component/Navbar/Navbar";

import React from "react";
import HeadsStaffDirectory from "./HeadsOfDepts";
import Footer from "@/component/Footer/Footer";

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
