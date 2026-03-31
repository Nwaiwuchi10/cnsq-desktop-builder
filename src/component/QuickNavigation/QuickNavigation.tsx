"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Network,
  FolderKanban,
  Cake,
  CalendarDays,
  ArrowRight
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    description: "View metrics and insights",
    href: "/",
    icon: LayoutDashboard,
    bg: "bg-[#a855f7]", // Purple
  },
  {
    title: "Staff Directory",
    description: "Browse all team members",
    href: "/staff",
    icon: Users,
    bg: "bg-[#95D700]", // CN brand green
  },
  {
    title: "Organogram",
    description: "Organizational structure",
    href: "/organogram",
    icon: Network,
    bg: "bg-[#3b82f6]", // Blue
  },
  {
    title: "Projects & Tasks",
    description: "Manage work and deadlines",
    href: "/project",
    icon: FolderKanban,
    bg: "bg-[#6366f1]", // Indigo
  },
  {
    title: "Celebrations",
    description: "Birthdays and milestones",
    href: "/birthday",
    icon: Cake,
    bg: "bg-[#ec4899]", // Pink
  },
  {
    title: "Calendar",
    description: "Events and schedules",
    href: "/calender",
    icon: CalendarDays,
    bg: "bg-[#f97316]", // Orange
  },
];

export default function QuickNavigation() {
  return (
    <div className="w-full bg-[#FAFAFA] px-8 sm:px-6 md:px-20 py-8 md:py-10">
      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-10 tracking-tight">
          Quick Navigation
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center p-4 md:p-5 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer group"
            >
              <div
                className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg ${item.bg} text-white shadow-sm`}
              >
                <item.icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
              </div>
              
              <div className="ml-5 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-[15px] font-bold text-gray-800 tracking-tight">
                    {item.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-gray-500 text-[13px] font-medium tracking-tight">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
