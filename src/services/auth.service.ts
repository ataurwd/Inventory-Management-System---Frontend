import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types/user.types';
import api from './api';

export const authService = {
  login: async (credentials: Record<string, string>) => {
    // 1. Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const firebaseUser = userCredential.user;
    
    // We don't need to manually store the token, Firebase SDK handles it
    
    // 2. Fetch the user details from our backend (which verifies the token and returns the MongoDB user object with roles)
    const { data } = await api.get<{ success: boolean; data: User }>('/users/me');
    
    return data.data;
  },
  
  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    
    try {
      const { data } = await api.get<{ success: boolean; data: User }>('/users/me');
      return data.data;
    } catch (error: any) {
      // If the backend rejects them, they aren't a valid user. Sign them out of Firebase too.
      await signOut(auth);
      
      if (error.response?.status === 401) {
        throw new Error("You don't have an account on this system. Please contact the administrator.");
      }
      throw error;
    }
  },
  
  logout: async () => {
    await signOut(auth);
  },
  
  getMe: async () => {
    // Fetch the user details from our backend to get role-based access info
    const { data } = await api.get<{ success: boolean; data: User }>('/users/me');
    return data.data;
  },
};
