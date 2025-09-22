"use client";

import Image from "next/image";
import logo from "../../assests/images/cnsquadlogo.png";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 h-16 flex items-center px-6 relative">
      {/* Container with flex layout */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between pt-12 pb-6">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Image
            src={logo}
            alt="CNSquad Logo"
            className="w-20 sm:w-24 h-auto md:w-32 h-auto lg:w-28 h-20"
            priority
          />
        </div>

        {/* Center: Text */}
        <div
          className="
        absolute left-1/2 transform -translate-x-1/2 text-center
        flex flex-col md:flex-row md:space-x-1
      "
        >
          {/* Year */}
          <span className="text-gray-700 text-sm">
            © {new Date().getFullYear()} CNSquad.
          </span>
          {/* Rights Reserved */}
          <span className="text-gray-700 text-sm">All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
