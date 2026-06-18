"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Whenever Firebase says we're logged in, sync the full user data from backend
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Failed to sync user data with backend:", error);
          clearUser();
        }
      } else {
        clearUser();
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [setUser, clearUser]);

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Initializing Auth...</div>;
  }

  return <>{children}</>;
}
