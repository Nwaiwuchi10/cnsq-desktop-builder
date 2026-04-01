"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function DailyInspiration() {
  return (
    <div className="w-full bg-[#f97316] dark:bg-[#1a1a1a] dark:border dark:border-gray-800 rounded-2xl p-6 md:p-8 text-white mb-8 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-white dark:text-[#86CD23]" />
        <span className="text-xs font-bold tracking-widest uppercase dark:text-[#86CD23]">Daily Inspiration</span>
      </div>
      
      <blockquote className="text-2xl md:text-3xl font-bold mb-4">
        "The secret of getting ahead is getting started."
      </blockquote>
      
      <p className="text-sm dark:text-gray-400">
        &mdash; Mark Twain
      </p>
    </div>
  );
}
