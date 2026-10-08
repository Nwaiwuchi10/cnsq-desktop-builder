"use client";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";
import Navbar from "@/component/Navbar/Navbar";
import Footer from "@/component/Footer/Footer";
import React, { useEffect, useState } from "react";
import StaffDirectory from "./Staffs";

const Index = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <StaffLayout>
        <StaffDirectory />
      </StaffLayout>
    );
  }

  return (
    <div>
      <Navbar />
      <StaffDirectory />
      <Footer />
    </div>
  );
};

export default Index;
