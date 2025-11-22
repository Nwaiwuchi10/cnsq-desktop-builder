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
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Forgot Password
          </h1>

          <label className="block text-sm text-gray-700 mb-1">
            Enter your email address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="example@email.com"
          />

          {modal && (
            <CustomModal
              type={modal.type}
              message={modal.message}
              onClose={() => setModal(null)}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-[#95D700] text-white rounded-lg disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Sending..." : "Send Reset Link To Email"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
