import { Link, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";

/**
 * Landing page for a payment the customer backed out of.
 *
 * PHASE 0 SCOPE — stub. Previously the backend sent cancellations to
 * /order/fail, which told someone who chose to cancel that something had gone
 * wrong. paymentController now routes them here instead.
 *
 * PHASE 7 adds cart restoration so "changed my mind" doesn't cost them their
 * basket — the order is already cancelled server-side by this point.
 */
const OrderCancelPage = () => {
    const [params] = useSearchParams();
    const orderNumber = params.get("orderNumber");

    return (
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
            <XCircle className="h-14 w-14 text-muted" aria-hidden="true" />

            <span className="mt-6 font-label text-xs uppercase tracking-[0.28em] text-muted">
                Payment cancelled
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
                You cancelled the payment
            </h1>
            <p className="mt-3 text-sm text-ink-soft sm:text-base">
                No money has been taken and nothing has shipped. Your order has been cancelled —
                start again whenever you&apos;re ready.
            </p>

            {orderNumber && (
                <p className="mt-6 font-label text-xs uppercase tracking-[0.2em] text-muted">
                    Cancelled order · {orderNumber}
                </p>
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

export default OrderCancelPage;
