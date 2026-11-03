"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Api from "@/utils/api";
import CustomModal from "@/component/Message/Message";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function CompleteRegistration() {
  const searchParams: any = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [expired, setExpired] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setModal({
        type: "error",
        message: "Registration token is missing from the link.",
      });
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await Api.get(`/staff-register/verify-registration-token?token=${token}`);
        if (res.data.valid) {
          setTokenValid(true);
          setUserEmail(res.data.email || "");
        } else if (res.data.expired) {
          setExpired(true);
          setUserEmail(res.data.email || "");
        } else {
          setModal({
            type: "error",
            message: res.data.message || "Invalid registration link.",
          });
        }
      } catch (err: any) {
        setModal({
          type: "error",
          message: err.response?.data?.message || "Failed to verify registration token.",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleCompleteRegistration = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setModal({
        type: "error",
        message: "All password fields are required.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setModal({
        type: "error",
        message: "New password and confirm password do not match.",
      });
      return;
    }

    if (newPassword === oldPassword) {
      setModal({
        type: "error",
        message: "New password must be different from your default generated password.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await Api.post("/staff-register/complete-registration", {
        token,
        oldPassword,
        newPassword,
        confirmPassword,
      });

      setModal({
        type: "success",
        message: res.data.message || "Registration completed successfully!",
      });

      setTimeout(() => router.push("/login"), 1800);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "";
      if (
        errMsg === "REGISTRATION_OTP_EXPIRED" ||
        errMsg.toLowerCase().includes("expired")
      ) {
        setExpired(true);
      } else {
        setModal({
          type: "error",
          message:
            error.response?.data?.message ||
            "Unable to complete registration. Please check your credentials and try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const goToForgotPassword = () => {
    if (userEmail) {
      router.push(`/ForgotPassword?email=${encodeURIComponent(userEmail)}`);
    } else {
      router.push("/ForgotPassword");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-white font-sans">
      {/* Left side: Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12">
        <div className="w-full max-w-[400px] mx-auto">
          {/* Logo */}
          <div className="mb-10">
            <img src="/CNSQ.png" alt="CN Squad" className="h-[46px] w-auto" />
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <p className="text-sm animate-pulse">Verifying registration link...</p>
            </div>
          ) : expired ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
              <div className="flex justify-center text-red-500">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Registration Link Expired</h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your registration link has expired. Please reset your password to complete your account setup.
              </p>
              <button
                onClick={goToForgotPassword}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition"
              >
                Go to Forgot Password
              </button>
            </div>
          ) : tokenValid ? (
            <>
              <h1 className="text-[26px] font-bold text-[#141414] mb-1.5 tracking-tight">Complete Registration</h1>
              <p className="text-gray-500 text-[14px] mb-8">
                Welcome to ConnectNigeria! Enter your default password from email and set your new password.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Generated Default Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full rounded-[4px] border border-gray-200 px-3 py-3 pr-10 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#95D700] focus:border-[#95D700]"
                      style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
                      placeholder="Enter password from registration email"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-[4px] border border-gray-200 px-3 py-3 pr-10 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#95D700] focus:border-[#95D700]"
                      style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-[4px] border border-gray-200 px-3 py-3 pr-10 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#95D700] focus:border-[#95D700]"
                      style={{ color: "#111827", WebkitTextFillColor: "#111827" }}
                      placeholder="Confirm new password"
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

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  onClick={handleCompleteRegistration}
                  disabled={submitting}
                  className="w-full py-[14px] rounded-[4px] bg-[#95D700] text-black font-bold text-[13px] tracking-widest uppercase hover:bg-[#86c100] disabled:opacity-60 transition-colors shadow-sm cursor-pointer"
                >
                  {submitting ? "Completing..." : "Complete Registration"}
                </button>
              </div>
            </>
          ) : null}

          {/* Modal Overlay / Feedback */}
          {modal && (
            <div className="mt-4">
              <CustomModal
                type={modal.type}
                message={modal.message}
                onClose={() => setModal(null)}
              />
            </div>
          )}

          <p className="mt-12 text-left text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} Connect Nigeria. All rights reserved.
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
            Welcome to ConnectNigeria Squad
          </h2>
          <p className="text-white opacity-80 leading-relaxed text-[15px] font-light">
            Complete your account registration to start collaborating with your department, accessing tools, and staying connected with your team.
          </p>
        </div>
      </div>
    </div>
  );
}
