"use client";

import { useEffect } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";

interface CustomModalProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export default function CustomModal({
  type,
  message,
  onClose,
}: CustomModalProps) {
  // Auto close after 10s
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm relative p-6 text-center">
        {/* Close button top right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <CheckCircle2 size={50} className="text-[#78B500]" />
          ) : (
            <XCircle size={50} className="text-red-500" />
          )}
        </div>

        {/* Message */}
        <p className="text-gray-800 text-base mb-6">{message}</p>

        {/* Close Button */}
        <button
          style={{ cursor: "pointer" }}
          onClick={onClose}
          className="bg-[#95D700] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90"
        >
          Close
        </button>
      </div>
    </div>
  );
}
