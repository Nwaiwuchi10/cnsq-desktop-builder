"use client";

import svgContact from "../../assests/imageIcons/SVG.png";
import svgContact1 from "../../assests/imageIcons/SVG (1).png";
import svgContact2 from "../../assests/imageIcons/SVG (2).png";
import svgContact3 from "../../assests/imageIcons/SVG (3).png";
import Image from "next/image";

export default function StatsCards() {
  const stats = [
    {
      id: 1,
      label: "Total Employees",
      value: 156,
      icon: <Image src={svgContact} alt="svg-icon" />,
    },
    {
      id: 2,
      label: "Departments",
      value: 8,
      icon: <Image src={svgContact1} alt="svg-icon" />,
    },
    {
      id: 3,
      label: "Birthday this month",
      value: 12,
      icon: <Image src={svgContact2} alt="svg-icon" />,
    },
    {
      id: 4,
      label: "Anniversaries this Quarter",
      value: 23,
      icon: <Image src={svgContact3} alt="svg-icon" />,
    },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-[80vh] sm:min-h-[100vh] md:min-h-[70vh] lg:min-h-[50vh] flex items-center justify-center px-8 sm:px-6 md:px-20 pt-8">
      <div className="flex flex-wrap gap-6 justify-center w-full max-w-6xl">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col items-start gap-3 border border-[#E5E7EB] bg-white rounded-2xl p-6 flex-1 min-w-[48%] sm:min-w-[48%] md:min-w-[22%]"
          >
            <div className="text-gray-600">{stat.icon}</div>
            <p className="text-gray-900 font-medium">{stat.label}</p>
            <h2 className="text-2xl font-bold text-gray-900">{stat.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
