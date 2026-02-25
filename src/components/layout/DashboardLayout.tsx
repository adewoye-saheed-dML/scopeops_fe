"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationItems } from "./navigation";
import PageTransition from "./PageTransition";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const authRoutes = new Set(["/login", "/signup"]);

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthRoute = authRoutes.has(pathname);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-scope-text">
      <Sidebar
        pathname={pathname}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "transition-[margin] duration-300",
          collapsed ? "md:ml-20" : "md:ml-64",
        )}
      >
        <TopNavigation
          pathname={pathname}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />
        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur dark:border-scope-border dark:bg-scope-surface/95 md:hidden">
        <ul className="grid grid-cols-4 gap-1">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-white dark:focus-visible:ring-offset-scope-surface",
                    active
                      ? "bg-scope-primary/15 text-scope-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-scope-textMuted dark:hover:bg-scope-surfaceMuted dark:hover:text-scope-text",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
