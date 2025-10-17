"use client";

import { X, Calendar } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function NotificationModal({
  onClose,
  notification,
}: {
  onClose: () => void;
  notification: any;
}) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 h-full">
      <div className="mt-12 mb-8 relative w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          //   onClick={() => setOpen(false)}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="mb-4">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Lawal Omeiza</span> assigned a{" "}
            <span className="font-semibold">task</span>
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-1">CRM</h2>
          <p className="text-sm text-gray-400 mt-1">Today at 01:35pm</p>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-700 mt-4">
          You’ve been assigned a new project. Open it to view the details and
          get started
        </p>

        {/* Task Preview Card */}
        <div className="border border-gray-200 rounded-xl p-4 mt-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 ml-3">
              <div>
                <button className="mb-2 flex items-center justify-center w-6 h-6 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50">
                  +
                </button>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                CN SQUAD WEB DESIGN
              </h3>
              {/* Staff Assigned */}
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Staff Assigned</p>
                <div className="flex -space-x-2 items-center">
                  <Image
                    src="https://res.cloudinary.com/dlrelihio/image/upload/v1760686725/1_zkbp2k.jpg"
                    width={28}
                    height={28}
                    alt="staff"
                    className="rounded-full border border-white"
                  />
                  <Image
                    src="https://res.cloudinary.com/dlrelihio/image/upload/v1760686800/2_eqreql.jpg"
                    width={28}
                    height={28}
                    alt="staff"
                    className="rounded-full border border-white"
                  />
                  <Image
                    src="https://res.cloudinary.com/dlrelihio/image/upload/v1760686858/3_krvkni.jpg"
                    width={28}
                    height={28}
                    alt="staff"
                    className="rounded-full border border-white"
                  />
                  <button className="ml-2 flex items-center justify-center w-6 h-6 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-50">
                    +
                  </button>
                </div>
              </div>

              {/* Due Date */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                  <Calendar size={16} className="text-gray-500" />
                  <span>14 Aug 2025, 3pm</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-800 mb-1">
                  Description
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Improving the internal staff management platform with new
                  features and better user experience. Improving the internal
                  staff management platform with new features and better user
                  experience. Improving the internal staff management platform
                  with new features and better user experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center mt-8">
          <button className="bg-[#95D700] hover:bg-[#80C400] text-white font-medium text-sm px-6 py-2.5 rounded-md">
            Open Task
          </button>
        </div>
      </div>
    </div>
  );
}
