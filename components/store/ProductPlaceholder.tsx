import React from "react";

export function ProductPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full aspect-[3/4] bg-nevoa flex flex-col items-center justify-center relative overflow-hidden ${className}`}>
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-rosa-antigo mb-4"
      >
        <path
          d="M32 16 C32 16 40 24 40 32 C40 40 32 48 32 48 C32 48 24 40 24 32 C24 24 32 16 32 16 Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 48 L32 56"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M24 32 C16 32 8 40 8 48 C16 48 24 40 24 32 Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 32 C48 32 56 40 56 48 C48 48 40 40 40 32 Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-jost text-musgo text-sm">foto em breve</span>
    </div>
  );
}
