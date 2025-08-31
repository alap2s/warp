import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white",
  {
    variants: {
      variant: {
        primary: "bg-white text-black hover:bg-neutral-200",
        secondary: "border border-white bg-transparent text-white hover:bg-white/10",
        tertiary: "border-2 border-white/20 bg-transparent text-white/40 hover:bg-white/10",
      },
      size: {
        default: "h-12 py-2 px-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
      isLoading?: boolean;
    }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" /> : children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 