import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { XCircle } from "lucide-react";

import { checkoutApi } from "../../../api/checkoutApi";
import { useCart } from "../../../hooks/useCart";
import { resolveOrderToken } from "../../../lib/store/orderAccess";
import { variantCartKey } from "../../../lib/store/variants";

/**
 * Landing page for a payment the customer backed out of.
 *
 * PHASE 6: the bag is now restored from the cancelled order.
 *
 * Why it has to be restored at all: createOrder deletes a signed-in user's
 * server cart the moment the gateway accepts the payment initialisation, and
 * the checkout page clears the local bag before redirecting. So by the time
 * someone cancels at the gateway, their basket is already gone even though they
 * never bought anything. Backing out of payment should cost them nothing.
 *
 * The cancelled order is the record of what they had, so it is read back and
 * replayed into the cart. Prices come from the order only as placeholders; the
 * cart engine re-reads live prices on its next server sync.
 */
const OrderCancelPage = () => {
    const [params] = useSearchParams();
    const orderNumber = params.get("orderNumber");
    const orderId = params.get("orderId");
    const urlToken = params.get("token");

    const { items, addItem } = useCart();
    const [restored, setRestored] = useState(0);

    const token = resolveOrderToken({ urlToken, orderNumber });
    const lookupId = orderNumber || orderId;

    const { data: order } = useQuery({
        queryKey: ["order", lookupId, token],
        queryFn: () => checkoutApi.getOrder(lookupId, token).then((r) => r.data?.order ?? null),
        enabled: Boolean(lookupId),
        retry: false,
    });

    useEffect(() => {
        // Only restore into an empty bag. If they have since added something
        // else, replaying the old order would duplicate lines.
        if (!order?.orderItems?.length || items.length > 0 || restored > 0) return;

        for (const item of order.orderItems) {
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
                        ? {
                              options,
                              displayName: item.variant?.displayName,
                              sku: item.variant?.sku,
                          }
                        : undefined,
                    variantLabel: item.variant?.displayName,
                },
                item.quantity,
            );
        }
        setRestored(order.orderItems.length);
        // Runs once when the order lands.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order]);

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
                No money has been taken and nothing has shipped. Your order was cancelled, so
                start again whenever you are ready.
            </p>

            {restored > 0 && (
                <p className="mt-5 border-l-2 border-grass bg-paper-dim px-4 py-3 text-left text-sm text-ink-soft">
                    We have put {restored === 1 ? "your item" : `all ${restored} items`} back in
                    your bag.
                </p>
            )}

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
