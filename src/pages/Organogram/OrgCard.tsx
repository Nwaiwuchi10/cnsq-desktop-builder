"use client";
import Image, { StaticImageData } from "next/image";

interface OrgCardProps {
  name: string;
  role: string;
  department: string;
  location: string;
  photo?: string | StaticImageData;
  type?: "default" | "cto-child" | "coo-child";
}

export default function OrgCard({
  name,
  role,
  department,
  location,
  photo,
  type = "default",
}: OrgCardProps) {
  // ✅ CTO child card (list of departments only)
  if (type === "cto-child") {
    return (
      <div
        className="w-44 p-3 border-2 rounded-xl flex flex-col items-center bg-white"
        style={{ borderColor: "#EEF4FF" }}
      >
        <button
          className="px-3 py-1 text-white rounded-md text-sm"
          style={{ backgroundColor: "#6172F3" }}
        >
          {department}
        </button>
      </div>
    );
  }

  // ✅ COO child card (list of departments only)
  if (type === "coo-child") {
    return (
      <div
        className="w-44 p-3 border-2 rounded-xl flex flex-col items-center bg-white"
        style={{ borderColor: "#FFFAEC" }}
      >
        <button
          className="px-3 py-1 text-white rounded-md text-sm"
          style={{ backgroundColor: "#FF990C" }}
        >
          {department}
        </button>
      </div>
    );
  }

  // ✅ Default card (CEO, HR, Technical, CTO, COO)
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 w-52 text-center border relative">
      {photo && (
        <div className="flex justify-center -mt-12 mb-2">
          <Image
            src={photo}
            alt={name}
            width={70}
            height={70}
            className="rounded-full border-2 border-gray-300 object-cover"
          />
        </div>
      )}
      <h3 className="font-semibold text-base">{name}</h3>
      <span className="text-xs text-blue-600 px-2 py-1 bg-blue-100 rounded-full inline-block mt-1">
        {role}
      </span>
      <div className="mt-2 space-y-1">
        <span className="text-xs px-2 py-1 bg-gray-100 rounded-lg block">
          {department}
        </span>
        <span className="text-xs px-2 py-1 bg-green-100 rounded-lg block">
          {location}
        </span>
      </div>
    </div>
  );
}
