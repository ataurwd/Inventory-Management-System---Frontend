import { useAuthStore } from '@/store/auth.store';

export const useAuth = () => {
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore();
  
  return {
    user,
    role: user?.role,
    isAuthenticated,
    setUser,
    clearUser,
  };
};
