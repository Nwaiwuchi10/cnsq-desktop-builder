"use client";

import { useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
// import heroimg1 from "../../assests/images/cn-team-Picsart-AiImageEnhancer.jpg";
// import heroimg2 from "../../assests/images/DSC00141-Picsart-AiImageEnhancer.jpg";
// import heroimg3 from "../../assests/images/DSC00139-Picsart-AiImageEnhancer.jpg";
// import heroimg4 from "../../assests/images/DSC00153-Picsart-AiImageEnhancer.jpg";
// import heroimg5 from "../../assests/images/DSC00151-Picsart-AiImageEnhancer.jpg";
// // import heroimg6 from "../../assests/images/DSC00104-Picsart-AiImageEnhancer.jpg";
// import heroimg7 from "../../assests/images/DSC00159-Picsart-AiImageEnhancer.jpg";
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

  // ---------- Slides ----------
  const welcomeSlide = {
    image:
      "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760307934/cn-team-Picsart-AiImageEnhancer_ti53lc.jpg",
    text: "Welcome",
    image2: heroimgLogo,
  };

  const birthdaySlides = todaysBirthdays.map((staff) => ({
    image:
      staff.photoUrl ||
      "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308078/DSC00141-Picsart-AiImageEnhancer_kyidxc.jpg",
    text: `Happy Birthday ${staff.firstName} ${staff.lastName}`,
  }));

  const anniversarySlides = todaysAnniversaries.map((staff) => ({
    image:
      staff.photoUrl ||
      "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308208/DSC00139-Picsart-AiImageEnhancer_mcpt2r.jpg",
    text: `Happy ${staff?.yearsCompleted} Year${
      staff.yearsCompleted > 1 ? "s" : ""
    } Anniversary ${staff.firstName} ${staff.lastName}`,
  }));

  const gallerySlides = [
    {
      image:
        "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308078/DSC00141-Picsart-AiImageEnhancer_kyidxc.jpg",
      text: "",
    },
    {
      image:
        "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308208/DSC00139-Picsart-AiImageEnhancer_mcpt2r.jpg",
      text: "",
    },
    {
      image:
        "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308313/DSC00153-Picsart-AiImageEnhancer_wwbr54.jpg",
      text: "",
    },
    {
      image:
        "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308387/DSC00151-Picsart-AiImageEnhancer_knw3qh.jpg",
      text: "",
    },
    // { image: heroimg6, text: "" },
    {
      image:
        "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308443/DSC00159-Picsart-AiImageEnhancer_gd2fv6.jpg",
      text: "",
    },
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

  // ---------- Preload Images ----------
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new window.Image();
      img.src =
        (slide.image as StaticImageData)?.src ?? (slide.image as string);
    });
  }, [slides]);

  // ---------- Auto Slide ----------
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
  const currentSlide = slides[current];
  const currentImage =
    (currentSlide.image as StaticImageData)?.src ??
    (currentSlide.image as string);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Optimized background */}
      <div className="absolute inset-0">
        <Image
          key={currentImage}
          src={currentImage}
          alt="Hero background"
          fill
          unoptimized
          priority={current === 0}
          loading={current === 0 ? "eager" : "lazy"}
          quality={85}
          className="transition-opacity duration-600 ease-in-out brightness-75 object-cover object-[center_top]"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
      </div>

      {/* Text content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-4 text-center">
        {currentSlide.text && (
          <h1
            className={`text-white text-3xl md:text-6xl font-bold transition-all duration-1000 ${
              currentSlide.text === "Welcome" ? "mb-6" : ""
            }`}
          >
            {currentSlide.text}
          </h1>
        )}

        {currentSlide.image2 && (
          <div className="mt-4 w-[200px] md:w-[300px]">
            <Image
              src={currentSlide.image2 as StaticImageData}
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
