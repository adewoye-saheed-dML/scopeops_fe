"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SlideOverProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function SlideOver({
  open,
  title,
  description,
  onClose,
  children,
}: SlideOverProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/60 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-full max-w-xl border-l border-scope-border bg-scope-surface shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-scope-border px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-scope-text">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm text-scope-textMuted">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text dark:focus-visible:ring-offset-scope-surface"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        </div>
      </aside>
    </>
  );
}
