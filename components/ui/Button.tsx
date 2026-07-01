import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    
    let baseClass = "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium font-jost transition-colors disabled:pointer-events-none disabled:opacity-50"
    
    let variantClass = ""
    switch(variant) {
      case "default": variantClass = "bg-ameixa text-marfim hover:bg-carvao"; break;
      case "outline": variantClass = "border border-ameixa text-ameixa hover:bg-ameixa hover:text-marfim"; break;
      case "ghost": variantClass = "hover:bg-rosa-antigo/20 hover:text-ameixa"; break;
      case "secondary": variantClass = "bg-rosa-antigo text-carvao hover:bg-musgo hover:text-marfim"; break;
      case "link": variantClass = "text-ameixa underline-offset-4 hover:underline"; break;
    }

    let sizeClass = ""
    switch(size) {
      case "default": sizeClass = "h-10 px-4 py-2"; break;
      case "sm": sizeClass = "h-9 rounded-sm px-3"; break;
      case "lg": sizeClass = "h-11 rounded-sm px-8"; break;
      case "icon": sizeClass = "h-10 w-10"; break;
    }

    return (
      <button
        className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
