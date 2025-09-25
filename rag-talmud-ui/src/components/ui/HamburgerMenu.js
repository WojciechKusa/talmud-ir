import React from "react";

function HamburgerMenu({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md border border-gray-300 hover:bg-white transition-all"
      aria-label="Toggle menu"
    >
      <div className="flex flex-col gap-1">
        <span className="block w-5 h-0.5 bg-gray-700 rounded"></span>
        <span className="block w-5 h-0.5 bg-gray-700 rounded"></span>
        <span className="block w-5 h-0.5 bg-gray-700 rounded"></span>
      </div>
    </button>
  );
}

export default HamburgerMenu;
