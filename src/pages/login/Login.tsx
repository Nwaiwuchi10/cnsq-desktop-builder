"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/ThemeContext";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import CustomModal from "@/component/Message/Message";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();

  const [identifier, setIdentifier] = useState<string>(""); // 🔹 can be email or employeeCode
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // === Submit Login ===
  const handleLogin = async () => {
    if (!identifier || !password) {
      setModal({
        type: "error",
        message: "Email/Employee Code and password are required.",
      });
      return;
    }

    setSubmitting(true);

    try {
      //  Send identifier + password to backend
      const res = await Api.post("/staff-register/login", {
        identifier,
        password,
      });

      // Save token + user id
      localStorage.setItem("user-token", res.data.token);
      localStorage.setItem("userId", res.data.id);

      // Show success modal
      setModal({
        type: "success",
        message: res.data.message || "Login successful!",
      });

      // Redirect after short delay
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Login failed. Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white dark:bg-[#0d0d0d] font-sans transition-colors duration-300 relative">
      {/* Theme Toggle in Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:opacity-80 transition-all shadow-sm"
          aria-label="Toggle Theme"
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Left side: Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12">
        <div className="w-full max-w-[380px] mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <img src="/CNSQ.png" alt="CN Squad" className="h-[46px] w-auto" />
          </div>

          {/* Headers */}
          <h1 className="text-[28px] font-bold text-[#141414] dark:text-white mb-1.5 tracking-tight">Sign in</h1>
          <p className="text-gray-500 dark:text-gray-400 text-[15px] mb-10">Sign in to your account to continue</p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-[4px] border border-gray-100 dark:border-gray-800 px-3 py-3 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#95D700] focus:border-[#95D700] transition-colors"
                placeholder="you@connectnigeria.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[4px] border border-gray-100 dark:border-gray-800 px-3 py-3 pr-10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#95D700] focus:border-[#95D700] transition-colors"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              style={{ cursor: submitting ? "not-allowed" : "pointer" }}
              onClick={handleLogin}
              disabled={submitting}
              className="w-full py-[14px] rounded-[4px] bg-[#95D700] text-white font-bold text-[13px] tracking-widest uppercase hover:bg-[#86c100] disabled:opacity-60 transition-colors shadow-sm"
            >
              {submitting ? "Logging in..." : "SIGN IN"}
            </button>
          </div>

          <div className="flex justify-end mt-4 mb-4">
            <button
              onClick={() => router.push("/forgot-password")}
              className="text-[13px] cursor-pointer text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <p className="mt-16 text-left text-xs text-gray-400 dark:text-gray-600 font-medium">
            &copy; 2026 Connect Nigeria. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side: Banner Info */}
      <div className="hidden md:flex flex-col md:w-1/2 bg-[#1b2b0f] items-center justify-center p-12 text-center relative overflow-hidden">
        <div className="flex items-center justify-center w-full max-w-[320px] lg:max-w-md mb-12">
          {/* We'll use the generated AI illustration here */}
          <img src="/login-hero.png" alt="Your team, connected" className="w-[85%] h-auto max-h-[400px] object-contain rounded-2xl drop-shadow-2xl" />
        </div>

        <div className="max-w-[420px] z-10">
          <h2 className="text-2xl lg:text-[28px] font-bold text-white mb-4 tracking-tight leading-tight">
            Your team, organized and <br /> connected
          </h2>
          <p className="text-white opacity-80 leading-relaxed text-[15px] font-light">
            Manage your organization structure, track projects, celebrate milestones, and stay connected with your team — all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
