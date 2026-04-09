// src/component/Modals/DeleteConfirmModal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";

interface DeleteConfirmModalProps {
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  title = "Delete Notification",
  message = "Are you sure you want to delete this notification? This action cannot be undone.",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 h-full">
      <div className="bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-lg w-full max-w-sm p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-400"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
