import axiosInstance from "./axiosInstance";

// Maps 1:1 to routes/authRoutes.js — keep this file in sync if the backend changes.
export const authApi = {
  // Public
  register: (payload) => axiosInstance.post("/auth/register", payload),
  verifyEmail: (payload) => axiosInstance.post("/auth/verify-email", payload),
  resendVerification: (payload) =>
    axiosInstance.post("/auth/resend-verification", payload),
  login: (payload) => axiosInstance.post("/auth/login", payload),
  forgotPassword: (payload) =>
    axiosInstance.post("/auth/forgot-password", payload),
  resetPassword: (payload) => axiosInstance.put("/auth/reset-password", payload),

  // Protected (Bearer token required)
  getMe: () => axiosInstance.get("/auth/me"),
  logout: () => axiosInstance.get("/auth/logout"),
  updateProfile: (payload) => axiosInstance.put("/auth/profile", payload),
  addShippingAddress: (payload) => axiosInstance.post("/auth/address", payload),
  updateShippingAddress: (addressId, payload) =>
    axiosInstance.put(`/auth/address/${addressId}`, payload),
  deleteShippingAddress: (addressId) =>
    axiosInstance.delete(`/auth/address/${addressId}`),
};
