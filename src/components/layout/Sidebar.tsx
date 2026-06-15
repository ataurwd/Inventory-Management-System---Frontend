"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/ui.store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Package,
  ScanBarcode,
  ArrowLeftRight,
  BarChart3,
  Sparkles,
  AlertTriangle,
  Truck,
  Settings,
  X,
  Layers,
  ChevronDown,
} from "lucide-react";

interface SubNavItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  subItems?: SubNavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Inventory: true,
  });

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Package,
      roles: ["admin", "manager", "cashier"],
      subItems: [
        {
          name: "All Products",
          href: "/inventory",
        },
        {
          name: "Categories List",
          href: "/inventory/categories",
        },
      ],
    },
    {
      name: "Scan",
      href: "/scan",
      icon: ScanBarcode,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: ArrowLeftRight,
      roles: ["admin", "manager"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ["admin", "manager"],
    },
    {
      name: "AI Forecast",
      href: "/ai-forecast",
      icon: Sparkles,
      roles: ["admin", "manager"],
    },
    {
      name: "Waste Alerts",
      href: "/waste-alerts",
      icon: AlertTriangle,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Suppliers",
      href: "/suppliers",
      icon: Truck,
      roles: ["admin", "manager"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  // Filter items by user role
  const filteredItems = navItems.filter((item) => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden cursor-pointer border-none w-full h-full text-left p-0"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:sticky md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary glow-primary/10">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gradient">SmartStock</span>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = !!item.subItems;
            const isExpanded = !!expandedItems[item.name];

            if (hasSubItems) {
              const isParentActive =
                pathname === item.href ||
                item.subItems?.some((sub) => pathname === sub.href);

              return (
                <div key={item.name} className="space-y-1">
                  {/* Collapsible Header Link */}
                  <div className="flex items-center justify-between group rounded-lg transition-all duration-200">
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200",
                        isParentActive && pathname === item.href
                          ? "bg-primary/10 text-primary border-primary/20"
                          : isParentActive
                          ? "text-primary border-transparent"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground border-transparent"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          isParentActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-sidebar-foreground"
                        )}
                      />
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.name)}
                      className="p-2 text-muted-foreground hover:text-sidebar-foreground rounded-lg transition-colors cursor-pointer mr-1"
                      aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
                    >
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          isExpanded ? "transform rotate-180" : ""
                        )}
                      />
                    </button>
                  </div>

                  {/* Sub-menu Items */}
                  {isExpanded && item.subItems && (
                    <div className="pl-6 space-y-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-150",
                              isSubActive
                                ? "text-primary bg-primary/5 font-semibold"
                                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                          >
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full transition-colors",
                                isSubActive ? "bg-primary" : "bg-muted-foreground/30"
                              )}
                            />
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar User Footer */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
          <div className="flex items-center gap-3 px-2">
            <Avatar size="default">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold border border-primary/25">
                {user?.name?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
