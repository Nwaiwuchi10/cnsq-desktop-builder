"use client";

import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react"; // icons
import imgPix from "../../assests/images/ezinneprofile.jpg";
import imgPix2 from "../../assests/images/profile.png";
import imgPix3 from "../../assests/images/profile.png";
export default function TeamProfiles() {
  const people = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Hiring Manager",
      dept: "HR",
      email: "sarah.johnson@cnsquad.com",
      phone: "+234 812 345 6789",
      location: "Lagos, Nigeria",
      img: imgPix,
    },
    {
      id: 2,
      name: "Michael Smith",
      role: "Project Manager",
      dept: "HR",
      email: "michael.smith@cnsquad.com",
      phone: "+234 701 234 5678",
      location: "Abuja, Nigeria",
      img: imgPix2,
    },
    {
      id: 3,
      name: "Grace Williams",
      role: "Recruitment Lead",
      dept: "HR",
      email: "grace.williams@cnsquad.com",
      phone: "+234 909 876 5432",
      location: "Port Harcourt, Nigeria",
      img: imgPix3,
    },
  ];

  return (
    <div className="bg-[#FAFAFA]  min-h-[80vh] flex flex-col items-center px-6 sm:px-10 md:px-16 pt-12">
      {/* Heading */}
      <div className="flex  items-center justify-between w-full max-w-6xl mb-10">
        {/* Left: Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-black">
          Team Profiles
        </h1>

        {/* Right: View All Button */}
        <button className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition">
          View All
        </button>
      </div>
      {/* <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-6xl">
        Team Profiles
      </h1> */}

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {people.map((person) => (
          <div
            key={person.id}
            className="flex flex-col justify-between border border-[#E5E7EB] bg-white rounded-2xl p-6 shadow-sm"
          >
            {/* 1️⃣ Profile Picture + Name + Role */}
            <div className="flex items-center gap-4">
              <Image
                src={person.img}
                alt={person.name}
                width={50}
                height={50}
                className="rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-gray-900 font-semibold">
                  {person.name}
                </span>
                <span className="text-gray-500 text-sm">{person.role}</span>
              </div>
            </div>

            {/* 2️⃣ Department Badge */}
            <div className="mt-4">
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#E9EAEB] text-[#496C08]">
                {person.dept}
              </span>
            </div>

            {/* 3️⃣ Email */}
            <div className="flex items-center gap-2 mt-4 text-gray-600 text-sm">
              <Mail size={16} />
              <span>{person.email}</span>
            </div>

            {/* 4️⃣ Phone */}
            <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
              <Phone size={16} />
              <span>{person.phone}</span>
            </div>

            {/* 5️⃣ Location */}
            <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
              <MapPin size={16} />
              <span>{person.location}</span>
            </div>

            {/* 6️⃣ View Profile Button */}
            <button className="mt-6 w-full h-11 bg-[#95D700] text-white font-semibold rounded-lg hover:bg-green-500 transition">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
