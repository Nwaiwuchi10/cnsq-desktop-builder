"use client";

import { useEffect, useState, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Api from "@/utils/api";
import heroimgLogo from "../../assests/images/cnsquad.png";

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

interface Quote {
  id: string;
  subject: string;
  description: string;
  fileUrl?: string[];
  createdBy?: {
    firstName?: string;
    lastName?: string;
  };
}

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Staff[]>([]);
  const [todaysAnniversaries, setTodaysAnniversaries] = useState<
    StaffAnniversary[]
  >([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const textRef = useRef<HTMLDivElement>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [birthdayRes, anniversaryRes, quoteRes] = await Promise.all([
          Api.get<Staff[]>("/staff-register/birthdays/today"),
          Api.get<StaffAnniversary[]>("/staff-register/anniversaries/today"),
          Api.get<Quote[]>("/quote/all/today"),
        ]);
        setTodaysBirthdays(birthdayRes.data || []);
        setTodaysAnniversaries(anniversaryRes.data || []);
        setQuotes(quoteRes.data || []);
      } catch (error) {
        console.error("Error fetching hero data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const welcomeSlide = {
    image:
      "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760307934/cn-team-Picsart-AiImageEnhancer_ti53lc.jpg",
    text: "Welcome",
    image2: heroimgLogo,
    type: "welcome",
  };

  // 🎂 Birthdays
  const birthdaySlides = todaysBirthdays.map((staff) => ({
    image:
      staff.photoUrl ||
      "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308078/DSC00141-Picsart-AiImageEnhancer_kyidxc.jpg",
    text: ` Happy Birthday ${staff.firstName} ${staff.lastName}!`,
    type: "celebration",
  }));

  // 🎉 Anniversaries (handle 0 years)
  const anniversarySlides = todaysAnniversaries.map((staff) => {
    const years = staff.yearsCompleted || 0;
    const anniversaryText =
      years > 0
        ? ` Happy ${years} Year${years > 1 ? "s" : ""} Anniversary ${
            staff.firstName
          } ${staff.lastName}!`
        : ` Happy Anniversary ${staff.firstName} ${staff.lastName}!`;
    return {
      image:
        staff.photoUrl ||
        "https://res.cloudinary.com/dk1hvevsa/image/upload/v1760308208/DSC00139-Picsart-AiImageEnhancer_mcpt2r.jpg",
      text: anniversaryText,
      type: "celebration",
    };
  });

  // 🖼️ Default gallery slides
  const gallerySlides = [
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
  ];

  // 🧠 Detect if file is image/video
  const isImage = (url: string) => /\.(jpeg|jpg|png|gif|webp|svg)$/i.test(url);
  const isVideo = (url: string) => /\.(mp4|mov|avi|mkv|webm)$/i.test(url);

  // 🧩 Compose slides dynamically
  let slides: any[] = [welcomeSlide];

  if (todaysBirthdays.length > 0 || todaysAnniversaries.length > 0) {
    // 🎂 Celebration only
    slides = [welcomeSlide, ...birthdaySlides, ...anniversarySlides];
  } else if (quotes.length > 0) {
    const quote = quotes[0];

    // 1️⃣ If quote has description, show quote slide
    if (quote.description) {
      slides.push({ type: "quote", quote });
    }

    // 2️⃣ If quote has media, show each as a slide
    if (quote.fileUrl && quote.fileUrl.length > 0) {
      quote.fileUrl.forEach((url) => {
        slides.push({
          type: isImage(url)
            ? "imageQuote"
            : isVideo(url)
            ? "videoQuote"
            : "unsupported",
          url,
        });
      });
    }
  } else {
    // 🖼️ Default fallback gallery
    slides = [welcomeSlide, ...gallerySlides];
  }

  // 🔁 Auto slide
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // 🌀 Scroll animation for quote
  useEffect(() => {
    const textEl = textRef.current;
    if (!textEl || slides[current]?.type !== "quote") return;
    textEl.scrollTop = 0;
    const scrollDistance = textEl.scrollHeight - textEl.clientHeight;
    if (scrollDistance <= 0) return;
    const duration = 40000;
    let start = performance.now();
    let dir: "down" | "up" = "down";

    const scrollAnim = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      textEl.scrollTop =
        dir === "down"
          ? scrollDistance * progress
          : scrollDistance * (1 - progress);
      if (progress >= 1) {
        dir = dir === "down" ? "up" : "down";
        start = time;
      }
      requestAnimationFrame(scrollAnim);
    };
    requestAnimationFrame(scrollAnim);
  }, [current, slides]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-2xl">
        Loading...
      </div>
    );
  }

  const currentSlide = slides[current];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1F3300]">
      {/* 🖼️ Background / Media */}
      {currentSlide.type === "videoQuote" ? (
        <video
          src={currentSlide.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
      ) : currentSlide.type === "imageQuote" || currentSlide.image ? (
        <Image
          src={currentSlide.url || currentSlide.image}
          alt="Slide Background"
          fill
          unoptimized
          className="object-cover brightness-75 transition-opacity duration-600  object-cover object-[center_top]"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />

      {/* 🧾 Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
        {/* Welcome / Celebration */}
        {["welcome", "celebration"].includes(currentSlide.type) && (
          <>
            <h1 className="text-3xl md:text-6xl font-bold mb-4">
              {currentSlide.text}
            </h1>
            {currentSlide.image2 && (
              <div className="mt-4 w-[200px] md:w-[300px]">
                <Image
                  src={currentSlide.image2}
                  alt="Logo"
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
          </>
        )}

        {/* Quote with description */}
        {currentSlide.type === "quote" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.quote.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <div
                ref={textRef}
                className="max-h-[55vh] mt-20 overflow-hidden leading-relaxed text-white scrollbar-hide "
                style={{
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
                }}
              >
                <h1 className="text-3xl md:text-4xl font-semibold">
                  “{currentSlide.quote.description}”
                </h1>
              </div>

              <p className="mt-4 text-lg italic">
                —{" "}
                {currentSlide.quote.createdBy?.firstName
                  ? `${currentSlide.quote.createdBy.firstName} ${currentSlide.quote.createdBy.lastName}`
                  : "Unknown"}
              </p>
              <p className="mt-2 text-base opacity-80">
                {currentSlide.quote.subject}
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
