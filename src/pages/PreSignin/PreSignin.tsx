"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/ThemeContext";
import imgLogo from "@/assests/images/CNSQ.png";

export default function PreSignin() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d] flex flex-col items-center justify-center relative transition-colors duration-300">
      {/* Theme Toggle in Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:opacity-80 transition-all shadow-sm"
          aria-label="Toggle Theme"
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10">
        <Image src={imgLogo} alt="CN Squad Logo" width={140} height={50} unoptimized />
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center text-center -mt-20">
        <Image src={imgLogo} alt="CN Squad Logo" width={140} height={50} className="mb-6" unoptimized />
        <h1 className="text-2xl sm:text-[28px] font-bold text-black dark:text-white mb-8">Sign in to access CN Squad</h1>
        <button
          onClick={() => router.push("/login")}
          className="bg-[#95D700] cursor-pointer hover:bg-[#86c200] text-white text-sm font-semibold tracking-wide py-3 px-10 rounded shadow-sm transition-colors uppercase"
        >
          Sign In
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full border-t border-gray-100 dark:border-gray-800 py-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-[13px] tracking-wide">&copy; 2025 CNSquad. All rights reserved.</p>
      </div>
    </div>
  );
}
