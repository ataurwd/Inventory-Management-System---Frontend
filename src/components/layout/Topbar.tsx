"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/ui.store";
import { authService } from "@/services/auth.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, Bell, LogOut, User, Palette, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useNotificationsStore } from "@/store/notifications.store";

export default function Topbar() {
  const router = useRouter();
  const { user, clearUser } = useAuth();
  const { toggleSidebar } = useUiStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotificationsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearUser();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const badgeVariants = {
    admin: "default" as const,
    manager: "secondary" as const,
    cashier: "outline" as const,
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Hamburger Toggle */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Badge */}
        {user?.role && (
          <Badge variant={badgeVariants[user.role]} className="capitalize hidden sm:inline-flex">
            {user.role}
          </Badge>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {!mounted ? (
            <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
          ) : theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Notification Bell / Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative cursor-pointer">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-80 mt-1 border border-border p-1">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border mb-1 text-xs">
              <span className="font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-primary hover:underline font-medium cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`px-3 py-2 rounded-md text-xs transition-colors flex flex-col gap-0.5 ${
                      item.read ? "bg-transparent hover:bg-muted/40" : "bg-primary/5 hover:bg-primary/10 border-l-2 border-primary"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-semibold text-foreground truncate max-w-[180px]">
                        {item.title}
                      </span>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[10px] leading-snug">
                      {item.message}
                    </p>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={clearNotifications}
                  className="w-full text-center justify-center text-[10px] text-muted-foreground hover:text-foreground py-1.5 cursor-pointer"
                >
                  Clear history
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-9 gap-2 pl-2 pr-3 hover:bg-accent">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                    {user?.name?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-foreground">{user?.name}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56 mt-1 border border-border p-1">
            {/* Direct styled Div for profile section to avoid Base UI MenuGroupContext error */}
            <div className="px-2.5 py-2 text-xs text-muted-foreground border-b border-border mb-1">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/design-system")}>
              <Palette className="mr-2 h-4 w-4" />
              <span>Design System</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
