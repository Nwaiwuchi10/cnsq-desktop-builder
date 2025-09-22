"use client";

import Navbar from "@/component/Navbar/Navbar";
import React from "react";
import ProjectWizardForm from "./CreateProject";
import Footer from "@/component/Footer/Footer";

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
