"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useAuthStore } from "@/store/authStore";
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
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs(pathname);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const { theme, ready, toggleTheme } = useThemePreference();
  const isDark = theme === "dark";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                router.push(`/projects?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
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

        <div ref={notificationsRef} className="relative hidden sm:inline-flex">
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text dark:focus-visible:ring-offset-scope-surface"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div
            className={cn(
              "absolute right-0 top-full mt-2 w-80 rounded-lg border border-slate-200 bg-white p-2 shadow-lg transition-all dark:border-scope-border dark:bg-scope-surface dark:shadow-card",
              notificationsOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-1 opacity-0",
            )}
          >
            <div className="mb-2 border-b border-slate-100 px-2 pb-2 pt-1 dark:border-scope-border/50">
              <p className="text-sm font-semibold text-slate-900 dark:text-scope-text">Notifications</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="cursor-pointer rounded-md p-2 transition-colors hover:bg-slate-50 dark:hover:bg-scope-surfaceMuted">
                <p className="text-xs font-medium text-slate-900 dark:text-scope-text">Bulk upload successful</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-scope-textMuted">15 spend records imported from ERP_Q1.csv</p>
              </div>
              <div className="cursor-pointer rounded-md p-2 transition-colors hover:bg-slate-50 dark:hover:bg-scope-surfaceMuted">
                <p className="text-xs font-medium text-slate-900 dark:text-scope-text">New emission factors</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-scope-textMuted">EPA 2024 supply chain factors are now available in your workspace.</p>
              </div>
            </div>
          </div>
        </div>

        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-900 transition-colors hover:border-scope-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-scope-border dark:bg-scope-bg/70 dark:text-scope-text dark:focus-visible:ring-offset-scope-surface"
          >
            <UserCircle2 className="h-5 w-5 text-slate-500 dark:text-scope-textMuted" />
            <span className="hidden text-sm font-medium md:inline">
              {user?.full_name || user?.email?.split("@")[0] || "User"}
            </span>
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
              onClick={() => { setProfileMenuOpen(false); router.push('/settings'); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text"
            >
              <UserCircle2 className="h-4 w-4" />
              Profile
            </button>
            <button
              type="button"
              onClick={() => { setProfileMenuOpen(false); router.push('/settings'); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              type="button"
              onClick={() => { clearAuth(); setProfileMenuOpen(false); router.push('/login'); }}
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
