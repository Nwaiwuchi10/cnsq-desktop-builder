import React, { Suspense } from "react";
import Settings from "@/pages/Settings/Settings";

const SettingsPage = () => {
  return (
    <Suspense fallback={<div>Loading Settings...</div>}>
      <Settings />
    </Suspense>
  );
};

export default SettingsPage;
