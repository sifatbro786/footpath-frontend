import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

import Seo from "../../components/common/Seo";
import { PageLoader } from "../../components/common/Skeleton";
import OrderTimeline from "../../components/store/order/OrderTimeline";
import { checkoutApi } from "../../api/checkoutApi";
import { useCart } from "../../hooks/useCart";
import { formatPrice, upscaleCloudinary } from "../../lib/store/productMapper";
import { variantCartKey } from "../../lib/store/variants";

/**
 * /account/orders/:orderNumber
 *
 * Reuses GET /api/orders/:id, which accepts an orderNumber as well as an _id.
 * A signed-in owner is matched by JWT, so no capability token is involved here.
 */
const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

export default function OrderDetailPage() {
    const { orderNumber } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ["order", orderNumber],
        queryFn: () => checkoutApi.getOrder(orderNumber).then((r) => r.data?.order ?? null),
        enabled: Boolean(orderNumber),
        retry: false,
    });

    if (isLoading) return <PageLoader />;

    if (isError || !order) {
        return (
            <>
                <Seo title="Order | Elmate Stationery" noIndex />
                <p className="text-sm text-ink-soft">
                    We could not load this order.{" "}
                    <Link
                        to="/account/orders"
                        className="text-ink underline underline-offset-4 hover:text-brand"
                    >
                        Back to your orders
                    </Link>
                </p>
            </>
        );
    }

    const address = order.shippingAddress ?? {};

    /**
     * Reorder.
     *
     * Puts the ORIGINAL items back in the bag, but never the original prices:
     * addItem carries the historic `price` only as a placeholder, and the cart
     * engine re-reads the live price from the server for signed-in users on the
     * very next sync. Products that have since been removed simply fail to add,
     * which the cart surfaces as a notice.
     *
     * The variant options array is preserved verbatim, so a reordered line
     * matches the same variant it did the first time.
     */
    const handleReorder = () => {
        const items = order.orderItems ?? [];
        if (items.length === 0) return;

        for (const item of items) {
            const options = item.variant?.options ?? [];
            addItem(
                {
                    key: variantCartKey(item.product, options),
                    productId: item.product,
                    name: item.name,
                    slug: "",
                    image: item.image,
                    price: item.price,
                    variant: options.length
                        ? { options, displayName: item.variant?.displayName, sku: item.variant?.sku }
                        : undefined,
                    variantLabel: item.variant?.displayName,
                },
                item.quantity,
            );
        }

        toast.success("Added back to your bag");
        navigate("/cart");
    };

    return (
        <>
            <Seo title={`Order ${order.orderNumber} | Elmate Stationery`} noIndex />

            <Link
                to="/account/orders"
                className="inline-flex items-center gap-1.5 font-label text-[11px] uppercase
                           tracking-[0.16em] text-ink/50 transition-colors hover:text-ink print:hidden"
            >
                <ArrowLeft size={13} />
                All orders
            </Link>

            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                        {order.orderNumber}
                    </h2>
                    <p className="mt-1.5 font-label text-[11px] uppercase tracking-[0.14em] text-ink/45">
                        Placed {formatDate(order.createdAt)}
                    </p>
                </div>

                <div className="flex gap-2 print:hidden">
                    <button
                        type="button"
                        onClick={handleReorder}
                        className="inline-flex items-center gap-2 border border-ink/20 px-3.5 py-2
                                   font-label text-[11px] uppercase tracking-[0.16em] text-ink
                                   transition-colors hover:border-ink"
                    >
                        <RotateCcw size={13} />
                        Order again
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 border border-ink/20 px-3.5 py-2
                                   font-label text-[11px] uppercase tracking-[0.16em] text-ink
                                   transition-colors hover:border-ink"
                    >
                        <Printer size={13} />
                        Print
                    </button>
                </div>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_260px] lg:gap-12">
                <div>
                    <ul className="divide-y divide-line border-y border-line">
                        {(order.orderItems ?? []).map((item, i) => (
                            <li key={i} className="flex gap-4 py-4">
                                {item.image && (
                                    <img
                                        src={upscaleCloudinary(item.image, 200, 200)}
                                        alt=""
                                        loading="lazy"
                                        className="h-20 w-20 shrink-0 border border-line object-cover"
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

                    <dl className="mt-5 space-y-2.5 text-sm">
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
                        <div className="flex justify-between gap-4 border-t border-line pt-3">
                            <dt className="font-label text-[11px] uppercase tracking-[0.16em] text-ink/55">
                                Total
                            </dt>
                            <dd className="font-display text-lg font-semibold tabular-nums text-ink">
                                {formatPrice(order.totalPrice)}
                            </dd>
                        </div>
                    </dl>
                </div>

                <aside className="space-y-8">
                    <div>
                        <h3 className="mb-4 font-label text-[11px] uppercase tracking-[0.18em] text-ink/45">
                            Progress
                        </h3>
                        <OrderTimeline
                            status={order.orderStatus}
                            statusHistory={order.statusHistory}
                        />
                    </div>

                    <div>
                        <h3 className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/45">
                            Delivering to
                        </h3>
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
                        <h3 className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/45">
                            Payment
                        </h3>
                        <p className="mt-3 text-sm text-ink-soft">
                            {order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}
                            <span className="mt-1 block text-ink/50">{order.paymentStatus}</span>
                        </p>

                        {order.paymentMethod === "COD" && order.remainingAmount > 0 && (
                            <p className="mt-3 border-l-2 border-marigold bg-paper-dim px-3.5 py-2.5 text-[13px] text-ink-soft">
                                {formatPrice(order.remainingAmount)} due on delivery.
                            </p>
                        )}
                    </div>
                </aside>
            </div>
        </>
    );
}
