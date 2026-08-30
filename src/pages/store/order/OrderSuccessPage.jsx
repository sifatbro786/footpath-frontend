import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Printer } from "lucide-react";

import Seo from "../../../components/common/Seo";
import { PageLoader } from "../../../components/common/Skeleton";
import { checkoutApi } from "../../../api/checkoutApi";
import { resolveOrderToken } from "../../../lib/store/orderAccess";
import { formatPrice } from "../../../lib/store/productMapper";
import { useCart } from "../../../hooks/useCart";

/**
 * Order confirmation and receipt.
 *
 * Reached three ways, all of which must work:
 *   1. /order/success?orderId=&orderNumber=&token=   the gateway redirect,
 *      built by paymentController.buildOrderResultUrl
 *   2. /order-confirmation/:orderId                  the friendlier permalink
 *   3. a return visit with no query string at all, where the token comes from
 *      localStorage
 *
 * Guests authenticate with the capability token; signed in shoppers are matched
 * by their JWT and need no token.
 */

const STATUS_COPY = {
    Pending: "We have your order and are waiting on payment confirmation.",
    Confirmed: "Your order is confirmed and being prepared.",
    Processing: "Payment received. Your order is being prepared.",
    Shipped: "Your order is on its way.",
    Delivered: "Delivered. We hope it all works out.",
    Cancelled: "This order was cancelled.",
    Refunded: "This order has been refunded.",
};

