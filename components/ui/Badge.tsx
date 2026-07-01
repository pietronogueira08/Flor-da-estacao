import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive"
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  let baseClass = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-jost transition-colors"
  
  let variantClass = ""
  switch(variant) {
    case "default": variantClass = "border-transparent bg-ameixa text-marfim hover:bg-ameixa/80"; break;
    case "secondary": variantClass = "border-transparent bg-rosa-antigo text-carvao hover:bg-rosa-antigo/80"; break;
    case "outline": variantClass = "text-carvao border-ameixa"; break;
    case "destructive": variantClass = "border-transparent bg-red-500 text-white"; break;
  }

  return (
    <div className={`${baseClass} ${variantClass} ${className}`} {...props} />
  )
}
