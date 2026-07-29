// src/api/adminCartApi.js
import axiosInstance from "./axiosInstance";

/**
 * routes/admin/adminCartRoutes.js — mounted at /api/admin/cart-campaigns
 * (see server.js: app.use("/api/admin/cart-campaigns", adminCartRoutes)).
 * All endpoints are protect + adminOnly.
 *
 * NOTE: this drives the ABANDONED-CART Campaign + Promotion system
 * (adminCartController.js), NOT ProductCampaign. Different subsystem.
 */
export const adminCartApi = {
    // GET /stats -> { success, stats: { totalCarts, activeCarts, abandonedCarts,
    //                 totalUsers, popularProducts[], totalCartValue } }
    getStats: () => axiosInstance.get("/admin/cart-campaigns/stats"),

    // GET /carts?page&limit&search[&status] -> { success, carts[], totalPages, currentPage, total }
    // `status` is only honored if you apply the optional backend patch (see notes);
    // otherwise it is ignored server-side and we filter the loaded page client-side.
    getAllCarts: (params) => axiosInstance.get("/admin/cart-campaigns/carts", { params }),

    // GET /abandoned-carts -> { success, abandonedCarts[], count } (not paginated/searchable)
    getAbandonedCarts: () => axiosInstance.get("/admin/cart-campaigns/abandoned-carts"),

    // POST /create-campaign
    // payload: { name, description, discountType, discountValue, durationHours,
    //            minimumCartValue?, targetType, targetUsers? }
    //   discountType: "percentage" | "fixed_amount"  (⚠️ Promotion enum — NOT "fixed")
    //   targetType:   "abandoned_cart" | "all_users" | "specific_users"
    //   targetUsers:  string[] of userIds (only when targetType === "specific_users")
    // -> { success, message, promotion, campaignsCreated }
    createCampaign: (payload) =>
        axiosInstance.post("/admin/cart-campaigns/create-campaign", payload),

    // POST /bulk-promotions  { userIds: string[], promotionData: object }
    sendBulkPromotions: (payload) =>
        axiosInstance.post("/admin/cart-campaigns/bulk-promotions", payload),
};

export default adminCartApi;
