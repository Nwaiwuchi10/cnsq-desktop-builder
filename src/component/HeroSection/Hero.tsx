"use client";
import { useEffect, useState } from "react";
import heroimg1 from "../../assests/images/cn-hero.jpg";
import heroimg2 from "../../assests/images/ezinne.jpg";
import heroimg3 from "../../assests/images/ezi.png";

const slides = [
  { image: heroimg1, text: "Welcome" },
  { image: heroimg2, text: "Happy Birthday Ezinne" },
  { image: heroimg3, text: "Happy 2 Years Anniversary" },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background with gradient */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(rgba(30,30,30,0.5), rgba(0,0,0,0.7)), url(${slides[current].image.src})`,
          backgroundPosition: "center center", // ✅ ensures image centers
        }}
      />

      {/* Text content */}
      <div className="relative flex h-full w-full items-center justify-center">
        <h1
          className={`text-white text-4xl md:text-6xl font-bold text-center px-4 transition-all duration-1000 
          ${slides[current].text === "Welcome" ? "translate-y-[-120px]" : ""}`}
        >
          {slides[current].text}
        </h1>
      </div>
    </div>
  );
}
