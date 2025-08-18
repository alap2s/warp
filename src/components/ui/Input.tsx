import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  helperText?: React.ReactNode;
  onIconClick?: () => void;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, value, icon, helperText, onIconClick, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = value && String(value).length > 0;
    const internalRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => internalRef.current!);

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const inputElement = internalRef.current;
      if (inputElement) {
        const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        valueSetter?.call(inputElement, '');
        const event = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(event);
        inputElement.focus();
      }
    };

    return (
      <div
        className={cn(
          "relative flex w-full flex-col justify-center rounded-lg border border-transparent bg-[#2D2D2D] px-3 ring-offset-black focus-within:border-[1.5px] focus-within:border-gray-400",
          helperText ? "py-2" : "h-12",
          className
        )}
      >
        <div className="relative flex w-full items-center">
          {icon && <div className={cn("pointer-events-auto flex h-full items-center pr-3 cursor-pointer", value ? 'text-white' : 'text-white/60')} onClick={onIconClick}>{icon}</div>}
          <input
            className={cn(
              "w-full border-none bg-transparent p-0 text-base font-medium text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 caret-white",
              icon ? "pl-1" : "",
              hasValue && isFocused ? "pr-8" : ""
            )}
            ref={internalRef}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {hasValue && isFocused && (
            <button
              onClick={handleClear}
              className="absolute right-0 flex h-full items-center"
              aria-label="Clear input"
            >
              <X size={16} className="text-white/60" />
            </button>
          )}
        </div>
        {helperText && <div className={cn("mt-1", icon ? "pl-8" : "pl-0")}>{helperText}</div>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input } 