"use client";

import React, { useEffect, useRef, useState } from "react";
import Api from "@/utils/api";
import { Send, Sparkles, X } from "lucide-react";

interface BirthdayPushData {
  celebrantUuid: string;
  celebrantName: string;
  replyEndpoint?: string;
  quickWishMessage?: string;
  emojiSuggestions?: string[];
}

const DEFAULT_EMOJIS = ["🎂", "🎉", "🥳", "🥂", "🎈", "🎁", "❤️", "✨"];

export default function BirthdayWishPopup() {
  // Queue of birthday celebrants so multiple birthdays on the same day appear one after the other
  const [birthdayQueue, setBirthdayQueue] = useState<BirthdayPushData[]>([]);
  const [wishMessage, setWishMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const activeBirthday = birthdayQueue[0] || null;

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleSwMessage = (event: MessageEvent) => {
      const msgType = event.data?.type;
      if (
        msgType === "BIRTHDAY_PUSH_RECEIVED" ||
        msgType === "OPEN_BIRTHDAY_WISH_POPUP"
      ) {
        const payload = event.data?.data || {};
        if (payload.celebrantUuid) {
          const item: BirthdayPushData = {
            celebrantUuid: payload.celebrantUuid,
            celebrantName: payload.celebrantName || "Celebrant",
            replyEndpoint: payload.replyEndpoint || "/birthday/wish",
            quickWishMessage:
              payload.quickWishMessage ||
              `🎉 Happy Birthday, ${payload.celebrantName || ""}! Wishing you a wonderful year ahead filled with joy and success! 🎂`,
            emojiSuggestions:
              Array.isArray(payload.emojiSuggestions) &&
              payload.emojiSuggestions.length > 0
                ? payload.emojiSuggestions
                : DEFAULT_EMOJIS,
          };

          setBirthdayQueue((prev) => {
            // If user explicitly clicked a specific celebrant's OS notification, bring them to the front
            if (msgType === "OPEN_BIRTHDAY_WISH_POPUP") {
              const filtered = prev.filter(
                (b) => b.celebrantUuid !== item.celebrantUuid,
              );
              return [item, ...filtered];
            }
            // Otherwise append to queue if not already queued, so they show one after the other
            if (prev.some((b) => b.celebrantUuid === item.celebrantUuid)) {
              return prev;
            }
            return [...prev, item];
          });
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSwMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSwMessage);
    };
  }, []);

  useEffect(() => {
    if (activeBirthday && !sentSuccess) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [activeBirthday?.celebrantUuid, sentSuccess]);

  if (!activeBirthday) return null;

  const emojis = activeBirthday.emojiSuggestions || DEFAULT_EMOJIS;

  const advanceQueue = () => {
    setSentSuccess(false);
    setErrorMsg(null);
    setWishMessage("");
    setBirthdayQueue((prev) => prev.slice(1));
  };

  const handleAppendEmoji = (emoji: string) => {
    setWishMessage((prev) => `${prev}${emoji}`);
    inputRef.current?.focus();
  };

  const handleSendWish = async (customText?: string) => {
    const finalMessage = (customText ?? wishMessage).trim();
    if (!finalMessage) {
      setErrorMsg("Please type a birthday wish or tap Quick Wish!");
      return;
    }

    setSending(true);
    setErrorMsg(null);
    try {
      await Api.post(activeBirthday.replyEndpoint || "/birthday/wish", {
        celebrantUuid: activeBirthday.celebrantUuid,
        message: finalMessage,
      });
      setSentSuccess(true);
      setWishMessage("");
      setTimeout(() => {
        advanceQueue();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to send birthday wish. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] w-full max-w-sm animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="rounded-2xl border border-[#95D700]/40 bg-white dark:bg-[#18181b] shadow-2xl overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-[#78B500] to-[#95D700] px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎂</span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold leading-tight">
                  Happy Birthday, {activeBirthday.celebrantName}! 🎉
                </h4>
                {birthdayQueue.length > 1 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/25 font-semibold whitespace-nowrap">
                    +{birthdayQueue.length - 1} more
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/90">
                Drop a birthday wish straight to their DM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={advanceQueue}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close birthday wish pop-up"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {sentSuccess ? (
            <div className="py-4 text-center space-y-1">
              <div className="text-3xl">🥳🎂🎉</div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Birthday wish sent to DM!
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Delivered straight to {activeBirthday.celebrantName}&apos;s
                direct messages.
              </p>
            </div>
          ) : (
            <>
              <textarea
                ref={inputRef}
                rows={2}
                value={wishMessage}
                onChange={(e) => setWishMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendWish();
                  }
                }}
                placeholder={`Write a birthday wish for ${activeBirthday.celebrantName}... 🎂🎉`}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111113] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#95D700] resize-none"
              />

              {/* Emoji Picker Row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-gray-400 mr-1">Emojis:</span>
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleAppendEmoji(emoji)}
                    className="px-2 py-1 text-base rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-[#95D700]/20 transition-colors cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => handleSendWish()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#95D700] hover:bg-[#84bf00] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send size={14} />
                  {sending ? "Sending..." : "Send Wish to DM"}
                </button>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() =>
                    handleSendWish(activeBirthday.quickWishMessage)
                  }
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-[#95D700] text-[#5a8200] dark:text-[#95D700] hover:bg-[#95D700]/10 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  title="Send instant birthday wish"
                >
                  <Sparkles size={14} />
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
