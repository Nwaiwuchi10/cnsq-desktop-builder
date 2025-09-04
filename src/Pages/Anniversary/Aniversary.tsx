"use client";
import { ChevronDown, Filter, Search } from "lucide-react";
import Image from "next/image";

import React from "react";
import person1 from "../../assests/images/ezi.png";
import person2 from "../../assests/images/ezinne.jpg";
import person3 from "../../assests/images/ezi.png";
import person4 from "../../assests/images/ezinne.jpg";

const Aniversary = () => {
  const birthdays = [
    { id: 1, name: "John Doe", date: "12-06-2025", img: person1 },
    { id: 2, name: "Jane Smith", date: "12-06-2025", img: person2 },
    { id: 3, name: "Chris Evans", date: "12-06-2025", img: person3 },
    { id: 4, name: "Ezinne Okafor", date: "12-06-2025", img: person4 },
  ];
  return (
    <div>
      <div className="bg-[#FF990C] text-white h-[50vh] flex items-center justify-center  w-full mt-16 ">
        <h1 className="text-3xl sm:text-5xl font-bold">Anniversary</h1>
      </div>
      <div className="min-h-screen w-full bg-[#FAFAFA]  ">
        <div className="max-w-[95%] mx-auto px-4 sm:px-8">
          <h1 className="pt-12 text-2xl sm:text-3xl font-bold text-gray-900">
            Anniversary
          </h1>

          {/* 📄 Subtitle */}
          <p className="mt-8 text-gray-600 text-base sm:text-lg">
            Browse and connect with your colleagues across the organization
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex items-center w-full sm:w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <Search className="text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search"
                className="ml-2 w-full outline-none text-sm text-gray-700 placeholder-gray-400"
              />

              {/* Filter + Add Staff (MOBILE only) */}
              <div className="flex sm:hidden gap-2 ml-2">
                <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-100">
                  Sort By <Filter size={16} />
                </button>
              </div>
            </div>

            {/* Right Side (DESKTOP only) */}
            <div className="hidden sm:flex items-center gap-3">
              <button className="flex bg-white items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">
                Sort by
                <ChevronDown size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="mt-12 ">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-6xl">
              This Month
            </h1>

            {/* Responsive Grid */}
            <div
              className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-4
                  gap-8
                  w-full max-w-7xl
                "
            >
              {birthdays.map((person) => (
                <div
                  key={person.id}
                  className="flex flex-col items-start text-left w-full"
                >
                  {/* Image Container with fixed size */}
                  <div
                    className="
                 relative
                 w-[315px]       /* Mobile width */
                 h-[315px]       /* Mobile height */
                 sm:w-[420px] sm:h-[250px]   /* Tablet */
                 md:w-[380px] md:h-[260px]   /* Medium screens */
                 lg:w-[280px] lg:h-[280px]   /* Desktop (square look) */
                 rounded-lg
                 overflow-hidden
                 shadow-sm
               "
                  >
                    <Image
                      src={person.img}
                      alt={person.name}
                      width={280}
                      height={280}
                      className="w-full h-full object-cover bg-gray-100"
                    />
                  </div>

                  {/* Name */}
                  <p className="mt-3 text-gray-900 font-semibold text-lg">
                    {person.name}
                  </p>

                  {/* Date */}
                  <span className="text-gray-500 text-sm">{person.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* anniversary card */}
          <div className="mt-16 pb-16">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-6xl">
              Recent Anniversary
            </h1>

            {/* Responsive Grid */}
            <div
              className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-4
                  gap-8
                  w-full max-w-7xl
                "
            >
              {birthdays.map((person) => (
                <div
                  key={person.id}
                  className="flex flex-col items-start text-left w-full"
                >
                  {/* Image Container with fixed size */}
                  <div
                    className="
                relative
                w-[315px]       /* Mobile width */
                h-[315px]       /* Mobile height */
                sm:w-[420px] sm:h-[250px]   /* Tablet */
                md:w-[380px] md:h-[260px]   /* Medium screens */
                lg:w-[280px] lg:h-[280px]   /* Desktop (square look) */
                rounded-lg
                overflow-hidden
                shadow-sm
              "
                  >
                    <Image
                      src={person.img}
                      alt={person.name}
                      width={280}
                      height={280}
                      className="w-full h-full object-cover bg-gray-100"
                    />
                  </div>

                  {/* Name */}
                  <p className="mt-3 text-gray-900 font-semibold text-lg">
                    {person.name}
                  </p>

                  {/* Date */}
                  <span className="text-gray-500 text-sm">{person.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* card section */}

        {/* anniversary card section */}
      </div>
    </div>
  );
};

export default Aniversary;
