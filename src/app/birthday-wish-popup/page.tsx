"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Api from "@/utils/api";
import { Send, Sparkles } from "lucide-react";

const DEFAULT_EMOJIS = ["🎂", "🎉", "🥳", "🥂", "🎈", "🎁", "❤️", "✨"];

function BirthdayWishPopupContent() {
  const searchParams = useSearchParams();
  const celebrantUuid = searchParams?.get("celebrantUuid") || "";
  const celebrantName = searchParams?.get("celebrantName") || "Celebrant";
  const quickWishMessage =
    searchParams?.get("quickWishMessage") ||
    `🎉 Happy Birthday, ${celebrantName}! Wishing you a wonderful year ahead filled with joy and success! 🎂🥳`;

  const [wishMessage, setWishMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAppendEmoji = (emoji: string) => {
    setWishMessage((prev) => `${prev}${emoji}`);
  };

  const handleSend = async (customText?: string) => {
    const finalMessage = (customText ?? wishMessage).trim();
    if (!finalMessage) {
      setErrorMsg("Please write a birthday wish or tap Quick Wish!");
      return;
    }

    setSending(true);
    setErrorMsg(null);
    try {
      await Api.post("/birthday/wish", {
        celebrantUuid,
        message: finalMessage,
      });
      setSent(true);
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          "Could not send birthday wish. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#95D700]/40 bg-white dark:bg-[#18181b] shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#78B500] to-[#95D700] px-5 py-4 text-white">
          <h2 className="text-base font-bold">
            🎂 Happy Birthday, {celebrantName}! 🎉
          </h2>
          <p className="text-xs text-white/90 mt-0.5">
            Send a birthday wish straight to {celebrantName}&apos;s DM
          </p>
        </div>

        <div className="p-5 space-y-4">
          {sent ? (
            <div className="py-6 text-center space-y-2">
              <div className="text-4xl">🥳🎂🎉</div>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                Birthday wish sent to DM!
              </p>
              <p className="text-xs text-gray-500">
                Delivered straight to {celebrantName}&apos;s direct messages.
              </p>
            </div>
          ) : (
            <>
              <textarea
                autoFocus
                rows={3}
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Write your birthday wish with emojis for ${celebrantName}... 🎂🎉🥳`}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111113] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#95D700] resize-none"
              />

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-400 mr-1">Add Emojis:</span>
                {DEFAULT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleAppendEmoji(emoji)}
                    className="px-2.5 py-1 text-lg rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-[#95D700]/20 transition-colors cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => handleSend()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#95D700] hover:bg-[#84bf00] text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send size={15} />
                  {sending ? "Sending..." : "Send Wish to DM"}
                </button>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => handleSend(quickWishMessage)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-[#95D700] text-[#5a8200] dark:text-[#95D700] hover:bg-[#95D700]/10 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles size={15} />
                  Quick Wish 🎉
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BirthdayWishPopupPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <BirthdayWishPopupContent />
    </Suspense>
  );
}

