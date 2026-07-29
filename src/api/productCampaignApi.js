import axiosInstance from "./axiosInstance";

// routes/admin/productCampaignAdminRoutes.js (mounted at /api/admin/product-campaigns, protect+admin)
export const productCampaignApi = {
    getAll: (params) => axiosInstance.get("/admin/product-campaigns", { params }),
    getOne: (id) => axiosInstance.get(`/admin/product-campaigns/${id}`),
    create: (payload) => axiosInstance.post("/admin/product-campaigns", payload),
    update: (id, payload) => axiosInstance.put(`/admin/product-campaigns/${id}`, payload),
    remove: (id) => axiosInstance.delete(`/admin/product-campaigns/${id}`),
    apply: (id) => axiosInstance.post(`/admin/product-campaigns/${id}/apply`),
    rollback: (id) => axiosInstance.post(`/admin/product-campaigns/${id}/rollback`),
    getProducts: (id, params) =>
        axiosInstance.get(`/admin/product-campaigns/${id}/products`, { params }),
};

export default productCampaignApi;
