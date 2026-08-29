import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

/**
 * Landing page for a failed payment.
 *
 * PHASE 0 SCOPE — stub. Registered so the gateway's fail redirect has somewhere
 * to land. PHASE 7 adds order lookup and a real retry that re-initialises
 * payment against the same order.
 *
 * `reason` values emitted by paymentController:
 *   payment_failed        gateway declined or errored
 *   verification_failed   gateway said VALID but our server-side validation
 *                         against SSLCommerz's API did not agree — treated as
 *                         unpaid on purpose
 *   server_error          unexpected exception during the callback
 */
const REASONS = {
    payment_failed: "Your payment didn't go through. No money has been taken.",
    verification_failed:
        "We couldn't verify this payment with the gateway, so we've left the order unpaid. If you were charged, contact us with the order number and we'll sort it out.",
    server_error: "Something broke on our side while confirming the payment. No money has been taken.",
};

const OrderFailPage = () => {
    const [params] = useSearchParams();
    const orderNumber = params.get("orderNumber");
    const reason = params.get("reason");

    const message =
        REASONS[reason] ?? "Your payment didn't complete. No money has been taken.";

    return (
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
            <AlertTriangle className="h-14 w-14 text-coral" aria-hidden="true" />

            <span className="mt-6 font-label text-xs uppercase tracking-[0.28em] text-muted">
                Payment not completed
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
                We couldn&apos;t take your payment
            </h1>
            <p className="mt-3 text-sm text-ink-soft sm:text-base">{message}</p>

            {orderNumber && (
                <div className="mt-8 w-full rounded-lg border border-line bg-paper-dim px-5 py-4">
                    <p className="font-label text-xs uppercase tracking-[0.2em] text-muted">
                        Order number
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold tracking-tight text-ink">
                        {orderNumber}
                    </p>
                </div>
            )}

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                    to="/cart"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark sm:w-auto"
                >
                    Back to cart
                </Link>
                <Link
                    to="/shop"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-paper-dim sm:w-auto"
                >
                    Keep shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderFailPage;
