"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import CustomModal from "@/component/Message/Message";

export default function Login() {
  const router = useRouter();

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
    <div className="min-h-screen w-full bg-[#FAFAFA] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="flex items-center justify-center text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Staff Login</h1>
          <div className="w-[60px]" />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Email or Employee Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900 placeholder-gray-400"
              placeholder="e.g. admin@example.com or CN-000123"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 bg-white text-gray-900 placeholder-gray-400"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {modal && (
          <CustomModal
            type={modal.type}
            message={modal.message}
            onClose={() => setModal(null)}
          />
        )}

        {/* Submit */}
        <div className="mt-6">
          <button
            style={{ cursor: submitting ? "not-allowed" : "pointer" }}
            onClick={handleLogin}
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-[#95D700] text-white font-semibold text-lg hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
