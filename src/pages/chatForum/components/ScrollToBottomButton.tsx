import React from "react";
import { ArrowDown } from "lucide-react";

interface ScrollToBottomButtonProps {
  show: boolean;
  onClick: () => void;
}

const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({ show, onClick }) => {
  return (
    <div
      className={`absolute bottom-6 right-6 z-50 transition-all duration-300 transform ${
        show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <button
        onClick={onClick}
        className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-colors focus:outline-none"
        aria-label="Scroll to bottom"
      >
        <ArrowDown size={20} />
      </button>
    </div>
  );
};

export default ScrollToBottomButton;
