import axiosInstance from "./axiosInstance";

/**
 * Signed-in account operations (Phase 6).
 *
 * Shapes verified against controllers/authController.js, orderController.js and
 * wishlistController.js.
 */
export const accountApi = {
    // ── Profile ──────────────────────────────────────────────────────────
    //
    // PUT /api/auth/profile -> { success, message, user }
    //
    // Accepts name, phoneNumber, profilePicture, dateOfBirth, gender and
    // (added in Phase 6) preferences. Anything else in the body is dropped by
    // the controller's whitelist.
    updateProfile: (payload) => axiosInstance.put("/auth/profile", payload),

    // PUT /api/auth/change-password -> { success, message }
    //
    // Requires the CURRENT password, unlike the OTP reset flow. Returns 401
    // when it is wrong, 400 for a weak or unchanged new password.
    changePassword: ({ currentPassword, newPassword }) =>
        axiosInstance.put("/auth/change-password", { currentPassword, newPassword }),

    // ── Address book ─────────────────────────────────────────────────────
    //
    // All three return the FULL updated user, not just the address list, so the
    // caller should refresh its user state from the response.
    //
    // Address shape (User.shippingAddress): fullName, phoneNumber,
    // addressLine1, addressLine2, city, state, zipCode, country, isDefault,
    // addressType. Note this is a DIFFERENT shape from Order.shippingAddress,
    // which uses name/phone/district/upazila. The two were designed separately.
    addAddress: (address) => axiosInstance.post("/auth/address", address),
    updateAddress: (addressId, address) =>
        axiosInstance.put(`/auth/address/${addressId}`, address),
    deleteAddress: (addressId) => axiosInstance.delete(`/auth/address/${addressId}`),

    // ── Orders ───────────────────────────────────────────────────────────
    //
    // GET /api/orders -> { success, count, orders }
    // Requires auth (Phase 0 changed this from optionalProtect, which used to
    // 500 for guests). adminNotes are stripped server side.
    getMyOrders: () => axiosInstance.get("/orders"),

    // POST /api/orders/track -> { success, order }
    //
    // Public guest lookup by order number + phone. POST rather than GET so the
    // phone number never lands in access logs or browser history. Rate limited
    // to 10 per 15 minutes. Returns a SUBSET of the order: status, timeline,
    // items and totals, with only a coarse destination.
    trackOrder: ({ orderNumber, phone }) =>
        axiosInstance.post("/orders/track", { orderNumber, phone }),

    // ── Wishlist ─────────────────────────────────────────────────────────
    //
    // All routes require auth. -> { success, count, items: [{ product, addedAt }] }
    // `add` is idempotent: saving an already-saved product returns 200, not 400.
    getWishlist: () => axiosInstance.get("/wishlist"),
    addToWishlist: (productId) => axiosInstance.post("/wishlist", { productId }),
    removeFromWishlist: (productId) => axiosInstance.delete(`/wishlist/${productId}`),
    clearWishlist: () => axiosInstance.delete("/wishlist"),
};

export default accountApi;
