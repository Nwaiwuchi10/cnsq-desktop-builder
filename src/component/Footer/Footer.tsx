"use client";

import Image from "next/image";
import logo from "../../assests/images/CNSQ.png";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0d0d0d] border-t border-gray-200 dark:border-gray-800 w-full relative transition-colors">
      {/* Container with flex layout strictly mapped to Navbar widths */}
      <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto max-w-[1400px] flex flex-col md:flex-row items-center justify-between py-6 md:py-0 md:h-20 gap-3 md:gap-0">
        {/* Left: Logo */}
        <div className="flex items-center flex-shrink-0 md:mt-2">
          <Image
            src={logo}
            alt="CNSquad Logo"
            width={100}
            height={50}
            unoptimized
          />
        </div>

        {/* Center: Text */}
        <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 text-center flex flex-col md:flex-row md:space-x-1 order-3 md:order-none mt-1 md:mt-0">
          <span className="text-gray-700 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} CNSquad.
          </span>
          <span className="text-gray-700 dark:text-gray-400 text-sm hidden md:inline">All rights reserved.</span>
        </div>

        {/* Right: Made with */}
        <div className="text-sm text-gray-700 dark:text-gray-400 order-2 md:order-none text-center">
          <a
            href="https://cnsq.connectnigeria.com/"
            className="hover:underline font-semibold text-gray-900 dark:text-gray-400"
          >
            cnsquad
          </a>
          {" "}built with ❤️ by{" "}
          <a
            href="https://www.connectnigeria.com/"
            className="hover:underline font-semibold text-gray-900 dark:text-gray-400"
          >
            connectnigeria.com
          </a>
          {" "}powered by Jesus Christ
        </div>
      </div>
    </footer>
  );
} 
