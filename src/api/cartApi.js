import axiosInstance from "./axiosInstance";

/**
 * Server cart. Every route requires auth (routes/cartRoutes.js uses `protect`),
 * because models/Cart.js declares `user` as required AND unique. A guest cart
 * cannot exist server side by design, which is why the storefront keeps guest
 * carts in localStorage and merges them on login.
 *
 * Response shapes (verified against cartController.js):
 *   get     -> { success, cart, activeCampaigns, appliedPromotions,
 *                totalDiscount, finalTotalPrice, message }
 *   add     -> { success, message, cart }
 *   update  -> { success, cart }
 *   remove  -> { success, cart }
 *   merge   -> { success, cart, merged, skipped: [{ productId, reason }] }
 *
 * IMPORTANT: update and remove address a line by its SERVER item id
 * (cart.items[]._id), not by product id. The cart engine keeps that id on each
 * line so authenticated mutations can address the right row.
 *
 * getCart also self-heals: it drops inactive, deleted and out of stock
 * products, and rewrites priceAtPurchase to the live price. So the response can
 * legitimately contain fewer items than were sent, and different prices.
 */
export const cartApi = {
    get: () => axiosInstance.get("/cart"),

    // variant is { options: [{name, value}], displayName? } or omitted.
    // The server re-reads price and stock from the product, so nothing
    // price related is sent here.
    add: ({ productId, quantity, variant }) =>
        axiosInstance.post("/cart", { productId, quantity, variant }),

    updateItem: (itemId, quantity) => axiosInstance.put(`/cart/${itemId}`, { quantity }),

    removeItem: (itemId) => axiosInstance.delete(`/cart/${itemId}`),

    // Phase 5. Adds quantities for lines that already exist, clamps to stock,
    // and reports anything it had to skip.
    merge: (items) => axiosInstance.post("/cart/merge", { items }),
};

export default cartApi;
