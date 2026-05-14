"use client";

import Image from "next/image";
import logo from "../../assests/images/CNSQ.png";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0d0d0d] border-t border-gray-200 dark:border-gray-800 w-full relative transition-colors">
      {/* Container with flex layout strictly mapped to Navbar widths */}
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto max-w-[1400px] flex items-center justify-between h-20">
        {/* Left: Logo */}
        <div className="flex items-center flex-shrink-0 mt-2">
          <Image
            src={logo}
            alt="CNSquad Logo"
            width={100}
            height={50}
            unoptimized
          />
        </div>

        {/* Center: Text */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center flex flex-col md:flex-row md:space-x-1">
          <span className="text-gray-700 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} CNSquad.
          </span>
          <span className="text-gray-700 dark:text-gray-400 text-sm hidden md:inline">All rights reserved.</span>
        </div>

        {/* Right: Made with */}
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-400">
          Made with ❤️ by ConnectNigeria
        </div>
      </div>
    </footer>
  );
}
