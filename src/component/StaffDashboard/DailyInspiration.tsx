"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import Api from "@/utils/api";

interface Quote {
  id: string;
  subject: string;
  description: string;
  createdBy?: {
    firstName?: string;
    lastName?: string;
  };
}

const DEFAULT_QUOTE: Quote = {
  id: "default",
  subject: "The secret of getting ahead is getting started.",
  description: "Mark Twain",
};

export default function DailyInspiration() {
  const [quote, setQuote] = useState<Quote>(DEFAULT_QUOTE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await Api.get<Quote[]>("/quote/all/today");
        const quotes = res?.data || [];

        if (quotes.length > 0) {
          setQuote(quotes[0]);
        } else {
          setQuote(DEFAULT_QUOTE);
        }
      } catch (error) {
        console.error("Error fetching daily quote:", error);
        setQuote(DEFAULT_QUOTE);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-[#f97316] dark:bg-[#1a1a1a] dark:border dark:border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white mb-4 md:mb-8 transition-colors animate-pulse">
        <div className="h-5 sm:h-6 bg-white/20 rounded w-32 mb-4"></div>
        <div className="h-7 sm:h-8 bg-white/20 rounded mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f97316] dark:bg-[#1a1a1a] dark:border dark:border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white mb-4 md:mb-8 transition-colors">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Sparkles className="w-4 h-4 text-white dark:text-[#86CD23] flex-shrink-0" />
        <span className="text-xs font-bold tracking-widest uppercase dark:text-[#86CD23]">
          Daily Inspiration
        </span>
      </div>

      <blockquote className="text-lg sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 line-clamp-3">
        "{quote.subject}"
      </blockquote>

      <p className="text-xs sm:text-sm dark:text-gray-400 truncate">
        &mdash; {quote.description}
      </p>
    </div>
  );
}
