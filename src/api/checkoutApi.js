import axiosInstance from "./axiosInstance";

/**
 * Checkout and order placement.
 *
 * Verified against controllers/checkoutController.js, couponController.js and
 * orderController.js.
 *
 * THE RULE THAT MATTERS: nothing price related is ever sent to the server.
 * createOrder recomputes shipping, tax, discount, COD split and total through
 * services/pricingService.js and ignores any of those values in the body. The
 * calculate endpoint below exists so the UI can DISPLAY the same numbers the
 * order will be charged, not so the client can decide them.
 */
export const checkoutApi = {
    // GET /api/checkout/shipping-rates
    //   -> { success, rates: [...], lowestFreeShippingThreshold }
    // Public summary added in Phase 5 for the free delivery progress bar,
    // which needs a threshold before any address exists.
    getShippingRates: () => axiosInstance.get("/checkout/shipping-rates"),

    // -> { success, districts: [name, ...] }   (plain strings, not objects)
    getDistricts: () => axiosInstance.get("/checkout/districts"),

    // -> { success, upazilas: [{ name, shippingZone }] }
    getUpazilas: (district) =>
        axiosInstance.get(`/checkout/upazilas/${encodeURIComponent(district)}`),

    // -> { success, branches: [name, ...] }
    getCourierBranches: (district) =>
        axiosInstance.get(`/checkout/courier-branches/${encodeURIComponent(district)}`),

    // POST -> { success, locationType, shippingZone, availableDeliveryTypes }
    //
    // locationType is DERIVED from the upazila's shippingZone, never chosen by
    // the shopper. Courier is unavailable for dhaka_inside and dhaka_sub, and
    // availableDeliveryTypes reflects that.
    validateLocation: ({ district, upazila }) =>
        axiosInstance.post("/checkout/validate-location", { district, upazila }),

    // POST -> { success, data: { itemsSubtotal, discountAmount, shippingPrice,
    //           taxPrice, codCharge, codOnlinePaymentAmount, remainingAmount,
    //           finalTotal, estimatedDelivery, breakdown: {...}, ... } }
    //
    // Guests must pass guestItems; signed in users pass none and the server
    // reads their cart. An incomplete address returns 200 with zeroed shipping
    // and a `message`, NOT an error, so the UI can show a running total while
    // the form is still being filled.
    calculate: (payload) => axiosInstance.post("/checkout/calculate", payload),

    // POST /api/coupons/apply
    //
    // NOTE the path: it is /apply, not /validate. Rate limited to 20 per 15
    // minutes per IP (Phase 0) because an unauthenticated coupon lookup is a
    // code enumeration oracle.
    //
    // Body: { couponCode, cartItems: [{ productId, price, quantity }], userId? }
    //   -> { success, couponCode, discountAmount, finalCartTotal,
    //        eligibleAmount, isFreeShipping }
    // discountAmount comes back as a STRING (toFixed), so coerce before maths.
    applyCoupon: ({ couponCode, cartItems, userId }) =>
        axiosInstance.post("/coupons/apply", { couponCode, cartItems, userId }),

    // POST /api/orders
    //   -> 201 { success, message, order, guestAccessToken?, redirectUrl,
    //            codOnlinePaymentAmount?, remainingAmount?, note? }
    //
    // BOTH payment methods return a redirectUrl: COD is not a gateway bypass,
    // it charges the delivery + COD fee online up front and collects the rest
    // on delivery. Treat redirectUrl as mandatory for both.
    //
    // guestAccessToken is returned ONCE, only for guest orders. It is the
    // capability token that lets a guest read their own order back
    // (GET /api/orders/:id?token=...). Persist it immediately or it is lost.
    createOrder: (payload) => axiosInstance.post("/orders", payload),

    // GET /api/orders/:id -> { success, order }
    //
    // `id` accepts either the Mongo _id or the orderNumber; the controller tries
    // orderNumber first. Guests must present their capability token, which is
    // sent as a header here rather than a query param so it stays out of
    // referrers, browser history and server access logs. The controller accepts
    // both (?token= exists only because the gateway redirect cannot set headers).
    getOrder: (id, token) =>
        axiosInstance.get(`/orders/${encodeURIComponent(id)}`, {
            headers: token ? { "x-order-token": token } : undefined,
        }),
};

export default checkoutApi;
