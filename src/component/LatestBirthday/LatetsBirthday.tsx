"use client";

import Image from "next/image";
import person1 from "../../assests/images/ezi.png";
import person2 from "../../assests/images/ezinne.jpg";
import person3 from "../../assests/images/ezi.png";
import person4 from "../../assests/images/ezinne.jpg";

export default function LatestBirthday() {
  const birthdays = [
    { id: 1, name: "John Doe", date: "12-06-2025", img: person1 },
    { id: 2, name: "Jane Smith", date: "12-06-2025", img: person2 },
    { id: 3, name: "Chris Evans", date: "12-06-2025", img: person3 },
    { id: 4, name: "Ezinne Okafor", date: "12-06-2025", img: person4 },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-[60vh] flex flex-col items-center px-4 sm:px-6 md:px-12 lg:px-20 pt-12">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-10 w-full max-w-6xl">
        Latest Birthday
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
  );
}
