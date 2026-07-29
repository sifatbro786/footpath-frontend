// src/api/adminShippingApi.js
import axiosInstance from "./axiosInstance";

// routes/admin/adminShippingRoutes.js — mounted at /api/admin/shipping
// (server.js: app.use("/api/admin/shipping", adminShippingRoutes)). protect + adminOnly.
const base = "/admin/shipping";

export const adminShippingApi = {
    // ── Districts ──
    getDistricts: () => axiosInstance.get(`${base}/districts`),
    getDistrict: (id) => axiosInstance.get(`${base}/districts/${id}`),
    createDistrict: (payload) => axiosInstance.post(`${base}/districts`, payload),
    updateDistrict: (id, payload) => axiosInstance.put(`${base}/districts/${id}`, payload),
    deleteDistrict: (id) => axiosInstance.delete(`${base}/districts/${id}`),

    // ── Upazilas (nested) — each returns the updated parent district ──
    addUpazila: (districtId, payload) =>
        axiosInstance.post(`${base}/districts/${districtId}/upazilas`, payload),
    updateUpazila: (districtId, upazilaId, payload) =>
        axiosInstance.put(`${base}/districts/${districtId}/upazilas/${upazilaId}`, payload),
    deleteUpazila: (districtId, upazilaId) =>
        axiosInstance.delete(`${base}/districts/${districtId}/upazilas/${upazilaId}`),

    // ── Courier branches ──
    getCourierBranches: () => axiosInstance.get(`${base}/courier-branches`),
    createCourierBranch: (payload) => axiosInstance.post(`${base}/courier-branches`, payload),
    updateCourierBranch: (id, payload) =>
        axiosInstance.put(`${base}/courier-branches/${id}`, payload),
    deleteCourierBranch: (id) => axiosInstance.delete(`${base}/courier-branches/${id}`),
    addBranch: (id, branchName) =>
        axiosInstance.post(`${base}/courier-branches/${id}/add-branch`, { branchName }),
    // NOTE: DELETE with a body — backend reads req.body.branchName, so axios needs { data }.
    removeBranch: (id, branchName) =>
        axiosInstance.delete(`${base}/courier-branches/${id}/remove-branch`, {
            data: { branchName },
        }),

    // ── Shipping rates ──
    getRates: () => axiosInstance.get(`${base}/rates`),
    createRate: (payload) => axiosInstance.post(`${base}/rates`, payload),
    updateRate: (id, payload) => axiosInstance.put(`${base}/rates/${id}`, payload),
};

export default adminShippingApi;
