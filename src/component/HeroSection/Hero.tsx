"use client";
// Forced rebuild to clear stale lucide-react module factory cache


import { useEffect, useState, useRef, useMemo } from "react";
import Image, { StaticImageData } from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Api from "@/utils/api";
import heroimgLogo from "../../assests/images/cnsquad.png";
import cnThumb from "../../assests/images/cnthumb.png";
import taskThumb from "../../assests/images/taskthumb.png";

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

interface HeroContent {
  id: string;
  title: string;
  description: string;
  tag: string;
  link: string;
  imageUrl: string;
}

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Staff[]>([]);
  const [todaysAnniversaries, setTodaysAnniversaries] = useState<StaffAnniversary[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent[]>([]);
  const [loading, setLoading] = useState(true);
  const textRef = useRef<HTMLDivElement>(null);

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
        const [birthdayRes, anniversaryRes, quoteRes, heroRes] = await Promise.all([
          Api.get<Staff[]>("/staff-register/birthdays/today"),
          Api.get<StaffAnniversary[]>("/staff-register/anniversaries/today"),
          Api.get<Quote[]>("/quote/all/today"),
          Api.get<HeroContent[]>("/hero-content"),
        ]);
        setTodaysBirthdays(birthdayRes?.data || []);
        setTodaysAnniversaries(anniversaryRes?.data || []);
        setQuotes(quoteRes?.data || []);
        setHeroContent(heroRes?.data || []);
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
        "https://res.cloudinary.com/dlrelihio/image/upload/v1777635211/WhatsApp_Image_2026-05-01_at_12_02_46_PM-Picsart-AiImageEnhancer_mb8fsv.jpg",
      // text: "Welcome",
      // image2: heroimgLogo,
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
            ? ` Happy ${years} Year${years > 1 ? "s" : ""} Anniversary ${staff?.firstName} ${staff?.lastName}!`
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

  const isImage = (url: string) => /\.(jpeg|jpg|png|gif|webp|svg)$/i.test(url);
  const isVideo = (url: string) => /\.(mp4|mov|avi|mkv|webm)$/i.test(url);

  // 🧩 Compose slides
  const slides = useMemo(() => {
    let s: any[] = [welcomeSlide];
    if (todaysBirthdays.length > 0 || todaysAnniversaries.length > 0) {
      s = [welcomeSlide, ...birthdaySlides, ...anniversarySlides];
    } else if (quotes.length > 0) {
      const quote = quotes[0];
      if (quote.description) s.push({ type: "quote", quote });
      if (quote?.fileUrl?.length) {
        quote.fileUrl.forEach((url) =>
          s.push({
            type: isImage(url)
              ? "imageQuote"
              : isVideo(url)
                ? "videoQuote"
                : "unsupported",
            url,
          }),
        );
      }
    } else {
      s = [welcomeSlide, ...gallerySlides];
    }
    return s;
  }, [
    todaysBirthdays,
    todaysAnniversaries,
    quotes,
    welcomeSlide,
    birthdaySlides,
    anniversarySlides,
    gallerySlides,
  ]);

  // 🔁 Slide Rotation every 6s
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // 🧠 Preload next image
  useEffect(() => {
    const nextIndex = (current + 1) % slides.length;
    const next = slides[nextIndex];
    if (next?.image || next?.url) {
      const preload = new window.Image();
      preload.src = next.image || next.url;
    }
  }, [current, slides]);

  // 🌀 Smooth quote scrolling
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
    <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden bg-[#141414]">

      {/* ── LEFT 60%: Slideshow ── */}
      <div className="relative w-full lg:w-[100%] h-screen pt-16 lg:pt-0 lg:h-full bg-[#1F3300] overflow-hidden shrink-0">

        {/* Background Media */}
        {currentSlide.type === "videoQuote" ? (
          <video
            src={currentSlide?.url}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover brightness-75"
          />
        ) : currentSlide.type === "imageQuote" || currentSlide.image ? (
          <Image
            src={currentSlide?.url || currentSlide?.image}
            alt="Slide Background"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            loading="eager"
            placeholder="blur"
            blurDataURL="/blur-placeholder.png"
            priority={current === 0}
            className="object-cover brightness-75 object-[center_top] transition-opacity duration-500"
          />
        ) : null}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />

        {/* Slide Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">

          {/* Welcome / Celebration **/}
          {["welcome", "celebration"].includes(currentSlide.type) && (
            <>
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4">
                {currentSlide.text}
              </h1>
              {currentSlide.image2 && (
                <div className="mt-4 w-40 sm:w-52 lg:w-72">
                  <Image
                    src={currentSlide?.image2}
                    alt="Logo"
                    className="w-full h-auto object-contain"
                    loading="lazy"
                  />
                </div>
              )}
            </>
          )}

          {/* Quote */}
          {currentSlide.type === "quote" && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl"
              >
                <div
                  ref={textRef}
                  className="max-h-[55vh] mt-20 overflow-hidden leading-relaxed text-white"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
                  }}
                >
                  <h1 className="text-2xl lg:text-4xl font-semibold">
                    &ldquo;{currentSlide.quote.description}&rdquo;
                  </h1>
                </div>
                <p className="mt-4 text-lg italic">
                  &mdash;{" "}
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

      {/* ── RIGHT 40%: Cards ── */}

    </div>
  );
}
