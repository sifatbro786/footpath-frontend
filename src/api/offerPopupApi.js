import axiosInstance from "./axiosInstance";

// Admin endpoints live in routes/admin/offerPopupAdminRoutes.js
// (mounted at /api/admin/offers, guarded by protect + adminOnly).
//
// NOTE on response shapes (verified against offerPopupController.js):
//   getAll  -> { success, data: [...], pagination: { total, page, pages, limit } }
//              ^ pagination key is `pages`, NOT `totalPages`.
//   create  -> POST /create (not RESTful "/") -> { success, message, data }
//   update  -> { success, message, data }
//   remove  -> { success, message }
//   toggle  -> { success, message, data }  (flips isActive server-side)
export const offerPopupApi = {
    getAll: (params) => axiosInstance.get("/admin/offers/all", { params }),
    create: (payload) => axiosInstance.post("/admin/offers/create", payload),
    update: (id, payload) => axiosInstance.put(`/admin/offers/${id}`, payload),
    remove: (id) => axiosInstance.delete(`/admin/offers/${id}`),
    toggle: (id) => axiosInstance.patch(`/admin/offers/${id}/toggle`),

    // Dedicated offer-image upload -> saves to uploads/offers/.
    // field name "image", returns { success, imageUrl, filename, file }.
    //
    // ⚠️ REQUIRES backend Fix #1 (uploadAdminRoutes.js): the "/offer" route must
    // NOT have an outer upload.single("image") middleware — uploadOfferImage runs
    // its own multer internally. Without that fix this endpoint returns 400.
    // If you prefer not to apply the fix, swap the path to "/admin/upload/single"
    // (already working, but files land in uploads/products/).
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return axiosInstance.post("/admin/upload/offer", formData);
    },
};

export default offerPopupApi;
