import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5010/api",
  withCredentials: true, // backend sets an httpOnly cookie too (CORS credentials:true)
});

// IMPORTANT: authMiddleware.js `protect` ONLY reads req.headers.authorization
// ("Bearer <token>") — it never reads the cookie, even though login sets one.
// So the cookie is effectively decorative for API auth; we must attach the
// token manually on every request.
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling: token missing/expired/invalid → force re-login.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
