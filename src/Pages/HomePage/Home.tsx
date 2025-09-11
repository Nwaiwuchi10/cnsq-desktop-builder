"use client";
import StatsCards from "@/component/AnalysisSection/Analysis";
import Footer from "@/component/Footer/Footer";
import Hero from "@/component/HeroSection/Hero";
import LatestAnniversary from "@/component/LatesAnniversay/LatestAnniversary";
import LatestBirthday from "@/component/LatestBirthday/LatetsBirthday";
import Navbar from "@/component/Navbar/Navbar";
import QuickActions from "@/component/QuickActions/QuickActions";
import TeamProfiles from "@/component/TeamProfile/TeamProfile";

import React from "react";

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <StatsCards />
      <QuickActions />
      <LatestBirthday />
      <TeamProfiles />
      <LatestAnniversary />
      <Footer />
    </div>
  );
};

export default HomePage;
