import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Seo from "../../../components/common/Seo";
import Eyebrow from "../../../components/store/ui/Eyebrow";
import Breadcrumbs from "../../../components/store/ui/Breadcrumbs";
import OrderTimeline from "../../../components/store/order/OrderTimeline";
import { useTrackOrder } from "../../../hooks/store/useAccount";
import { formatPrice } from "../../../lib/store/productMapper";

/**
 * /order/track
 *
 * The recovery path for a guest who no longer has their confirmation link.
 * Order number plus the phone on the order, which is something a real customer
 * knows and an attacker walking sequential order numbers does not.
 *
 * Rate limited to 10 attempts per 15 minutes server side. The endpoint answers
 * identically for "no such order" and "wrong phone", so it cannot be used to
 * discover which order numbers exist, and the copy here matches that: one
 * message for both.
 */
export default function OrderTrackPage() {
    const [params] = useSearchParams();
    const [orderNumber, setOrderNumber] = useState(params.get("order") ?? "");
    const [phone, setPhone] = useState("");

    const track = useTrackOrder();
    const order = track.data;

    const field =
        "w-full border border-ink/20 bg-paper px-3.5 py-2.5 text-sm text-ink " +
        "placeholder:text-ink/30 focus:border-ink focus:outline-none";

    const notFound = track.isError && track.error?.response?.status === 404;
    const rateLimited = track.isError && track.error?.response?.status === 429;

    return (
        <>
            <Seo title="Track your order | Elmate Stationery" noIndex />

            <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:pt-10">
                <Breadcrumbs
                    items={[{ label: "Track your order", href: "/order/track" }]}
                    className="mb-7"
                />

                <header>
                    <Eyebrow>Where is it</Eyebrow>
                    <h1 className="mt-3.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        Track your order
                    </h1>
                    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                        Enter the order number from your confirmation and the phone number you
                        gave us. No account needed.
                    </p>
                </header>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!orderNumber.trim() || !phone.trim()) return;
                        track.mutate({ orderNumber: orderNumber.trim(), phone: phone.trim() });
                    }}
                    className="mt-9 grid gap-5 border border-line px-5 py-5 sm:grid-cols-2"
                >
                    <div>
                        <label
                            htmlFor="track-order"
                            className="block font-label text-[11px] uppercase tracking-[0.18em] text-ink/50"
                        >
                            Order number
                        </label>
                        <input
                            id="track-order"
                            className={`mt-2 ${field} uppercase`}
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            placeholder="ORD2608300001"
                            autoComplete="off"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="track-phone"
                            className="block font-label text-[11px] uppercase tracking-[0.18em] text-ink/50"
                        >
                            Phone number
                        </label>
                        <input
                            id="track-phone"
                            type="tel"
                            inputMode="tel"
                            className={`mt-2 ${field}`}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            autoComplete="tel"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            disabled={!orderNumber.trim() || !phone.trim() || track.isPending}
                            className="border border-ink bg-ink px-6 py-3 font-label text-[11px]
                                       uppercase tracking-[0.18em] text-paper transition-colors
                                       hover:bg-transparent hover:text-ink
                                       disabled:cursor-not-allowed disabled:border-ink/12
                                       disabled:bg-ink/8 disabled:text-ink/35 disabled:hover:text-ink/35"
                        >
                            {track.isPending ? "Looking" : "Find my order"}
                        </button>
                    </div>
                </form>

                {notFound && (
                    <p className="mt-5 border-l-2 border-coral bg-coral/5 px-4 py-3.5 text-sm text-ink-soft">
                        We could not find an order with those details. Check the order number and
                        the phone number you used when ordering.
                    </p>
                )}

                {rateLimited && (
                    <p className="mt-5 border-l-2 border-coral bg-coral/5 px-4 py-3.5 text-sm text-ink-soft">
                        Too many attempts. Please wait a few minutes and try again.
                    </p>
                )}

                {order && (
                    <section className="mt-10 border border-line">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
                            <div>
                                <p className="font-label text-[11px] uppercase tracking-[0.16em] text-ink/45">
                                    Order
                                </p>
                                <p className="mt-1 font-display text-lg font-semibold text-ink">
                                    {order.orderNumber}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-label text-[11px] uppercase tracking-[0.16em] text-ink/45">
                                    Total
                                </p>
                                <p className="mt-1 font-label text-lg tabular-nums text-ink">
                                    {formatPrice(order.totalPrice)}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-8 px-5 py-6 sm:grid-cols-2">
                            <div>
                                <h2 className="mb-4 font-label text-[11px] uppercase tracking-[0.18em] text-ink/45">
                                    Progress
                                </h2>
                                <OrderTimeline
                                    status={order.orderStatus}
                                    statusHistory={order.statusHistory}
                                />

                                {order.trackingNumber && (
                                    <p className="mt-4 font-label text-[11px] uppercase tracking-[0.14em] text-ink/55">
                                        {order.carrier ? `${order.carrier}: ` : "Tracking: "}
                                        <span className="text-ink">{order.trackingNumber}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <h2 className="mb-4 font-label text-[11px] uppercase tracking-[0.18em] text-ink/45">
                                    Items
                                </h2>
                                <ul className="space-y-3">
                                    {(order.orderItems ?? []).map((item, i) => (
                                        <li key={i} className="flex justify-between gap-4 text-sm">
                                            <span className="min-w-0 text-ink-soft">
                                                {item.name}
                                                <span className="ml-1.5 text-ink/40">
                                                    &times;{item.quantity}
                                                </span>
                                            </span>
                                            <span className="shrink-0 font-label tabular-nums text-ink">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <p className="mt-5 font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                                    Delivering to{" "}
                                    <span className="text-ink">
                                        {[
                                            order.shippingAddress?.upazila,
                                            order.shippingAddress?.district,
                                        ]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </span>
                                </p>

                                {order.paymentMethod === "COD" && order.remainingAmount > 0 && (
                                    <p className="mt-3 border-l-2 border-marigold bg-paper-dim px-3.5 py-2.5 text-[13px] text-ink-soft">
                                        Have {formatPrice(order.remainingAmount)} ready in cash for
                                        the rider.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                <p className="mt-10 text-[13px] text-ink-soft">
                    Have an account?{" "}
                    <Link
                        to="/account/orders"
                        className="text-ink underline underline-offset-4 hover:text-brand"
                    >
                        See all your orders
                    </Link>
                    .
                </p>
            </div>
        </>
    );
}
