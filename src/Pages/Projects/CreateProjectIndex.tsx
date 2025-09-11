"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import ProjectWizardForm from "./CreateProject";

const CreateProjectIndex = () => {
  return (
    <div>
      <Navbar />
      <ProjectWizardForm />

      <Footer />
    </div>
  );
};

export default CreateProjectIndex;
