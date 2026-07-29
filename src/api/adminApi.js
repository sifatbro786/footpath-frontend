import axiosInstance from "./axiosInstance";

// Maps to routes/admin/analyticsRoutes.js (mounted at /api/admin/analytics)
export const analyticsApi = {
  getDashboard: (period = "monthly") =>
    axiosInstance.get("/admin/analytics/dashboard", { params: { period } }),
  getSalesReport: (params) =>
    axiosInstance.get("/admin/analytics/sales-report", { params }),
};

// Maps to routes/admin/adminRoutes.js (mounted at /api/admin) — user management
export const adminUsersApi = {
  getAnalytics: () => axiosInstance.get("/admin/analytics"),
  getUsers: (params) => axiosInstance.get("/admin/users", { params }),
  getUser: (id) => axiosInstance.get(`/admin/users/${id}`),
  createUser: (payload) => axiosInstance.post("/admin/users", payload),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => axiosInstance.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, status) =>
    axiosInstance.put(`/admin/users/${id}/status`, { status }),
};
