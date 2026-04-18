"use client";

import { useEffect, useState, useMemo } from "react";
import Image, { StaticImageData } from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, ExternalLink, Globe } from "lucide-react";
import Api from "@/utils/api";
import heroimgLogo from "../../assests/images/cnsquad.png";
import taskThumb from "../../assests/images/task_thumb.png";
import cnThumb from "../../assests/images/cn_thumb.png";


interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

interface StaffAnniversary {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | StaticImageData | null;
  yearsCompleted: number;
}

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Staff[]>([]);
  const [todaysAnniversaries, setTodaysAnniversaries] = useState<
    StaffAnniversary[]
  >([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Pre-calculate frequently used URLs for instant availability
  const defaultImages = useMemo(
    () => ({
      defaultBirthday:
        "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308078/DSC00141-Picsart-AiImageEnhancer_kyidxc.jpg",
      defaultAnniversary:
        "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308208/DSC00139-Picsart-AiImageEnhancer_mcpt2r.jpg",
    }),
    [],
  );

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [birthdayRes, anniversaryRes] = await Promise.all([
          Api.get<Staff[]>("/staff-register/birthdays/today"),
          Api.get<StaffAnniversary[]>("/staff-register/anniversaries/today"),
        ]);
        setTodaysBirthdays(birthdayRes?.data || []);
        setTodaysAnniversaries(anniversaryRes?.data || []);
      } catch (error) {
        console.error("Error fetching hero data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const welcomeSlide = useMemo(
    () => ({
      image:
        "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760307934/cn-team-Picsart-AiImageEnhancer_ti53lc.jpg",
      text: "Welcome",
      image2: heroimgLogo,
      type: "welcome",
    }),
    [],
  );

  // 🎂 Birthdays
  const birthdaySlides = useMemo(
    () =>
      todaysBirthdays.map((staff) => ({
        image: staff?.photoUrl || defaultImages.defaultBirthday,
        text: ` Happy Birthday ${staff?.firstName} ${staff?.lastName}!`,
        type: "celebration",
      })),
    [todaysBirthdays, defaultImages],
  );

  // 🎉 Anniversaries
  const anniversarySlides = useMemo(
    () =>
      todaysAnniversaries.map((staff) => {
        const years = staff?.yearsCompleted || 0;
        const anniversaryText =
          years > 0
            ? ` Happy ${years} Year${years > 1 ? "s" : ""} Anniversary ${staff?.firstName
            } ${staff?.lastName}!`
            : ` Happy Anniversary ${staff?.firstName} ${staff?.lastName}!`;
        return {
          image: staff?.photoUrl || defaultImages.defaultAnniversary,
          text: anniversaryText,
          type: "celebration",
        };
      }),
    [todaysAnniversaries, defaultImages],
  );

  // 🖼️ Default gallery slides
  const gallerySlides = useMemo(
    () => [
      {
        image:
          "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308078/DSC00141-Picsart-AiImageEnhancer_kyidxc.jpg",
        text: "",
        type: "gallery",
      },
      {
        image:
          "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308208/DSC00139-Picsart-AiImageEnhancer_mcpt2r.jpg",
        text: "",
        type: "gallery",
      },
      {
        image:
          "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308313/DSC00153-Picsart-AiImageEnhancer_wwbr54.jpg",
        text: "",
        type: "gallery",
      },
      {
        image:
          "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308387/DSC00151-Picsart-AiImageEnhancer_knw3qh.jpg",
        text: "",
        type: "gallery",
      },
      {
        image:
          "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308443/DSC00159-Picsart-AiImageEnhancer_gd2fv6.jpg",
        text: "",
        type: "gallery",
      },
    ],
    [],
  );

  const slides = useMemo(() => {
    let s: any[] = [welcomeSlide];
    if (todaysBirthdays.length > 0 || todaysAnniversaries.length > 0) {
      s = [welcomeSlide, ...birthdaySlides, ...anniversarySlides];
    } else {
      s = [welcomeSlide, ...gallerySlides];
    }
    return s;
  }, [
    todaysBirthdays,
    todaysAnniversaries,
    welcomeSlide,
    birthdaySlides,
    anniversarySlides,
    gallerySlides,
  ]);

  // 🔁 Faster Slide Rotation (now every 6s instead of 10s)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // 🧠 Preload next image (browser cache)
  useEffect(() => {
    const nextIndex = (current + 1) % slides.length;
    const next = slides[nextIndex];
    if (next?.image || next?.url) {
      const preload = new window.Image();
      preload.src = next.image || next.url;
    }
  }, [current, slides]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] md:h-[700px] bg-black text-white text-2xl">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const currentSlide = slides[current];

  return (
    <div className="w-full h-auto min-h-[550px] md:h-[700px] overflow-hidden bg-[#121212]">
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Section - Dynamic slides */}
        <div className="relative w-full md:w-[60%] h-[400px] md:h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {currentSlide.image && (
                <Image
                  src={currentSlide.image}
                  alt="Slide Background"
                  fill
                  className="object-cover brightness-[0.6] transition-opacity duration-1000 object-[center_top]"
                  priority={current === 0}
                  unoptimized={false}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
                {["welcome", "celebration"].includes(currentSlide.type) && (
                  <>
                    <motion.h1
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl md:text-7xl font-black mb-6 drop-shadow-2xl"
                    >
                      {currentSlide.text}
                    </motion.h1>
                    {currentSlide.image2 && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 w-[240px] md:w-[350px]"
                      >
                        <Image
                          src={currentSlide.image2}
                          alt="CNSquad Logo"
                          className="w-full h-auto object-contain drop-shadow-lg"
                        />
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Section - Static features */}
        <div className="w-full md:w-[40%] h-full p-8 md:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5 relative bg-[#121212] z-20 min-h-[400px]">


          <div className="space-y-6 md:space-y-8">
            {/* Card 1: Task Tracking */}
            <div className="bg-[#1a1a1a]/95 backdrop-blur-md rounded-[24px] p-5 border border-white/5 hover:border-[#86CD23]/30 transition-all duration-300 group cursor-pointer shadow-2xl overflow-hidden relative">
              <div className="flex gap-5 items-center">
                <div className="w-24 h-16 md:w-32 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 shadow-inner">
                  <Image
                    src={taskThumb}
                    alt="Task Dashboard"
                    fill={false} // Use fixed sizing for card thumbnails
                    width={128}
                    height={80}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-extrabold text-lg md:text-xl text-white group-hover:text-[#86CD23] transition-colors leading-tight">Task Tracking</h3>
                    <ExternalLink size={18} className="text-white/30 group-hover:text-white/80 transition-opacity" />
                  </div>
                  <div className="inline-flex px-2 py-0.5 rounded-md bg-[#86CD23]/10 text-[9px] font-black text-[#86CD23] mb-2 uppercase tracking-widest border border-[#86CD23]/20">Management</div>
                  <p className="text-xs text-white/50 font-medium leading-[1.5]">Professional task board with real-time updates and team collaboration.</p>
                </div>
              </div>
            </div>

            {/* Card 2: Connect Nigeria */}
            <div className="bg-[#1a1a1a]/95 backdrop-blur-md rounded-[24px] p-5 border border-white/5 hover:border-[#86CD23]/30 transition-all duration-300 group cursor-pointer shadow-2xl overflow-hidden relative">
              <div className="flex gap-5 items-center">
                <div className="w-24 h-16 md:w-32 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 shadow-inner">
                  <Image
                    src={cnThumb}
                    alt="Connect Nigeria"
                    width={128}
                    height={80}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-extrabold text-lg md:text-xl text-white group-hover:text-[#86CD23] transition-colors leading-tight">Connect Nigeria</h3>
                    <ExternalLink size={18} className="text-white/30 group-hover:text-white/80 transition-opacity" />
                  </div>
                  <div className="inline-flex px-2 py-0.5 rounded-md bg-[#86CD23]/10 text-[9px] font-black text-[#86CD23] mb-2 uppercase tracking-widest border border-[#86CD23]/20">E-Commerce</div>
                  <p className="text-xs text-white/50 font-medium leading-[1.5]">Trusted marketplace to buy and sell authentic products across Nigeria.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-white/20"></div>
              <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Empowering Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