const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export default function OrderSuccessPage() {
    const { orderId: orderIdParam } = useParams();
    const [params] = useSearchParams();
    const { resetAfterOrder } = useCart();

    const orderNumber = params.get("orderNumber");
    const lookupId = orderIdParam || orderNumber || params.get("orderId");
    const urlToken = params.get("token");

    const token = useMemo(
        () => resolveOrderToken({ urlToken, orderNumber: orderNumber || lookupId }),
        [urlToken, orderNumber, lookupId],
    );

    // Landing here means the order was placed. Clear any basket that survived
    // the gateway round trip (a COD failure part way through can leave one).
    useEffect(() => {
        resetAfterOrder();
        // Intentionally once, on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["order", lookupId, token],
        queryFn: () => checkoutApi.getOrder(lookupId, token).then((r) => r.data?.order ?? null),
        enabled: Boolean(lookupId),
        retry: false,
    });

    if (isLoading) return <PageLoader />;

    const unauthorised = error?.response?.status === 401 || error?.response?.status === 403;

    // Even when the order cannot be read back, the payment DID succeed. Say so
    // plainly rather than showing a failure, and give them the order number.
    if (isError || !data) {
        return (
            <>
                <Seo title="Order received | Elmate Stationery" noIndex />
                <div className="mx-auto max-w-xl px-4 py-24 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-grass" aria-hidden="true" />
                    <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
                        Thank you for your order
                    </h1>
                    {orderNumber && (
                        <p className="mt-4 font-label text-sm uppercase tracking-[0.16em] text-ink">
                            {orderNumber}
                        </p>
                    )}
                    <p className="mt-4 text-[15px] text-ink-soft">
                        {unauthorised
                            ? "Your order is placed. We cannot show the details on this device, but a confirmation is on its way to your email."
                            : "Your order is placed and a confirmation is on its way to your email."}
                    </p>
                    <Link
                        to="/shop"
                        className="mt-8 inline-block border border-ink bg-ink px-6 py-3 font-label
                                   text-[11px] uppercase tracking-[0.18em] text-paper
                                   transition-colors hover:bg-transparent hover:text-ink"
                    >
                        Continue shopping
                    </Link>
                </div>
            </>
        );
    }

    const order = data;
    const address = order.shippingAddress ?? {};

    return (
        <>
            <Seo title={`Order ${order.orderNumber} | Elmate Stationery`} noIndex />

            <div className="mx-auto max-w-3xl px-4 pb-20 pt-10">
                <header className="text-center print:text-left">
                    <CheckCircle2
                        className="mx-auto h-12 w-12 text-grass print:hidden"
                        aria-hidden="true"
                    />
                    <p className="mt-5 font-label text-[11px] uppercase tracking-[0.2em] text-ink/45">
                        Order received
                    </p>
                    <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
                        Thank you, {address.name?.split(" ")[0] || "friend"}
                    </h1>
                    <p className="mt-3 text-[15px] text-ink-soft">
                        {STATUS_COPY[order.orderStatus] ?? "We have your order."}
                    </p>
                </header>

                <div className="mt-10 border border-line">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
                        <div>
                            <p className="font-label text-[11px] uppercase tracking-[0.16em] text-ink/45">
                                Order number
                            </p>
                            <p className="mt-1 font-display text-lg font-semibold text-ink">
                                {order.orderNumber}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-label text-[11px] uppercase tracking-[0.16em] text-ink/45">
                                Placed
                            </p>
                            <p className="mt-1 font-label text-sm text-ink">
                                {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 border border-ink/20 px-3.5 py-2
                                       font-label text-[11px] uppercase tracking-[0.16em] text-ink
                                       transition-colors hover:border-ink print:hidden"
                        >
                            <Printer size={13} />
                            Print
                        </button>
                    </div>

                    <ul className="divide-y divide-line px-5">
                        {(order.orderItems ?? []).map((item, i) => (
                            <li key={i} className="flex gap-4 py-4">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt=""
                                        className="h-16 w-16 shrink-0 border border-line object-cover"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-[14px] font-medium leading-snug text-ink">
                                        {item.name}
                                    </p>
                                    <p className="mt-1 font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                                        Qty {item.quantity}
                                    </p>
                                </div>
                                <p className="shrink-0 font-label text-sm tabular-nums text-ink">
                                    {formatPrice(item.price * item.quantity)}
                                </p>
                            </li>
                        ))}
                    </ul>

                    <dl className="space-y-2.5 border-t border-line px-5 py-4 text-sm">
                        {order.discountAmount > 0 && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-grass">
                                    Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                                </dt>
                                <dd className="font-label tabular-nums text-grass">
                                    &minus;{formatPrice(order.discountAmount)}
                                </dd>
                            </div>
                        )}
                        <div className="flex justify-between gap-4">
                            <dt className="text-ink-soft">Delivery</dt>
                            <dd className="font-label tabular-nums text-ink">
                                {order.shippingPrice === 0
                                    ? "Free"
                                    : formatPrice(order.shippingPrice)}
                            </dd>
                        </div>
                        {order.codCharge > 0 && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-ink-soft">Cash on delivery fee</dt>
                                <dd className="font-label tabular-nums text-ink">
                                    {formatPrice(order.codCharge)}
                                </dd>
                            </div>
                        )}
                        {order.taxPrice > 0 && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-ink-soft">VAT</dt>
                                <dd className="font-label tabular-nums text-ink">
                                    {formatPrice(order.taxPrice)}
                                </dd>
                            </div>
                        )}
                    </dl>

                    <div className="border-t border-line px-5 py-4">
                        <div className="flex items-baseline justify-between gap-4">
                            <span className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/55">
                                Total
                            </span>
                            <span className="font-display text-2xl font-semibold tabular-nums text-ink">
                                {formatPrice(order.totalPrice)}
                            </span>
                        </div>

                        {/* Only shown for a COD order with a real split, so the
                            shopper knows exactly what the rider will ask for. */}
                        {order.paymentMethod === "COD" && order.remainingAmount > 0 && (
                            <div className="mt-4 border-l-2 border-marigold bg-paper-dim px-4 py-3">
                                <p className="font-label text-[11px] uppercase tracking-[0.16em] text-ink">
                                    Due on delivery
                                </p>
                                <p className="mt-1.5 font-display text-lg font-semibold tabular-nums text-ink">
                                    {formatPrice(order.remainingAmount)}
                                </p>
                                <p className="mt-1 text-[12px] text-ink/55">
                                    Please have this ready in cash for the rider.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <section className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div>
                        <h2 className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/45">
                            Delivering to
                        </h2>
                        <address className="mt-3 text-sm not-italic leading-relaxed text-ink-soft">
                            <span className="block text-ink">{address.name}</span>
                            {address.addressLine1 && <span className="block">{address.addressLine1}</span>}
                            {address.addressLine2 && <span className="block">{address.addressLine2}</span>}
                            {address.courierBranch && (
                                <span className="block">Branch: {address.courierBranch}</span>
                            )}
                            <span className="block">
                                {[address.upazila, address.district].filter(Boolean).join(", ")}
                            </span>
                            <span className="block">{address.phone}</span>
                        </address>
                    </div>

                    <div>
                        <h2 className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/45">
                            Payment
                        </h2>
                        <p className="mt-3 text-sm text-ink-soft">
                            {order.paymentMethod === "COD"
                                ? "Cash on delivery"
                                : "Paid online"}
                            <span className="mt-1 block text-ink/50">
                                Status: {order.paymentStatus}
                            </span>
                        </p>
                    </div>
                </section>

                <div className="mt-10 flex flex-col gap-2.5 sm:flex-row sm:justify-center print:hidden">
                    <Link
                        to="/shop"
                        className="border border-ink bg-ink px-6 py-3 text-center font-label
                                   text-[11px] uppercase tracking-[0.18em] text-paper
                                   transition-colors hover:bg-transparent hover:text-ink"
                    >
                        Continue shopping
                    </Link>
                    <Link
                        to="/account/orders"
                        className="border border-ink/20 px-6 py-3 text-center font-label text-[11px]
                                   uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
                    >
                        View my orders
                    </Link>
                </div>
            </div>
        </>
    );
}
