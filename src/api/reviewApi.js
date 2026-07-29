import axiosInstance from "./axiosInstance";

// routes/admin/reviewAdminRoutes.js (mounted at /api/admin/reviews, protect+admin)
export const reviewApi = {
    getAll: (params) => axiosInstance.get("/admin/reviews/all", { params }),
    getPending: (params) => axiosInstance.get("/admin/reviews/pending", { params }),
    updateStatus: (reviewId, payload) =>
        axiosInstance.patch(`/admin/reviews/${reviewId}/status`, payload),
    remove: (reviewId) => axiosInstance.delete(`/admin/reviews/${reviewId}`),
    addBulkDemo: (payload) => axiosInstance.post("/admin/reviews/bulk", payload),
};

export default reviewApi;
