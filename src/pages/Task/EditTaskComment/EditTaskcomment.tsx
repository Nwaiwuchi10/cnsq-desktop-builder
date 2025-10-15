"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Api from "@/utils/api";
import CustomModal from "@/component/Message/Message";

interface EditCommentModalProps {
  commentId: number;
  currentText: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditCommentModal({
  commentId,
  currentText,
  onClose,
  onUpdated,
}: EditCommentModalProps) {
  const [text, setText] = useState(currentText);
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

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await Api.patch(
        `/task/${commentId}/comments/edit`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setModal({ type: "success", message: "Comment updated successfully!" });
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      setModal({ type: "error", message: "Failed to update comment" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Edit Comment</h2>

        <textarea
          className="w-full border rounded-lg p-2 text-sm focus:ring-green-200 focus:outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-3 py-1 bg-[#95D700] text-white rounded-md hover:opacity-90"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>

        {modal && <CustomModal {...modal} onClose={() => setModal(null)} />}
      </div>
    </div>
  );
}
