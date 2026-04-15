"use client";

import Link from "next/link";
import { MoveLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d0d0d] px-6 transition-colors duration-300">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 text with gradient */}
        <h1 className="text-[120px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#95D700] to-[#78B500] dark:from-[#a1e508] dark:to-[#86c100] animate-pulse">
          404
        </h1>

        <div className="mt-4 mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Lost in the Squad?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            The page you're looking for doesn't exist or has been moved to a new route.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#95D700] hover:bg-[#86c100] text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#95D700]/20"
          >
            <Home size={18} />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
          >
            <MoveLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="mt-12 p-6 bg-gray-50 dark:bg-[#141414] rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 mb-4 justify-center">
            <Search size={20} className="text-[#95D700]" />
            <span className="font-medium">Try searching for something else</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search features, tasks, staff..."
              className="w-full bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#95D700] dark:text-white transition-all text-sm"
            />
          </div>
        </div>

        <p className="mt-12 text-sm text-gray-400 font-medium tracking-wide uppercase">
          &copy; 2026 Connect Nigeria.
        </p>
      </div>
    </div>
  );
}
