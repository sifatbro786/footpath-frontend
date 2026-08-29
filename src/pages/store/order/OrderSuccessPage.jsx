import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

/**
 * Landing page for a completed payment.
 *
 * PHASE 0 SCOPE — this is deliberately a confirmation receipt stub, not the
 * full order view. Its only job right now is to exist: the backend redirects
 * here after every successful SSLCommerz round-trip, and before this route was
 * registered a paying customer landed on a 404.
 *
 * PHASE 7 will fetch the real order via
 *   GET /api/orders/:orderId?token=<guestAccessToken>
 * and render items, address and totals.
 *
 * The `token` param is the guest capability token minted at order creation and
 * handed back through the gateway redirect (see paymentController
 * buildOrderResultUrl). It is persisted below so a refresh — which drops the
 * query string on some gateway configurations — can still read the order back.
 */
const OrderSuccessPage = () => {
    const [params] = useSearchParams();
    const orderId = params.get("orderId");
    const orderNumber = params.get("orderNumber");
    const token = params.get("token");

    useEffect(() => {
        if (!orderNumber || !token) return;
        try {
            localStorage.setItem(`orderToken:${orderNumber}`, token);
        } catch {
            // Private mode / storage disabled — the query param still works for
            // this pageview, so this is a non-fatal degradation.
        }
    }, [orderNumber, token]);

    return (
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
            <CheckCircle2 className="h-14 w-14 text-grass" aria-hidden="true" />

            <span className="mt-6 font-label text-xs uppercase tracking-[0.28em] text-muted">
                Payment received
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
                Thank you for your order
            </h1>
            <p className="mt-3 text-sm text-ink-soft sm:text-base">
                We&apos;ve got it. A confirmation is on its way to your email, and we&apos;ll
                message you as soon as it ships.
            </p>

            {orderNumber && (
                <div className="mt-8 w-full rounded-lg border border-line bg-paper-dim px-5 py-4">
                    <p className="font-label text-xs uppercase tracking-[0.2em] text-muted">
                        Order number
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold tracking-tight text-ink">
                        {orderNumber}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                        Keep this — you&apos;ll need it to track your order.
                    </p>
                </div>
            )}

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                    to="/shop"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark sm:w-auto"
                >
                    Continue shopping
                </Link>
                {orderId && (
                    <Link
                        to="/profile"
                        className="inline-flex w-full items-center justify-center rounded-lg border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-paper-dim sm:w-auto"
                    >
                        View my orders
                    </Link>
                )}
            </div>
        </div>
    );
};

export default OrderSuccessPage;
