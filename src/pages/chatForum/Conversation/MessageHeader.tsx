"use client";
import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-transparent p-4 text-gray-600">
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        <button className="p-2 rounded-md">◀</button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            TJ
          </div>
          <div>
            <div className="font-semibold">Tobi Jakes</div>
            <div className="text-xs text-green-500">Online</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
