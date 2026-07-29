import axiosInstance from "./axiosInstance";

// routes/admin/couponAdminRoutes.js (mounted at /api/admin/coupons, protect+admin)
export const couponApi = {
    getAll: (params) => axiosInstance.get("/admin/coupons", { params }),
    getOne: (id) => axiosInstance.get(`/admin/coupons/${id}`),
    create: (payload) => axiosInstance.post("/admin/coupons", payload),
    update: (id, payload) => axiosInstance.put(`/admin/coupons/${id}`, payload),
    remove: (id) => axiosInstance.delete(`/admin/coupons/${id}`),
};

export default couponApi;
