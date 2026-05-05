"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, Trash2 } from "lucide-react";

interface AddDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; link?: string; files: File[] }) => void;
  isLoading?: boolean;
}

import { Loader2 } from "lucide-react";

const AddDocumentationModal: React.FC<AddDocumentationModalProps> = ({ isOpen, onClose, onAdd, isLoading = false }) => {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setLink("");
      setFiles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAdd({ name, link, files });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Documentation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add a new documentation entry to the centralized repository</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              Documentation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., API Integration Guide"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#a1e508] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              Documentation Link
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://docs.example.com/documentation"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#a1e508] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Upload Files
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-[#a1e508] transition-colors cursor-pointer group"
            >
              <Upload className="mx-auto text-gray-400 group-hover:text-[#a1e508] mb-2 transition-colors" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click or drag files here to upload
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Supports DOC, PDF, Excel, MD and Office files
              </p>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.csv,.md,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/markdown"
              />
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={16} className="text-[#a1e508] shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#a1e508] text-black font-bold hover:bg-[#86CD23] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-w-[170px] flex justify-center items-center"
            >
              {isLoading ? "Processing..." : "Add Documentation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDocumentationModal;
