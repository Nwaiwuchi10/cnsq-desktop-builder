// "use client";

// import { useEffect, useState } from "react";
// import Image, { StaticImageData } from "next/image";
// import heroimg1 from "../../assests/images/cn-team.jpg";
// import heroimg2 from "../../assests/images/ezinne.jpg";
// import heroimg3 from "../../assests/images/ezi.png";
// import heroimgLogo from "../../assests/images/cnsquad.png";
// import Api from "@/utils/api";

// // ---------- Types ----------
// interface Staff {
//   id: string;
//   firstName: string;
//   lastName: string;
//   photoUrl?: string | null;
//   nextBirthday: string;
// }

// interface StaffAnniversary {
//   id: number;
//   firstName: string;
//   lastName: string;
//   photoUrl?: string | StaticImageData | null;
//   nextAnniversary: string;
//   yearsCompleted: number;
// }

// // ---------- Component ----------
// export default function Hero() {
//   const [current, setCurrent] = useState(0);
//   const [todaysBirthdays, setTodaysBirthdays] = useState<Staff[]>([]);
//   const [monthAnniversaries, setMonthAnniversaries] = useState<
//     StaffAnniversary[]
//   >([]);

//   const [loadingToday, setLoadingToday] = useState(true);
//   const [loadingMonth, setLoadingMonth] = useState(true);

//   // Fetch today's birthdays
//   useEffect(() => {
//     const fetchTodaysBirthdays = async () => {
//       try {
//         const res = await Api.get<Staff[]>("/staff-register/birthdays/today");
//         setTodaysBirthdays(res.data || []);
//       } catch (error) {
//         console.error("Error fetching today's birthdays:", error);
//       } finally {
//         setLoadingToday(false);
//       }
//     };
//     fetchTodaysBirthdays();
//   }, []);

//   // Fetch this month's anniversaries
//   useEffect(() => {
//     const fetchMonthAnniversaries = async () => {
//       try {
//         const res = await Api.get<StaffAnniversary[]>(
//           "/staff-register/anniversaries/month"
//         );
//         setMonthAnniversaries(res.data || []);
//       } catch (error) {
//         console.error("Error fetching this month anniversaries:", error);
//       } finally {
//         setLoadingMonth(false);
//       }
//     };
//     fetchMonthAnniversaries();
//   }, []);

//   // Build slides dynamically
//   const slides = [
//     {
//       image: heroimg1,
//       text: "Welcome",
//       image2: heroimgLogo,
//     },
//     {
//       image: todaysBirthdays[0]?.photoUrl || heroimg2,
//       text: todaysBirthdays.length
//         ? `Happy Birthday ${todaysBirthdays[0].firstName} ${todaysBirthdays[0].lastName}`
//         : "Happy Birthday",
//     },
//     {
//       image: monthAnniversaries[0]?.photoUrl || heroimg3,
//       text: monthAnniversaries.length
//         ? `Happy ${monthAnniversaries[0].yearsCompleted} Year${
//             monthAnniversaries[0].yearsCompleted > 1 ? "s" : ""
//           } Anniversary ${monthAnniversaries[0].firstName} ${
//             monthAnniversaries[0].lastName
//           }`
//         : "Happy Work Anniversary",
//     },
//   ];

//   // Auto slide effect
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrent((prev) => (prev + 1) % slides.length);
//     }, 5000);
//     return () => clearInterval(timer);
//   }, [slides.length]);

//   return (
//     <div className="relative w-full h-screen overflow-hidden">
//       {/* Background with gradient */}
//       <div
//         className="absolute top-0 left-0 w-full h-full transition-all duration-1000 bg-cover"
//         style={{
//           backgroundImage: `linear-gradient(rgba(30,30,30,0.5), rgba(0,0,0,0.7)), url(${
//             (slides[current].image as StaticImageData).src ??
//             slides[current].image
//           })`,
//           backgroundPosition: "center top", // shift focus up to avoid cutting heads
//           backgroundRepeat: "no-repeat",
//         }}
//       />

//       {/* Text content */}
//       <div className="relative flex flex-col items-center justify-center h-full w-full px-4">
//         <h1
//           className={`text-white text-3xl md:text-6xl font-bold text-center transition-all duration-1000 ${
//             slides[current].text === "Welcome" ? "mb-6" : ""
//           }`}
//         >
//           {slides[current].text}
//         </h1>

