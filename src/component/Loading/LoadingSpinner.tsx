"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="w-12 h-12 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
}
