import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white h-12 w-12",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-neutral-200",
        outline: "border-2 border-white/20 bg-black text-white hover:bg-white/10 transition-colors",
        ghost: "hover:bg-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
      icon: React.ElementType
    }

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, icon: Icon, ...props }, ref) => {
    return (
      <button
        className={cn(iconButtonVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        <Icon size={16} strokeWidth={2.25} />
      </button>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants } 