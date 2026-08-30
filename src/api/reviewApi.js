import axiosInstance from "./axiosInstance";

// routes/admin/reviewAdminRoutes.js (mounted at /api/admin/reviews, protect+admin)
export const reviewApi = {
    getAll: (params) => axiosInstance.get("/admin/reviews/all", { params }),
    getPending: (params) => axiosInstance.get("/admin/reviews/pending", { params }),
    updateStatus: (reviewId, payload) =>
        axiosInstance.patch(`/admin/reviews/${reviewId}/status`, payload),
    remove: (reviewId) => axiosInstance.delete(`/admin/reviews/${reviewId}`),
    addBulkDemo: (payload) => axiosInstance.post("/admin/reviews/bulk", payload),

    // ── Public / storefront (Phase 4) ────────────────────────────────────
    //
    // GET /api/reviews/product/:productId
    //   -> { success, reviews, totalPages, currentPage, total,
    //        ratingStats: [{ _id: <rating>, count }],   ← sparse: only ratings
    //                                                     that actually occur
    //        averageRating, totalReviews }
    // Approved reviews only. `ratingStats` skips ratings with no reviews, so a
    // histogram must fill the gaps itself rather than indexing the array.
    getForProduct: (productId, params) =>
        axiosInstance.get(`/reviews/product/${productId}`, { params }),

    // POST /api/reviews  (auth required)
    // Body: { productId, rating, comment }
    // Saves with status "pending" — a new review does NOT appear in the list
    // until an admin approves it. The UI has to say so, or people will assume
    // it failed and post again (the server rejects a second one with 400,
    // "You have already reviewed this product").
    create: ({ productId, rating, comment }) =>
        axiosInstance.post("/reviews", { productId, rating, comment }),

    update: (reviewId, payload) => axiosInstance.put(`/reviews/${reviewId}`, payload),
    removeOwn: (reviewId) => axiosInstance.delete(`/reviews/${reviewId}`),
    getMine: () => axiosInstance.get("/reviews/my-reviews"),

    // GET /api/reviews/featured -> { success, count, reviews }
    // Added in Phase 4 for the homepage testimonials strip: approved, 4 stars
    // and up, with a comment long enough to read as a quote.
    getFeatured: (limit = 6) => axiosInstance.get("/reviews/featured", { params: { limit } }),
};

export default reviewApi;
