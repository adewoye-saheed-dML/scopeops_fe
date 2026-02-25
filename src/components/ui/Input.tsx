import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, helperText, className, containerClassName, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-800 dark:text-scope-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 dark:bg-scope-surface dark:text-scope-text",
            "placeholder:text-slate-400 dark:placeholder:text-scope-textMuted/80",
            "outline-none transition-colors",
            "focus:border-scope-primary focus:ring-2 focus:ring-scope-primary/30",
            error
              ? "border-error focus:border-error focus:ring-error/30"
              : "border-slate-300 dark:border-scope-border",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-sm font-medium text-error">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-sm text-slate-500 dark:text-scope-textMuted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
