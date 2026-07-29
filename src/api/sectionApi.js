import axiosInstance from "./axiosInstance";

// routes/admin/productAdminRoutes.js — sections live under the product admin
// router (mounted at /api/admin/products, protect+admin).
export const sectionApi = {
    getAll: (params) => axiosInstance.get("/admin/products/sections", { params }),
    create: (payload) => axiosInstance.post("/admin/products/sections", payload),
    update: (id, payload) => axiosInstance.put(`/admin/products/sections/${id}`, payload),
    remove: (id) => axiosInstance.delete(`/admin/products/sections/${id}`),
    toggle: (id) => axiosInstance.patch(`/admin/products/sections/${id}/toggle`),
};

export default sectionApi;
