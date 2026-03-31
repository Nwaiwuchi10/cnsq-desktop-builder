"use client";

import { useState } from "react";
import Api from "@/utils/api";
import CustomModal from "@/component/Message/Message";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      setModal({
        type: "error",
        message: "Email is required.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await Api.post("/staff-register/forgot-password", { email });

      setModal({
        type: "success",
        message: res.data.message || "Password reset link sent to your email.",
      });
    } catch (error: any) {
      setModal({
        type: "error",
        message: error.response?.data?.message || "Failed to send email.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white font-sans">
      {/* Left side: Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12">
        <div className="w-full max-w-[380px] mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <img src="/CNSQ.png" alt="CN Squad" className="h-[46px] w-auto" />
          </div>

          {/* Headers */}
          <h1 className="text-[28px] font-bold text-[#141414] mb-1.5 tracking-tight">Forgot Password</h1>
          <p className="text-gray-500 text-[15px] mb-10">Enter your email address to reset your password.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[4px] border border-gray-100 px-3 py-3 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#95D700] focus:border-[#95D700]"
                placeholder="example@email.com"
              />
            </div>
          </div>

          {/* Modal Overlay / Error */}
          {modal && (
            <div className="mt-4">
              <CustomModal
                type={modal.type}
                message={modal.message}
                onClose={() => setModal(null)}
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-[14px] rounded-[4px] bg-[#95D700] text-white font-bold text-[13px] tracking-widest uppercase hover:bg-[#86c100] disabled:opacity-60 transition-colors shadow-sm cursor-pointer"
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </div>

          <div className="flex justify-start mt-6 mb-4">
            <a href="/login" className="text-[13px] text-gray-500 font-medium hover:text-[#95D700] transition-colors">
              &larr; Back to Login
            </a>
          </div>

          <p className="mt-16 text-left text-xs text-gray-400 font-medium">
            &copy; 2026 Connect Nigeria. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side: Banner Info */}
      <div className="hidden md:flex flex-col md:w-1/2 bg-[#1b2b0f] items-center justify-center p-12 text-center relative overflow-hidden">
        <div className="flex items-center justify-center w-full max-w-[320px] lg:max-w-md mb-12">
          <img src="/login-hero.png" alt="Your team, connected" className="w-[85%] h-auto max-h-[400px] object-contain rounded-2xl drop-shadow-2xl" />
        </div>
        
        <div className="max-w-[420px] z-10">
          <h2 className="text-2xl lg:text-[28px] font-bold text-white mb-4 tracking-tight leading-tight">
            Your team, organized and <br/> connected
          </h2>
          <p className="text-white opacity-80 leading-relaxed text-[15px] font-light">
            Manage your organization structure, track projects, celebrate milestones, and stay connected with your team — all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
