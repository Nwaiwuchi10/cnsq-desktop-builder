"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Api from "@/utils/api";
import CustomModal from "@/component/Message/Message";
import Navbar from "@/component/Navbar/Navbar";
import Footer from "@/component/Footer/Footer";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const searchParams: any = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setModal({
        type: "error",
        message: "Invalid or missing token.",
      });
    }
  }, [token]);

  const handleReset = async () => {
    if (!password || !confirm) {
      setModal({
        type: "error",
        message: "Both password fields are required.",
      });
      return;
    }

    if (password !== confirm) {
      setModal({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await Api.post("/staff-register/reset-password", {
        token,
        newPassword: password,
      });

      setModal({
        type: "success",
        message: res.data.message || "Password reset successful!",
      });

      setTimeout(() => router.push("/login"), 1500);
    } catch (error: any) {
      setModal({
        type: "error",
        message: error.response?.data?.message || "Reset failed.",
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
          <h1 className="text-[28px] font-bold text-[#141414] mb-1.5 tracking-tight">Reset Password</h1>
          <p className="text-gray-500 text-[15px] mb-10">Enter your new password below.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[4px] border border-gray-100 px-3 py-3 pr-10 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#95D700] focus:border-[#95D700]"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-[4px] border border-gray-100 px-3 py-3 pr-10 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#95D700] focus:border-[#95D700]"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
              onClick={handleReset}
              disabled={submitting}
              className="w-full py-[14px] rounded-[4px] bg-[#95D700] text-white font-bold text-[13px] tracking-widest uppercase hover:bg-[#86c100] disabled:opacity-60 transition-colors shadow-sm cursor-pointer"
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
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
