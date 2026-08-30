import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, X } from "lucide-react";

import { useCart } from "../../../hooks/useCart";
import { useShippingRates } from "../../../hooks/store/useCheckout";
import { formatPrice } from "../../../lib/store/productMapper";
import CartLine from "./CartLine";
import FreeShippingBar from "./FreeShippingBar";

/**
 * Slide over cart.
 *
 * Always mounted so opening is a transform, never a mount race. Body scroll is
 * locked while open and Escape closes, matching the catalogue filter sheet.
 *
 * The drawer intentionally shows subtotal only, with delivery marked as
 * calculated at checkout. It cannot honestly show a total: shipping, COD fee
 * and tax all depend on a destination that does not exist yet, and
 * /checkout/calculate refuses to guess. Showing a total here that changes at
 * checkout is the single most common trust break in a cart.
 */
export default function CartDrawer() {
    const {
        isOpen,
        closeCart,
        items,
        itemCount,
        subtotal,
        updateQty,
        removeItem,
        isSyncing,
        notice,
        dismissNotice,
    } = useCart();

    const { freeShippingThreshold } = useShippingRates();

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && closeCart();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, closeCart]);

    return (
        <>
            <div
                onClick={closeCart}
                aria-hidden="true"
                className={`fixed inset-0 z-90 bg-ink/45 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Shopping bag"
                aria-hidden={!isOpen}
                className={`fixed inset-y-0 right-0 z-100 flex w-[92%] max-w-md flex-col border-l
                            border-line bg-paper transition-transform duration-300 ease-out ${
                                isOpen ? "translate-x-0" : "translate-x-full"
                            }`}
            >
                <header className="flex items-center justify-between border-b border-line px-5 py-4">
                    <h2 className="font-label text-[11px] uppercase tracking-[0.2em] text-ink/60">
                        Your bag
                        {itemCount > 0 && (
                            <span className="ml-2 tabular-nums text-ink">({itemCount})</span>
                        )}
                    </h2>
                    <button
                        type="button"
                        onClick={closeCart}
                        aria-label="Close bag"
                        className="grid h-9 w-9 place-items-center border border-ink/15 text-ink transition-colors hover:border-ink"
                    >
                        <X size={17} />
                    </button>
                </header>

                {notice && (
                    <div className="flex items-start justify-between gap-3 border-b border-line bg-paper-dim px-5 py-3">
                        <p className="text-sm text-ink-soft">{notice}</p>
                        <button
                            type="button"
                            onClick={dismissNotice}
                            aria-label="Dismiss"
                            className="shrink-0 text-ink/35 transition-colors hover:text-ink"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                        <ShoppingBag size={28} className="text-ink/20" aria-hidden="true" />
                        <p className="mt-4 font-display text-lg text-ink">Your bag is empty</p>
                        <p className="mt-2 text-sm text-ink-soft">
                            Once you add something, it will show up here.
                        </p>
                        <Link
                            to="/shop"
                            onClick={closeCart}
                            className="mt-6 border border-ink/20 px-5 py-2.5 font-label text-[11px]
                                       uppercase tracking-[0.16em] text-ink transition-colors
                                       hover:border-ink hover:bg-ink hover:text-paper"
                        >
                            Start shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        <div
                            className={`flex-1 overflow-y-auto px-5 transition-opacity ${
                                isSyncing ? "opacity-60" : ""
                            }`}
                        >
                            <ul className="divide-y divide-line">
                                {items.map((item) => (
                                    <CartLine
                                        key={item.key}
                                        item={item}
                                        onUpdateQty={updateQty}
                                        onRemove={(line) => removeItem(line.key)}
                                        compact
                                    />
                                ))}
                            </ul>
                        </div>

                        <footer className="border-t border-line px-5 py-5">
                            <div className="mb-4">
                                <FreeShippingBar
                                    subtotal={subtotal}
                                    threshold={freeShippingThreshold}
                                />
                            </div>

                            <div className="flex items-baseline justify-between">
                                <span className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/55">
                                    Subtotal
                                </span>
                                <span className="font-display text-xl font-semibold tabular-nums text-ink">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>
                            <p className="mt-1.5 font-label text-[11px] text-ink/40">
                                Delivery and any fees are calculated at checkout.
                            </p>

                            <div className="mt-4 flex flex-col gap-2.5">
                                <Link
                                    to="/checkout"
                                    onClick={closeCart}
                                    className="border border-ink bg-ink py-3.5 text-center font-label
                                               text-[11px] uppercase tracking-[0.18em] text-paper
                                               transition-colors hover:bg-transparent hover:text-ink"
                                >
                                    Checkout
                                </Link>
                                <Link
                                    to="/cart"
                                    onClick={closeCart}
                                    className="border border-ink/20 py-3.5 text-center font-label
                                               text-[11px] uppercase tracking-[0.18em] text-ink
                                               transition-colors hover:border-ink"
                                >
                                    View bag
                                </Link>
                            </div>
                        </footer>
                    </>
                )}
            </aside>
        </>
    );
}
