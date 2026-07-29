import axiosInstance from "./axiosInstance";

// Admin endpoints: routes/admin/pageMetaAdminRoutes.js
// (mounted at /api/admin/page-meta, guarded by protect + adminOnly).
//
// Response shapes (verified against pageMetaController.js):
//   getAll -> { success, data: [...], count, message }   ← NO pagination, returns ALL
//   create -> POST "/"        -> { success, data, message }        (201)
//   update -> PUT "/:id"      -> { success, data, message }
//   remove -> DELETE "/:id"   -> { success, message, deletedId }
//   toggle -> PATCH "/:id/toggle" -> { success, data, message }
//   bulk   -> PUT "/bulk/update"  -> { success, message, modifiedCount }
export const pageMetaApi = {
    getAll: () => axiosInstance.get("/admin/page-meta/all"),
    create: (payload) => axiosInstance.post("/admin/page-meta/", payload),
    update: (id, payload) => axiosInstance.put(`/admin/page-meta/${id}`, payload),
    remove: (id) => axiosInstance.delete(`/admin/page-meta/${id}`),
    toggle: (id, payload = {}) => axiosInstance.patch(`/admin/page-meta/${id}/toggle`, payload),
    bulkUpdate: (pages) => axiosInstance.put("/admin/page-meta/bulk/update", { pages }),

    // Public read (isActive only) — handy for previewing what the storefront resolves.
    getBySlug: (slug) => axiosInstance.get(`/page-meta/${slug}`),
};

export default pageMetaApi;
