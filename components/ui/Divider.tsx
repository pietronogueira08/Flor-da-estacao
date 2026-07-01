import React from "react"

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="w-24 h-px bg-rosa-antigo/50" />
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-4 text-rosa-antigo">
        <path
          d="M12 2C12 2 15 7 15 12C15 17 12 22 12 22C12 22 9 17 9 12C9 7 12 2 12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12L22 12C22 12 17 9 12 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12L2 12C2 12 7 15 12 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="w-24 h-px bg-rosa-antigo/50" />
    </div>
  )
}
