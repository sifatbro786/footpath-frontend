import { Link } from "react-router-dom";

import Seo from "../../components/common/Seo";
import { Skeleton } from "../../components/common/Skeleton";
import { useMyOrders } from "../../hooks/store/useAccount";
import { formatPrice } from "../../lib/store/productMapper";

/**
 * /account/orders
 *
 * Status is shown as a word with a colour rule down the left edge rather than a
 * pill badge. Colour carries meaning here (a cancelled order should not look
 * like a delivered one) but it is semantic, not decorative.
 */
const STATUS_STYLE = {
    Pending: "border-marigold text-ink",
    Confirmed: "border-grass text-ink",
    Processing: "border-grass text-ink",
    Shipped: "border-brand text-ink",
    Delivered: "border-grass text-ink",
    Cancelled: "border-coral text-ink/60",
    Refunded: "border-coral text-ink/60",
};

const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export default function OrdersPage() {
    const { orders, isLoading, isError } = useMyOrders();

    return (
        <>
            <Seo title="Your orders | Elmate Stationery" noIndex />

            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">Orders</h2>

            {isLoading ? (
                <div className="mt-6 space-y-3">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-28 w-full" />
                    ))}
                </div>
            ) : isError ? (
                <p className="mt-6 text-sm text-ink-soft">
                    We could not load your orders. Please refresh the page.
                </p>
            ) : orders.length === 0 ? (
                <div className="mt-6 border border-line px-5 py-10 text-center">
                    <p className="font-display text-lg text-ink">No orders yet</p>
                    <p className="mt-2 text-sm text-ink-soft">
                        When you place an order it will show up here.
                    </p>
                    <Link
                        to="/shop"
                        className="mt-6 inline-block border border-ink bg-ink px-5 py-2.5 font-label
                                   text-[11px] uppercase tracking-[0.16em] text-paper
                                   transition-colors hover:bg-transparent hover:text-ink"
                    >
                        Start shopping
                    </Link>
                </div>
            ) : (
                <ul className="mt-6 space-y-3">
                    {orders.map((order) => {
                        const itemCount = (order.orderItems ?? []).reduce(
                            (n, i) => n + i.quantity,
                            0,
                        );

                        return (
                            <li key={order._id}>
                                <Link
                                    to={`/account/orders/${order.orderNumber}`}
                                    className={`block border-l-2 border-y border-r border-y-line border-r-line px-5 py-4 transition-colors hover:border-r-ink/30 ${
                                        STATUS_STYLE[order.orderStatus] ?? "border-line text-ink"
                                    }`}
                                >
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                        <span className="font-display text-base font-semibold text-ink">
                                            {order.orderNumber}
                                        </span>
                                        <span className="font-label text-[11px] uppercase tracking-[0.16em] text-ink/50">
                                            {order.orderStatus}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                        <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                                            {formatDate(order.createdAt)} · {itemCount}{" "}
                                            {itemCount === 1 ? "item" : "items"}
                                        </span>
                                        <span className="font-label text-sm tabular-nums text-ink">
                                            {formatPrice(order.totalPrice)}
                                        </span>
                                    </div>

                                    {order.paymentMethod === "COD" &&
                                        order.remainingAmount > 0 &&
                                        !["Cancelled", "Refunded", "Delivered"].includes(
                                            order.orderStatus,
                                        ) && (
                                            <p className="mt-2 font-label text-[11px] uppercase tracking-[0.14em] text-ink/55">
                                                {formatPrice(order.remainingAmount)} due on
                                                delivery
                                            </p>
                                        )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}
