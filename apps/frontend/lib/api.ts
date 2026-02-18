import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    withCredentials: true, // Important for Cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401/403 globally if needed (e.g. redirect to login)
        return Promise.reject(error);
    }
);

export default api;
