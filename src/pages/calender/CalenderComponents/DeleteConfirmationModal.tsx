"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import Api from "@/utils/api";
import CustomModal from "@/component/Message/Message";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventId: string;
  eventTitle: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  eventId,
  eventTitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) setModal(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("user-token");
      await Api.delete(`/calender/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({ type: "success", message: "Event deleted successfully." });
      onConfirm();

      // keep success message visible briefly before closing
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      setModal({
        type: "error",
        message: error.response?.data?.message || "Failed to delete event.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertCircle size={24} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-gray-900">Delete Meeting?</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                "{eventTitle}"
              </span>
              ? This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={handleDelete}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <CustomModal
          type={modal.type}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default DeleteConfirmationModal;
