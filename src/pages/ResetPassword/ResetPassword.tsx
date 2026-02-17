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
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Reset Password
          </h1>

          <label className="block text-sm text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-gray-900 border rounded-lg px-3 py-2"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <label className="block text-sm text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full text-gray-900 border rounded-lg px-3 py-2"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {modal && (
            <CustomModal
              type={modal.type}
              message={modal.message}
              onClose={() => setModal(null)}
            />
          )}

          <button
            onClick={handleReset}
            disabled={submitting}
            className="w-full py-3 bg-[#95D700] text-white rounded-lg disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
