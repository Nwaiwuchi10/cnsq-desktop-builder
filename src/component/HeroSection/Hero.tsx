// "use client";
// import { useEffect, useState } from "react";
// import heroimg1 from "../../assests/images/cn-hero.jpg";
// import heroimg2 from "../../assests/images/ezinne.jpg";
// import heroimg3 from "../../assests/images/ezi.png";

// const slides = [
//   { image: heroimg1, text: "Welcome" },
//   { image: heroimg2, text: "Happy Birthday Ezinne" },
//   { image: heroimg3, text: "Happy 2 Years Anniversary" },
// ];

// export default function Hero() {
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrent((prev) => (prev + 1) % slides.length);
//     }, 5000);
//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <div className="relative w-full h-screen overflow-hidden">
//       {/* Background with gradient */}
//       <div
//         className="absolute top-0 left-0 w-full h-full bg-cover bg-center transition-all duration-1000"
//         style={{
//           backgroundImage: `linear-gradient(rgba(30,30,30,0.5), rgba(0,0,0,0.7)), url(${slides[current].image.src})`,
//           backgroundPosition: "center center", // ✅ ensures image centers
//         }}
//       />

//       {/* Text content */}
//       <div className="relative flex h-full w-full items-center justify-center">
//         <h1
//           className={`text-white text-4xl md:text-6xl font-bold text-center px-4 transition-all duration-1000
//           ${slides[current].text === "Welcome" ? "translate-y-[-120px]" : ""}`}
//         >
//           {slides[current].text}
//         </h1>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import heroimg1 from "../../assests/images/cn-hero.jpg";
import heroimg2 from "../../assests/images/ezinne.jpg";
import heroimg3 from "../../assests/images/ezi.png";
import Api from "@/utils/api";

// ---------- Types ----------
interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  nextBirthday: string;
}

interface StaffAnniversary {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | StaticImageData | null;
  nextAnniversary: string;
  yearsCompleted: number;
}

// ---------- Component ----------
export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Staff[]>([]);
  const [monthAnniversaries, setMonthAnniversaries] = useState<
    StaffAnniversary[]
  >([]);

  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingMonth, setLoadingMonth] = useState(true);

  // Fetch today's birthdays
  useEffect(() => {
    const fetchTodaysBirthdays = async () => {
      try {
        const res = await Api.get<Staff[]>("/staff-register/birthdays/today");
        setTodaysBirthdays(res.data || []);
      } catch (error) {
        console.error("Error fetching today's birthdays:", error);
      } finally {
        setLoadingToday(false);
      }
    };
    fetchTodaysBirthdays();
  }, []);

  // Fetch this month's anniversaries
  useEffect(() => {
    const fetchMonthAnniversaries = async () => {
      try {
        const res = await Api.get<StaffAnniversary[]>(
          "/staff-register/anniversaries/month"
        );
        setMonthAnniversaries(res.data || []);
      } catch (error) {
        console.error("Error fetching this month anniversaries:", error);
      } finally {
        setLoadingMonth(false);
      }
    };
    fetchMonthAnniversaries();
  }, []);

  // Build slides dynamically
  const slides = [
    {
      image: heroimg1,
      text: "Welcome",
    },
    {
      image: todaysBirthdays[0]?.photoUrl || heroimg2,
      text: todaysBirthdays.length
        ? `Happy Birthday ${todaysBirthdays[0].firstName} ${todaysBirthdays[0].lastName}`
        : "Happy Birthday 🎉",
    },
    {
      image: monthAnniversaries[0]?.photoUrl || heroimg3,
      text: monthAnniversaries.length
        ? `Happy ${monthAnniversaries[0].yearsCompleted} Year${
            monthAnniversaries[0].yearsCompleted > 1 ? "s" : ""
          } Anniversary ${monthAnniversaries[0].firstName} ${
            monthAnniversaries[0].lastName
          }`
        : "Happy Work Anniversary 🎊",
    },
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background with gradient */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(rgba(30,30,30,0.5), rgba(0,0,0,0.7)), url(${
            (slides[current].image as StaticImageData).src ??
            slides[current].image
          })`,
          backgroundPosition: "center center",
        }}
      />

      {/* Text content */}
      <div className="relative flex h-full w-full items-center justify-center">
        <h1
          className={`text-white text-3xl md:text-6xl font-bold text-center px-4 transition-all duration-1000 ${
            slides[current].text === "Welcome" ? "translate-y-[-120px]" : ""
          }`}
        >
          {slides[current].text}
        </h1>
      </div>
    </div>
  );
}
