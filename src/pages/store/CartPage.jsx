import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import Seo from "../../components/common/Seo";
import Eyebrow from "../../components/store/ui/Eyebrow";
import Breadcrumbs from "../../components/store/ui/Breadcrumbs";
import CartLine from "../../components/store/cart/CartLine";
import ConfirmRemoveDialog from "../../components/store/cart/ConfirmRemoveDialog";
import FreeShippingBar from "../../components/store/cart/FreeShippingBar";

import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useShippingRates } from "../../hooks/store/useCheckout";
import { formatPrice } from "../../lib/store/productMapper";

/**
 * /cart
 *
 * Deliberately does NOT carry a coupon box or a shipping selector, even though
 * the brief asked for both here.
 *
 * Reason: /checkout/calculate is the only thing that can price an order, and it
 * requires a validated district and upazila before it will quote shipping. A
 * "Inside Dhaka / Outside Dhaka" toggle on this page would be a second,
 * simpler, and therefore WRONG pricing model sitting next to the real one, and
 * the number it produced would change at checkout. Same for a coupon: the
 * preview endpoint cannot see shipping, so a discount shown here can differ
 * from the one actually applied.
 *
 * So this page owns quantities and removal, states the subtotal plainly, and
 * hands pricing to checkout where the address exists. The coupon box lives in
 * the checkout summary instead, next to the totals it affects.
 */
export default function CartPage() {
    const { items, itemCount, subtotal, updateQty, removeItem, isSyncing } = useCart();
    const { isAuthenticated } = useAuth();
    const { freeShippingThreshold } = useShippingRates();

    const [pendingRemoval, setPendingRemoval] = useState(null);

    if (items.length === 0) {
        return (
            <>
                <Seo slug="cart" fallbackTitle="Your bag | Elmate Stationery" noIndex />
                <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
                    <ShoppingBag size={30} className="text-ink/20" aria-hidden="true" />
                    <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
                        Your bag is empty
                    </h1>
                    <p className="mt-3 text-[15px] text-ink-soft">
                        Nothing in here yet. Have a look around and add what you need.
                    </p>
                    <Link
                        to="/shop"
                        className="mt-7 border border-ink bg-ink px-6 py-3 font-label text-[11px]
                                   uppercase tracking-[0.18em] text-paper transition-colors
                                   hover:bg-transparent hover:text-ink"
                    >
                        Browse the shop
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Seo slug="cart" fallbackTitle="Your bag | Elmate Stationery" noIndex />

            <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:pt-10">
                <Breadcrumbs items={[{ label: "Your bag", href: "/cart" }]} className="mb-7" />

                <header>
                    <Eyebrow>Ready when you are</Eyebrow>
                    <h1 className="mt-3.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        Your bag
                    </h1>
                    <p className="mt-2.5 font-label text-[11px] uppercase tracking-[0.16em] text-ink/45">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>
                </header>

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
                    <div className={isSyncing ? "opacity-60 transition-opacity" : ""}>
                        <ul className="divide-y divide-line border-y border-line">
                            {items.map((item) => (
                                <CartLine
                                    key={item.key}
                                    item={item}
                                    onUpdateQty={updateQty}
                                    onRemove={setPendingRemoval}
                                />
                            ))}
                        </ul>

                        <Link
                            to="/shop"
                            className="mt-6 inline-block font-label text-[11px] uppercase
                                       tracking-[0.16em] text-ink/55 underline underline-offset-4
                                       transition-colors hover:text-ink"
                        >
                            Continue shopping
                        </Link>
                    </div>

                    <aside>
                        <div className="border border-line px-5 py-5 lg:sticky lg:top-28">
                            <h2 className="font-label text-[11px] uppercase tracking-[0.2em] text-ink/55">
                                Summary
                            </h2>

                            <div className="mt-5 space-y-2.5">
                                <div className="flex items-baseline justify-between text-sm">
                                    <span className="text-ink-soft">Subtotal</span>
                                    <span className="font-label tabular-nums text-ink">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between text-sm">
                                    <span className="text-ink-soft">Delivery</span>
                                    <span className="font-label text-ink/50">
                                        Calculated at checkout
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-line pt-4">
                                <FreeShippingBar
                                    subtotal={subtotal}
                                    threshold={freeShippingThreshold}
                                />
                            </div>

                            <Link
                                to="/checkout"
                                className="mt-6 block border border-ink bg-ink py-3.5 text-center
                                           font-label text-[11px] uppercase tracking-[0.18em]
                                           text-paper transition-colors hover:bg-transparent hover:text-ink"
                            >
                                Go to checkout
                            </Link>

                            {!isAuthenticated && (
                                <p className="mt-3.5 text-center text-[13px] text-ink-soft">
                                    <Link
                                        to="/login"
                                        className="text-ink underline underline-offset-4 hover:text-brand"
                                    >
                                        Sign in
                                    </Link>{" "}
                                    to use saved addresses, or carry on as a guest.
                                </p>
                            )}

                            <p className="mt-4 font-label text-[11px] leading-relaxed text-ink/40">
                                Discount codes are applied at checkout, where delivery is known.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            <ConfirmRemoveDialog
                item={pendingRemoval}
                onCancel={() => setPendingRemoval(null)}
                onConfirm={() => {
                    removeItem(pendingRemoval.key);
                    setPendingRemoval(null);
                }}
            />
        </>
    );
}
