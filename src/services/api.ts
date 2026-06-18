import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { auth } from '@/lib/firebase';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request Interceptor ──────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      // Get the Firebase token asynchronously
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // We let the components handle the 401 via catch block.
    // E.g., (app)/layout.tsx catches getMe() 401 and calls router.push('/login')
    return Promise.reject(error);
  }
);

export default api;
