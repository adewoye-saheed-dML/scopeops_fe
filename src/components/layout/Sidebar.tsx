"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationItems } from "./navigation";

type SidebarProps = {
  pathname: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onMobileClose: () => void;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const renderedItems = useMemo(() => navigationItems.slice(0, 5), []);

  return (
    <nav className="space-y-1.5">
      {renderedItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:-translate-y-px",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2",
              "focus-visible:ring-offset-white dark:focus-visible:ring-offset-scope-surface",
              active
                ? "bg-scope-primary/15 text-scope-primary"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text",
              collapsed && "justify-center px-2.5",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className={cn("truncate", collapsed && "hidden")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({
  pathname,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "hidden h-screen border-r border-slate-200 bg-white/90 backdrop-blur md:flex md:flex-col dark:border-scope-border dark:bg-scope-surface/90",
          "fixed left-0 top-0 z-40 transition-[width] duration-300",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-slate-200 px-4 dark:border-scope-border",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-scope-primary text-sm font-bold text-white">
              SO
            </span>
            <div className={cn("min-w-0", collapsed && "hidden")}>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-scope-text">
                ScopeOps
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-scope-textMuted">
                Carbon Workspace
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav pathname={pathname} collapsed={collapsed} />
        </div>

        <div className="border-t border-slate-200 p-3 dark:border-scope-border">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:-translate-y-px",
              "hover:bg-slate-100 hover:text-slate-900 dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2",
              "focus-visible:ring-offset-white dark:focus-visible:ring-offset-scope-surface",
              collapsed && "justify-center px-2.5",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" />
            ) : (
              <PanelLeftClose className="h-4 w-4 shrink-0" />
            )}
            <span className={cn(collapsed && "hidden")}>
              {collapsed ? "Expand" : "Collapse"}
            </span>
          </button>
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/50 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onMobileClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-300 dark:border-scope-border dark:bg-scope-surface md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-scope-primary text-sm font-bold text-white">
              SO
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-scope-text">ScopeOps</p>
              <p className="text-xs text-slate-500 dark:text-scope-textMuted">Carbon Workspace</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text dark:focus-visible:ring-offset-scope-surface"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SidebarNav
          pathname={pathname}
          collapsed={false}
          onNavigate={onMobileClose}
        />
      </aside>
    </>
  );
}
