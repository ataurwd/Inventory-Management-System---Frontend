"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/ui.store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutGrid,
  Boxes,
  QrCode,
  ArrowRightLeft,
  PieChart,
  BrainCircuit,
  BellRing,
  Truck,
  SlidersHorizontal,
  X,
  ChevronDown,
  Tags,
  ChevronRight,
  ChevronLeft
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
  badge?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen, isCollapsed, toggleCollapsed } = useUiStore();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Inventory: true,
  });

  const toggleExpand = (name: string) => {
    if (isCollapsed) return;
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Boxes,
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
        {
          name: "Brands List",
          href: "/inventory/brands",
        },
      ],
    },
    {
      name: "Scan",
      href: "/scan",
      icon: QrCode,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Sales",
      href: "/sales",
      icon: Tags,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: ArrowRightLeft,
      roles: ["admin", "manager"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: PieChart,
      roles: ["admin", "manager"],
    },
    {
      name: "AI Forecast",
      href: "/ai-forecast",
      icon: BrainCircuit,
      roles: ["admin", "manager"],
      badge: "Beta",
    },
    {
      name: "Waste Alerts",
      href: "/waste-alerts",
      icon: BellRing,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Suppliers",
      href: "/suppliers",
      icon: Truck,
      roles: ["admin", "manager", "cashier"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: SlidersHorizontal,
      roles: ["admin", "manager", "cashier"],
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
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:sticky md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border overflow-hidden shrink-0">
          <div className={cn("flex items-center gap-2.5 transition-all w-full", isCollapsed ? "justify-center" : "px-2")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary glow-primary/10">
              <Boxes className="h-5 w-5" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold tracking-tight text-gradient whitespace-nowrap animate-fade-in">SellFlow.io</span>}
          </div>
          {/* Mobile close button */}
          {!isCollapsed && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto overflow-x-hidden">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = !!item.subItems;
            const isExpanded = !!expandedItems[item.name] && !isCollapsed;

            if (hasSubItems) {
              const isParentActive =
                pathname === item.href ||
                item.subItems?.some((sub) => pathname === sub.href);

              return (
                <div key={item.name} className="space-y-1 relative group/menu">
                  {/* Collapsible Header Link */}
                  <div className="flex items-center justify-between group rounded-lg transition-all duration-200">
                    <Link
                      href={item.href}
                      onClick={() => {
                        setSidebarOpen(false);
                        if(isCollapsed) toggleCollapsed();
                      }}
                      className={cn(
                        "flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 relative",
                        isParentActive && pathname === item.href
                          ? "bg-primary/10 text-primary border-primary/20"
                          : isParentActive
                          ? "text-primary border-transparent"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground border-transparent",
                        isCollapsed && "justify-center px-0 py-3"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors duration-200",
                          isParentActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-sidebar-foreground"
                        )}
                      />
                      {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                    </Link>
                    {!isCollapsed && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.name)}
                        className="p-2 text-muted-foreground hover:text-sidebar-foreground rounded-lg transition-colors cursor-pointer mr-1 shrink-0"
                        aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
                      >
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            isExpanded ? "transform rotate-180" : ""
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Sub-menu Items */}
                  {isExpanded && item.subItems && !isCollapsed && (
                    <div className="pl-6 space-y-1 animate-fade-in">
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap",
                              isSubActive
                                ? "text-primary bg-primary/5 font-semibold"
                                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                          >
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full transition-colors shrink-0",
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
                  "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 border overflow-hidden relative",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground border-transparent",
                  isCollapsed && "justify-center px-0 py-3"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors duration-200",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                  />
                  {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-semibold uppercase tracking-wider shrink-0">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle Button */}
        <div className="px-4 py-3 border-t border-sidebar-border hidden md:flex justify-center shrink-0">
           <button
             onClick={toggleCollapsed}
             className={cn(
               "flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all w-full cursor-pointer",
             )}
             title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
           >
             {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <div className="flex items-center justify-between w-full px-2"><span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Collapse</span><ChevronLeft className="h-4 w-4" /></div>}
           </button>
        </div>

        {/* Sidebar User Footer */}
        <div className={cn("p-4 border-t border-sidebar-border bg-sidebar-accent/10 transition-all shrink-0", isCollapsed && "px-2 py-4 flex justify-center")}>
          <div className={cn("flex items-center gap-3", !isCollapsed && "px-2")}>
            <Avatar size="default" className="shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold border border-primary/25">
                {user?.name?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
