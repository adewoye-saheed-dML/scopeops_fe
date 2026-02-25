"use client";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";

const variantStyles = {
  success: "border-success/50 bg-success/15 text-success",
  error: "border-error/50 bg-error/15 text-error",
  info: "border-scope-primary/50 bg-scope-primary/15 text-scope-primary",
} as const;

export default function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => dismissToast(toast.id), 3200),
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, dismissToast]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon =
          toast.variant === "success"
            ? CheckCircle2
            : toast.variant === "error"
              ? AlertTriangle
              : Info;

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-lg border p-3 shadow-card backdrop-blur",
              "animate-in slide-in-from-top-2 duration-300",
              variantStyles[toast.variant],
            )}
          >
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs text-scope-textMuted">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-sm p-1 text-scope-textMuted transition-colors hover:bg-scope-surfaceMuted hover:text-scope-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
