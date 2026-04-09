"use client";

import React from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface StaffData {
  id: number;
  fullName: string;
  title: string;
  department: string;
  status: string;
  photoUrl: string | null;
}

interface TaskHeaderProps {
  staffData: StaffData | null;
}

const TaskHeader = ({ staffData }: TaskHeaderProps) => {
  const router = useRouter();

  // Generate initials from full name
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!staffData) {
    return (
      <div className="flex items-start justify-between pb-6">
        <div className="dark:text-gray-400">Loading...</div>
        <button
          onClick={() => router.back()}
          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  const initials = getInitials(staffData.fullName);

  return (
    <div className="flex items-start justify-between pb-6">
      <div className="flex items-center gap-4">
        {staffData.photoUrl ? (
          <Image
            src={staffData.photoUrl}
            alt={staffData.fullName}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#95D700] flex items-center justify-center text-xl font-bold text-black flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {staffData.fullName}
          </h2>
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-1">
            {staffData.title} • {staffData.department}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-[#95D700] text-black">
              {staffData.department}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-0.5 text-xs font-medium bg-[#FAFAFA] dark:bg-[#1a1a1a] rounded-full text-[#95D700]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#95D700]"></span>
              {staffData.status}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => router.back()}
        className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default TaskHeader;
