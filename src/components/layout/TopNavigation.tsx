"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  UserCircle2,
} from "lucide-react";
import { useThemePreference } from "@/hooks/useThemePreference";
import { cn } from "@/lib/utils";

type TopNavigationProps = {
  pathname: string;
  onOpenMobileMenu: () => void;
};

function toBreadcrumbLabel(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function useBreadcrumbs(pathname: string) {
  return useMemo(() => {
    const cleanPath = pathname.split("?")[0];
    const segments = cleanPath.split("/").filter(Boolean);
    const crumbs = [{ href: "/dashboard", label: "Dashboard" }];
    const segmentCrumbs = segments
      .map((segment, index) => ({
        href: `/${segments.slice(0, index + 1).join("/")}`,
        label: toBreadcrumbLabel(segment),
      }))
      .filter((crumb) => crumb.href !== "/dashboard");

    return crumbs.concat(segmentCrumbs);
  }, [pathname]);
}

export default function TopNavigation({
  pathname,
  onOpenMobileMenu,
}: TopNavigationProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs(pathname);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const { theme, ready, toggleTheme } = useThemePreference();
  const isDark = theme === "dark";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-scope-border dark:bg-scope-surface/85">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text dark:focus-visible:ring-offset-scope-surface md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden min-w-0 items-center gap-2 text-sm text-slate-500 dark:text-scope-textMuted sm:flex">
          {breadcrumbs.map((crumb) => (
            <div key={crumb.href} className="flex min-w-0 items-center gap-2">
              {crumb.href !== "/dashboard" && (
                <span className="text-slate-300 dark:text-scope-border">/</span>
              )}
              <Link
                href={crumb.href}
                className={cn(
                  "truncate rounded-sm px-1 py-0.5 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary",
                  pathname === crumb.href
                    ? "text-slate-900 dark:text-scope-text"
                    : "hover:text-slate-900 dark:hover:text-scope-text",
                )}
              >
                {crumb.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="relative ml-auto w-full max-w-xs sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-scope-textMuted" />
          <input
            type="search"
            placeholder="Search suppliers, contracts, emissions..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-scope-primary focus:outline-none focus:ring-2 focus:ring-scope-primary/30 dark:border-scope-border dark:bg-scope-bg/70 dark:text-scope-text dark:placeholder:text-scope-textMuted"
          />
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text dark:focus-visible:ring-offset-scope-surface"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {ready && !isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          className="hidden rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text dark:focus-visible:ring-offset-scope-surface sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-900 transition-colors hover:border-scope-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-scope-border dark:bg-scope-bg/70 dark:text-scope-text dark:focus-visible:ring-offset-scope-surface"
          >
            <UserCircle2 className="h-5 w-5 text-slate-500 dark:text-scope-textMuted" />
            <span className="hidden text-sm font-medium md:inline">Woyes</span>
            <ChevronDown className="h-4 w-4 text-slate-500 dark:text-scope-textMuted" />
          </button>

          <div
            className={cn(
              "absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg transition-all dark:border-scope-border dark:bg-scope-surface dark:shadow-card",
              profileMenuOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-1 opacity-0",
            )}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text"
            >
              <UserCircle2 className="h-4 w-4" />
              Profile
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-error transition-colors hover:bg-error/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
