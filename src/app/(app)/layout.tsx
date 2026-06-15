"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useSocket } from "@/hooks/useSocket";
import { Chatbox } from "@/components/ai/Chatbox";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setUser, clearUser } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  // Initialize Socket.IO connection
  useSocket();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const user = await authService.getMe();
        setUser(user);
      } catch {
        clearUser();
        router.push("/login");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [setUser, clearUser, router]);

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[oklch(0.70_0.18_280)] border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main app body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar navigation and quick controls */}
        <Topbar />

        {/* Content viewport */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <Chatbox />
    </div>
  );
}