//         {/* If slide has a second image (like logo), show it */}
//         {slides[current].image2 && (
//           <div className="mt-4 w-[200px] md:w-[300px]">
//             <Image
//               src={slides[current].image2 as StaticImageData}
//               alt="Logo"
//               className="w-full h-auto object-contain"
//               priority
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import heroimg1 from "../../assests/images/cn-team-Picsart-AiImageEnhancer.jpg";
import heroimg2 from "../../assests/images/DSC00141-Picsart-AiImageEnhancer.jpg";
import heroimg3 from "../../assests/images/DSC00139-Picsart-AiImageEnhancer.jpg";
import heroimg4 from "../../assests/images/DSC00153-Picsart-AiImageEnhancer.jpg";
import heroimg5 from "../../assests/images/DSC00151-Picsart-AiImageEnhancer.jpg";
import heroimg6 from "../../assests/images/DSC00104-Picsart-AiImageEnhancer.jpg";
import heroimg7 from "../../assests/images/DSC00159-Picsart-AiImageEnhancer.jpg";

import heroimgLogo from "../../assests/images/cnsquad.png";
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
  const [todaysAnniversaries, setTodaysAnniversaries] = useState<
    StaffAnniversary[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Nigeria time helper
  const getNigeriaDate = () => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));
  };

  // ---------- Fetch Data ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [birthdayRes, anniversaryRes] = await Promise.all([
          Api.get<Staff[]>("/staff-register/birthdays/today"),
          Api.get<StaffAnniversary[]>("/staff-register/anniversaries/today"),
        ]);

        setTodaysBirthdays(birthdayRes.data || []);
        setTodaysAnniversaries(anniversaryRes.data || []);
      } catch (error) {
        console.error("Error fetching hero data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ---------- Slides Building Logic ----------
  const welcomeSlide = {
    image: heroimg1,
    text: "Welcome",
    image2: heroimgLogo,
  };

  const birthdaySlides = todaysBirthdays.map((staff) => ({
    image: staff.photoUrl || heroimg2,
    text: `Happy Birthday ${staff.firstName} ${staff.lastName}`,
  }));

  const anniversarySlides = todaysAnniversaries.map((staff) => ({
    image: staff.photoUrl || heroimg3,
    text: `Happy ${staff.yearsCompleted} Year${
      staff.yearsCompleted > 1 ? "s" : ""
    } Anniversary ${staff.firstName} ${staff.lastName}`,
  }));

  const gallerySlides = [
    { image: heroimg2, text: "" },
    { image: heroimg3, text: "" },
    { image: heroimg4, text: "" },
    { image: heroimg5, text: "" },
    { image: heroimg6, text: "" },
    { image: heroimg7, text: "" },
  ];

  let slides: {
    image: string | StaticImageData;
    text: string;
    image2?: any;
  }[] = [];

  if (todaysBirthdays.length > 0 || todaysAnniversaries.length > 0) {
    slides = [welcomeSlide, ...birthdaySlides, ...anniversarySlides];
  } else {
    slides = [welcomeSlide, ...gallerySlides];
  }

  // ---------- Auto Slide Effect ----------
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-2xl">
        Loading...
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background with gradient */}
      <div
        className="absolute top-0 left-0 w-full h-full transition-all duration-500 bg-cover"
        style={{
          backgroundImage: `linear-gradient(rgba(30,30,30,0.5), rgba(0,0,0,0.7)), url(${
            (slides[current].image as StaticImageData)?.src ??
            slides[current].image
          })`,
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Text content */}
      <div className="relative flex flex-col items-center justify-center h-full w-full px-4">
        {slides[current].text && (
          <h1
            className={`text-white text-3xl md:text-6xl font-bold text-center transition-all duration-1000 ${
              slides[current].text === "Welcome" ? "mb-6" : ""
            }`}
          >
            {slides[current].text}
          </h1>
        )}

        {slides[current].image2 && (
          <div className="mt-4 w-[200px] md:w-[300px]">
            <Image
              src={slides[current].image2 as StaticImageData}
              alt="Logo"
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        )}
      </div>
    </div>
  );
}
