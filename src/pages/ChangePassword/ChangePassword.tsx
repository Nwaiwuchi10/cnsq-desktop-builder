"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Api from "@/utils/api";
import { AxiosError } from "axios";
import CustomModal from "@/component/Message/Message";

export default function ChangePassword() {
  const router = useRouter();
  const [staffId, setStaffId] = useState<number | null>(null);

  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<{
    old: boolean;
    new: boolean;
    confirm: boolean;
  }>({ old: false, new: false, confirm: false });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ✅ Get staffId from localStorage
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setStaffId(Number(id));
  }, []);

  // === Submit Password Change ===
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setModal({
        type: "error",
        message: "All fields are required.",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setModal({
        type: "error",
        message: "New passwords do not match.",
      });
      return;
    }

    if (!staffId) {
      setModal({
        type: "error",
        message: "User not identified. Please log in again.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await Api.patch(
        `/staff-register/${staffId}/change-password`,
        {
          oldPassword,
          newPassword,
          confirmNewPassword,
        }
      );

      setModal({
        type: "success",
        message: res.data.message || "Password updated successfully!",
      });

      // Optionally redirect to login
      setTimeout(() => {
        localStorage.removeItem("user-token");
        localStorage.removeItem("userId");
        router.push("/login");
      }, 1500);
    } catch (e: unknown) {
      const err = e as AxiosError<{ message: string }>;
      setModal({
        type: "error",
        message: err.response?.data?.message || "Password change failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-[#0d0d0d] transition-colors flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
        {/* Header */}
        <div className="flex items-center justify-center text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Change Password
          </h1>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Old Password */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Old Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.old ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 pr-10 bg-white dark:bg-[#141414] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Enter old password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, old: !prev.old }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
              >
                {showPassword.old ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 pr-10 bg-white dark:bg-[#141414] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
              >
                {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 pr-10 bg-white dark:bg-[#141414] transition-colors text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
              >
                {showPassword.confirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
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
            onClick={handleChangePassword}
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-[#95D700] text-white font-semibold text-lg hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
