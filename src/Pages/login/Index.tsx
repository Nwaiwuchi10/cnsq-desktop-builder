"use client";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";

import Footer from "@/component/Footer/Footer";
import Login from "./Login";

const Index = () => {
  return (
    <div>
      <Navbar />
      <Login />
      <Footer />
    </div>
  );
};

export default Index;
