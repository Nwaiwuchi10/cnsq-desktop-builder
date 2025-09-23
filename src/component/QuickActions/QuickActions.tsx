"use client";

import svgContact from "../../assests/imageIcons/SVG.png";
import svgContact1 from "../../assests/imageIcons/mingcute_celebrate-line.png";
import svgContact2 from "../../assests/imageIcons/line-chart-up-02.png";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link"; // ✅ import Next.js Link

export default function QuickActions() {
  const actions = [
    {
      id: 1,
      label: "Staff Directory",
      content:
        "Browse and manage your organization's staff with detailed profiles and hierarchy mapping.",
      buttonText: "View Directory",
      icon: <Image src={svgContact} alt="staff-directory-icon" />,
      href: "/staff", // ✅ navigation path
    },
    {
      id: 2,
      label: "Celebrations",
      content: "Browse and manage your staff with detailed updates",
      buttonText: "View Birthdays",
      icon: <Image src={svgContact1} alt="birthdays-icon" />,
      href: "/birthday", // ✅ navigation path
    },
    {
      id: 3,
      label: "Organization Chart",
      content:
        "Visualize company structure with interactive organogram and reporting lines",
      buttonText: "View Organogram",
      icon: <Image src={svgContact2} alt="organogram-icon" />,
      href: "/organogram", // ✅ navigation path
    },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-[80vh] flex flex-col items-center px-8 sm:px-6 md:px-20 pt-12">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-6xl">
        Quick Actions
      </h1>

      {/* Action Cards */}
      <div className="flex flex-wrap gap-8 justify-center w-full max-w-6xl">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex flex-col justify-between border border-[#E5E7EB] bg-white rounded-2xl p-8 flex-1 min-w-[48%] sm:min-w-[48%] md:min-w-[30%] lg:min-w-[22%]"
          >
            {/* Top Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-gray-900 font-medium text-lg">
                {action.icon}
                <span className="text-gray-600">{action.label}</span>
              </div>

              <p className="text-gray-500 font-medium mt-2 mb-2">
                {action.content}
              </p>
            </div>

            {/* Button as Link */}
            <Link
              href={action.href}
              className="mt-6 flex items-center justify-center gap-2 bg-[#95D700] text-white font-semibold rounded-lg w-full h-12 hover:bg-green-500 transition"
            >
              {action.buttonText}
              <ArrowRight size={18} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
