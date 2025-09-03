"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import imgHome from "../../assests/images/cnsquadlogo.png";
import Image from "next/image";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Staff", href: "/staff" },
  { name: "Birthday", href: "/birthday" },
  { name: "Anniversary", href: "/anniversary" },
  { name: "Organogram", href: "/organogram" },
  { name: "Project", href: "/project" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            <div>
              <Image src={imgHome} alt="logo" width={120} height={60} />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex space-x-16 justify-end w-full max-w-2xl">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg text-black-600 hover:text-blue-600 transition"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg h-screen">
          <div className="flex flex-col items-start px-6 py-8 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-gray-700 hover:text-blue-600 transition"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-gray-700 hover:text-blue-600 transition"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )} */}
    </nav>
  );
}
