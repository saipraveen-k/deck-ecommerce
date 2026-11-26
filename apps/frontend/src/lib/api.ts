import axios from 'axios';

/**
 * Shared API client for the Express backend (apps/backend).
 * Auth uses the httpOnly `token` cookie the backend sets on login,
 * so every request is sent with credentials.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Session expired or not logged in: clear the cached user so the UI shows logged-out state
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      try {
        localStorage.removeItem('deck-auth');
      } catch {
        /* storage unavailable */
      }
    }
    return Promise.reject(error);
  },
);

export default api;
