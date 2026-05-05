"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { Documentation } from "./DocumentationItem";

interface EditDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: { name: string; link?: string; files: File[]; existingFiles: string[] }) => void;
  isLoading?: boolean;
  doc: Documentation | null;
}

const EditDocumentationModal: React.FC<EditDocumentationModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  isLoading = false,
  doc
}) => {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && doc) {
      setName(doc.name);
      setLink(doc.link || "");
      setFiles([]);
      setExistingFiles(doc.files || []);
      setError(null);
    }
  }, [isOpen, doc]);

  if (!isOpen || !doc) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Documentation name is required");
      return;
    }

    if (!link.trim() && files.length === 0 && existingFiles.length === 0) {
      setError("Please provide either a documentation link or upload at least one file");
      return;
    }

    onUpdate(doc.id, { 
      name: name.trim(), 
      link: link.trim(), // Sending trimmed link (could be empty string)
      files, 
      existingFiles 
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Documentation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update documentation entry details and files</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in slide-in-from-top-2 duration-200">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
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
              Files
            </label>

            {/* Existing Files **/}
            {existingFiles.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Files</p>
                {existingFiles.map((fileUrl, index) => {
                  const fileName = fileUrl.split('/').pop()?.split('-').slice(1).join('-') || "File";
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={16} className="text-[#a1e508] shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload New Files */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-[#a1e508] transition-colors cursor-pointer group"
            >
              <Upload className="mx-auto text-gray-400 group-hover:text-[#a1e508] mb-2 transition-colors" size={24} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click to add more files
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

            {/* New Files Preview */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Files to Upload</p>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-[#a1e508]/5 dark:bg-[#a1e508]/5 rounded-lg border border-[#a1e508]/20">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={16} className="text-[#a1e508] shrink-0" />
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
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
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : "Update Documentation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocumentationModal;
