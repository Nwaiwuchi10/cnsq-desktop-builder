"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Api from "@/utils/api";
import CustomModal from "@/component/Message/Message";

interface DeleteCommentModalProps {
  commentId: number;
  name: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteCommentModal({
  commentId,
  name,
  onClose,
  onDeleted,
}: DeleteCommentModalProps) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("user-token");
      setToken(t);
    }
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await Api.delete(`/task/${commentId}/comments/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({ type: "success", message: "Comment deleted successfully!" });
      setTimeout(() => {
        onDeleted();
        onClose();
      }, 1000);
    } catch (err) {
      setModal({ type: "error", message: "Failed to delete comment" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Are you sure you want to delete
          <span>{name}?</span>
        </h2>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>

        {modal && <CustomModal {...modal} onClose={() => setModal(null)} />}
      </div>
    </div>
  );
}
