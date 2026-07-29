import axiosInstance from "./axiosInstance";

// routes/admin/adminOrderRoutes.js (mounted at /api/admin/orders, protect+admin)
export const orderApi = {
    getAll: (params) => axiosInstance.get("/admin/orders", { params }),
    getStats: () => axiosInstance.get("/admin/orders/stats"),
    getOne: (id) => axiosInstance.get(`/admin/orders/${id}`),
    updateStatus: (id, payload) => axiosInstance.put(`/admin/orders/${id}/status`, payload),
    updatePaymentStatus: (id, paymentStatus) =>
        axiosInstance.put(`/admin/orders/${id}/payment`, { paymentStatus }),
    addNote: (id, note) => axiosInstance.post(`/admin/orders/${id}/notes`, { note }),
    remove: (id) => axiosInstance.delete(`/admin/orders/${id}`),
    // orderController.updateOrderDetails — full edit (items/shipping/pricing/coupon).
    // Recalculates totalPrice server-side from itemsTotal + shipping + tax - discount.
    // Not wired into OrderDetail.jsx yet (kept out of scope for this pass) — the
    // export is here so an "Edit Order" screen can use it later without touching this file.
    updateDetails: (id, payload) => axiosInstance.put(`/admin/orders/${id}`, payload),
};
