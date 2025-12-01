"use client";

import Image from "next/image";
import { useRef, useEffect, useState } from "react";

interface Person {
  name?: string;
  title: string;
  dept?: string;
  location?: string;
  color?: string;
  image?: string;
  children?: Person[];
}

const orgData: Person = {
  name: "Emeka Okafor",
  title: "CEO",
  dept: "Procurement",
  location: "Maryland, USA",
  color: "border-green-600",
  image: "/images/ceo.jpg",
  children: [
    {
      name: "Sarah Johnson",
      title: "Hiring Manager",
      dept: "HR",
      location: "Maryland, USA",
      color: "border-purple-400",
      image: "/images/hiring.jpg",
    },
    {
      name: "James Williams",
      title: "Technical",
      dept: "Procurement",
      location: "Maryland, USA",
      color: "border-pink-400",
      image: "/images/technical.jpg",
    },
    {
      name: "Ben Thompsons",
      title: "CTO",
      dept: "Technical",
      location: "Maryland, USA",
      color: "border-blue-400",
      image: "/images/cto.jpg",
      children: [
        { title: "Frontend Dev" },
        { title: "Backend Dev" },
        { title: "Mobile Dev" },
        { title: "Projects" },
        { title: "Quality Assurance" },
      ],
    },
    {
      name: "Ben Thompson",
      title: "COO",
      dept: "Operations",
      location: "Maryland, USA",
      color: "border-orange-400",
      image: "/images/coo.jpg",
      children: [
        { title: "Business Ops" },
        { title: "Media" },
        { title: "Data" },
        { title: "Product & Marketing" },
        { title: "Research Units" },
      ],
    },
  ],
};

// Card component
function Card({ person }: { person: Person }) {
  return (
    <div
      className={`rounded-xl border-2 ${person.color || "border-gray-500"} 
        bg-white shadow-md p-3 text-center w-56 relative`}
    >
      {person.image && (
        <Image
          src={person.image}
          alt={person.name || person.title}
          width={48}
          height={48}
          className="rounded-full mx-auto mb-2"
          unoptimized
        />
      )}
      {person.name && (
        <>
          <h3 className="font-semibold">{person.name}</h3>
          <p className="text-sm text-gray-500">{person.title}</p>
          {person.dept && (
            <span className="text-xs bg-gray-100 rounded px-2 py-1 mt-1 inline-block">
              {person.dept}
            </span>
          )}
          <p className="text-xs text-gray-400">{person.location}</p>
        </>
      )}
      {!person.name && (
        <p className="font-medium text-sm text-gray-700">{person.title}</p>
      )}
    </div>
  );
}

// Recursive Org Chart Renderer
function OrgNode({ person }: { person: Person }) {
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);
  const parentRef = useRef<HTMLDivElement>(null);
  const childRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!parentRef.current || !person.children) return;
    const parentBox = parentRef.current.getBoundingClientRect();
    const newLines = person.children.map((_, i) => {
      const childBox = childRefs.current[i]?.getBoundingClientRect();
      if (!childBox) return { x1: 0, y1: 0, x2: 0, y2: 0 };
      return {
        x1: parentBox.left + parentBox.width / 2,
        y1: parentBox.bottom,
        x2: childBox.left + childBox.width / 2,
        y2: childBox.top,
      };
    });
    setLines(newLines);
  }, [person.children]);

  return (
    <div className="flex flex-col items-center relative">
      <div ref={parentRef}>
        <Card person={person} />
      </div>

      {person.children && (
        <div className="flex gap-6 mt-10 relative">
          {lines.map((line, i) => (
            <svg
              key={i}
              className="absolute left-0 top-0 w-full h-full pointer-events-none"
            >
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#ccc"
                strokeWidth="2"
              />
            </svg>
          ))}
          {person.children.map((child, i) => (
            <div
              key={i}
              ref={(el) => {
                childRefs.current[i] = el;
              }}
              // ref={(el) => (childRefs.current[i] = el)}
              className="flex flex-col items-center"
            >
              <OrgNode person={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  return (
    <div className="py-10 flex justify-center">
      <OrgNode person={orgData} />
    </div>
  );
}
