"use client";

import React from "react";

interface DeleteDocumentationModalProps {
  isOpen: boolean;
  docName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

import { Loader2 } from "lucide-react";

const DeleteDocumentationModal: React.FC<DeleteDocumentationModalProps> = ({ 
  isOpen, 
  docName, 
  onClose, 
  onConfirm,
  isLoading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Documentation</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{docName}"</span>? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-8 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg active:scale-[0.98] font-sans disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] flex justify-center items-center"
            >
              {isLoading ? "Processing..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDocumentationModal;
