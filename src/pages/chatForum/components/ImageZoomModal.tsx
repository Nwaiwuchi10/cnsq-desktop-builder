"use client";

import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Download, FileText } from "lucide-react";

interface ImageZoomModalProps {
  url: string;
  filename?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  url,
  filename = "attachment",
  isOpen,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !url) return null;

  const isImage =
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url) ||
    url.startsWith("data:image/");

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all">
      {/* Top Action Bar */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-50 bg-gray-900/80 px-4 py-2 rounded-2xl border border-gray-700 text-white shadow-xl">
        {isImage && (
          <>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition"
              title="Rotate"
            >
              <RotateCw size={20} />
            </button>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-medium transition"
            >
              Reset
            </button>
            <div className="w-px h-5 bg-gray-700 mx-1" />
          </>
        )}
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-gray-800 rounded-lg text-lime-400 hover:text-lime-300 transition flex items-center gap-1.5 text-xs font-semibold"
          title="Download File"
        >
          <Download size={20} />
          <span>Download</span>
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition"
          title="Close Modal"
        >
          <X size={22} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative max-w-4xl max-h-[85vh] overflow-hidden flex items-center justify-center p-4">
        {isImage ? (
          <img
            src={url}
            alt={filename}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease-out",
            }}
            className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl select-none"
          />
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-white flex flex-col items-center gap-4 max-w-md shadow-2xl">
            <FileText size={64} className="text-lime-400" />
            <div>
              <p className="font-semibold text-lg">{filename}</p>
              <p className="text-sm text-gray-400 mt-1">
                Document attachment
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="mt-4 px-6 py-2.5 bg-lime-500 hover:bg-lime-600 text-black font-semibold rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Download size={18} />
              Download & View File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageZoomModal;
