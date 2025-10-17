"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import NotificationsList from "./Notification";

const Index = () => {
  return (
    <div>
      <Navbar />

      <NotificationsList />
      <Footer />
    </div>
  );
};

export default Index;
