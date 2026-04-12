"use client";

import React from "react";
import { FileText, ExternalLink, Download, Pencil, Trash2, FileCode, FileSpreadsheet, FileBox } from "lucide-react";

export interface Documentation {
  id: string;
  name: string;
  url?: string;
  files?: string[];
  createdAt: string;
}

interface DocumentationItemProps {
  doc: Documentation;
  onEdit: (doc: Documentation) => void;
  onDelete: (doc: Documentation) => void;
}

const DocumentationItem: React.FC<DocumentationItemProps> = ({ doc, onEdit, onDelete }) => {
  // Prevents Next.js layout boundary from crashing when trying to render components in the pages folder without props during build
  if (!doc) return null;

  // Simple logic to determine icon based on name or hypothetical extension
  const getIcon = () => {
    const name = doc.name.toLowerCase();
    if (name.includes("api") || name.includes("tech")) return <FileCode className="w-5 h-5 text-[#a1e508]" />;
    if (name.includes("research") || name.includes("onboarding")) return <FileText className="w-5 h-5 text-[#a1e508]" />;
    if (name.includes("best practices") || name.includes("manual")) return <FileBox className="w-5 h-5 text-[#a1e508]" />;
    return <FileText className="w-5 h-5 text-[#a1e508]" />;
  };

  return (
    <div className="flex items-center justify-between p-4 mb-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 bg-[#a1e508]/10 rounded-lg">
          {getIcon()}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {doc.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-md">
              {doc.url || (doc.files && doc.files.length > 0 ? `${doc.files.length} attached file(s)` : "No link")}
            </span>
            <div className="flex items-center gap-1.5 font-sans">
                {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#a1e508] transition-colors">
                        <ExternalLink size={14} />
                    </a>
                )}
                {doc.files && doc.files.length > 0 && doc.files.map((fileUrl, idx) => (
                    <a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#a1e508] transition-colors cursor-pointer" title="Download Source">
                        <Download size={14} />
                    </a>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => onEdit(doc)}
          className="p-2 text-gray-400 hover:text-[#a1e508] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
        >
          <Pencil size={18} />
        </button>
        <button 
          onClick={() => onDelete(doc)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default DocumentationItem;
