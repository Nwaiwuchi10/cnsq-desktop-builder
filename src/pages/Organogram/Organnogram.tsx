// app/organogram/page.tsx
"use client";

// import OrgChartDemo from "./OrganogramDomiData";
import OrgChart from "./OrgaTree";

// import OrgChart from "./OrgaTree";

export default function OrganogramPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center py-6">
        Company Organogram
      </h1>
      {/* <OrgChartDemos /> */}
      <OrgChart />
    </main>
  );
}
