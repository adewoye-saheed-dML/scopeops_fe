import { LayoutDashboard, FolderKanban, Settings } from "lucide-react";

export const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, current: true },
  { name: "Suppliers", href: "/projects", icon: FolderKanban, current: false },
  { name: "Settings", href: "/settings", icon: Settings, current: false },
];

export const navigation = navigationItems;