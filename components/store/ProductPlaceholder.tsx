import React from "react";

export function ProductPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full aspect-[3/4] bg-claro/30 flex flex-col items-center justify-center relative overflow-hidden ${className}`}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-zaya mb-3"
      >
        {/* Clothes hanger icon */}
        <path
          d="M24 10 C24 10 28 10 28 14 C28 16 26 17 24 18 L6 30 C4 31 4 34 6 35 C8 36 10 35 10 33"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 33 L38 33 C40 33 42 31 40 30 L24 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="font-archivo text-zaya text-xs tracking-widest uppercase">foto em breve</span>
    </div>
  );
}
