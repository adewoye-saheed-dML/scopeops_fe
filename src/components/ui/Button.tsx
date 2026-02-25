import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  primary:
    "bg-scope-primary text-white shadow-md shadow-scope-primary/20 hover:bg-scope-primaryHover focus-visible:ring-scope-primary",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-scope-primary dark:bg-scope-surfaceMuted dark:text-scope-text dark:hover:bg-scope-border",
  outline:
    "border border-slate-300 bg-transparent text-slate-900 hover:border-scope-primary hover:bg-scope-primary/10 focus-visible:ring-scope-primary dark:border-scope-border dark:text-scope-text",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-scope-primary dark:text-scope-textMuted dark:hover:bg-scope-surface dark:hover:text-scope-text",
} as const;

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 hover:-translate-y-px active:translate-y-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-scope-bg",
          "disabled:pointer-events-none disabled:opacity-60",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export default Button;
