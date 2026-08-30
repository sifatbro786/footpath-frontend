// src/lib/store/orderAccess.js
//
// Guest order capability tokens.
//
// A guest order is protected by an unguessable token minted at creation
// (Phase 0, models/Order.js guestAccessToken). Without it,
// GET /api/orders/:id returns 401 even to the person who placed the order.
//
// The token reaches the browser twice and never again:
//   1. in the createOrder response, before the gateway redirect
//   2. appended to the /order/success redirect the gateway sends the customer to
//
// Both moments are fragile. A refresh can drop the query string, and the
// createOrder response is gone the instant we navigate. So it is persisted
// here, keyed by order number, and read back by the confirmation page.
//
// localStorage rather than sessionStorage on purpose: a shopper who closes the
// tab and comes back to their emailed order link should still be able to see
// it. The token is scoped to a single order and grants nothing else.

const PREFIX = "elmate.orderToken.";

export function rememberGuestOrderToken(orderNumber, token) {
    if (!orderNumber || !token) return;
    try {
        localStorage.setItem(PREFIX + orderNumber, token);
    } catch {
        // Private mode. The query string still works for this pageview.
    }
}

export function recallGuestOrderToken(orderNumber) {
    if (!orderNumber) return null;
    try {
        return localStorage.getItem(PREFIX + orderNumber);
    } catch {
        return null;
    }
}

/**
 * Token for a lookup, preferring the URL over storage.
 *
 * The URL wins because it is the fresher of the two: it is what the gateway
 * just handed back, whereas storage could hold a value from an earlier attempt
 * at the same order number.
 */
export function resolveOrderToken({ urlToken, orderNumber }) {
    if (urlToken) {
        rememberGuestOrderToken(orderNumber, urlToken);
        return urlToken;
    }
    return recallGuestOrderToken(orderNumber);
}
