import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../hooks/useCart";
import { formatPrice } from "../../../lib/store/productMapper";

// Matches the trust-strip promise ("Free delivery over ৳2,000")
const FREE_SHIPPING_THRESHOLD = 2000;

const CartDrawer = () => {
    const { isOpen, closeCart, items, itemCount, subtotal, updateQty, removeItem } = useCart();

    // Lock body scroll while open (same pattern as the mobile nav drawer)
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Esc closes
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && closeCart();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, closeCart]);

    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

    return (
        <>
            {/* Scrim */}
            <div
                onClick={closeCart}
                aria-hidden="true"
                className={`fixed inset-0 z-90 bg-ink/50 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            {/* Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                aria-hidden={!isOpen}
                className={`fixed inset-y-0 right-0 z-100 flex w-full max-w-md flex-col border-l border-line bg-paper shadow-2xl transition-transform duration-300 ease-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <div className="flex items-baseline gap-2">
                        <h2 className="font-display text-lg font-semibold text-ink">Your cart</h2>
                        <span className="text-xs text-muted">
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={closeCart}
                        aria-label="Close cart"
                        className="grid h-9 w-9 place-items-center rounded-md border border-line text-ink transition hover:bg-paper-dim"
                    >
                        <X size={18} />
                    </button>
                </div>

                {items.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                        <div className="grid h-16 w-16 place-items-center rounded-full border border-line">
                            <ShoppingBag size={26} className="text-muted" strokeWidth={1.6} />
                        </div>
                        <p className="mt-5 font-display text-lg font-semibold text-ink">
                            Nothing on the desk yet
                        </p>
                        <p className="mt-1.5 max-w-xs text-sm text-ink-soft">
                            Your cart is empty. Go find a pen worth writing with.
                        </p>
                        <Link
                            to="/shop"
                            onClick={closeCart}
                            className="mt-6 inline-flex items-center justify-center rounded-lg bg-grass px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-grass/90"
                        >
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Line items */}
                        <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                            {items.map((item) => (
                                <li key={item.key} className="flex gap-3.5 py-4">
                                    <Link
                                        to={`/products/${item.slug}`}
                                        onClick={closeCart}
                                        className="shrink-0 overflow-hidden rounded-md border border-line paper-grid"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-20 w-20 object-cover"
                                        />
                                    </Link>

                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <Link
                                            to={`/products/${item.slug}`}
                                            onClick={closeCart}
                                            className="line-clamp-2 text-sm font-medium text-ink hover:text-grass"
                                        >
                                            {item.name}
                                        </Link>
                                        {item.variantLabel && (
                                            <span className="mt-0.5 font-label text-[11px] uppercase tracking-wide text-muted">
                                                {item.variantLabel}
                                            </span>
                                        )}

                                        <div className="mt-auto flex items-center justify-between pt-2">
                                            {/* Qty stepper */}
                                            <div className="flex items-center rounded-md border border-line">
                                                <button
                                                    type="button"
                                                    aria-label="Decrease quantity"
                                                    onClick={() =>
                                                        updateQty(item.key, item.quantity - 1)
                                                    }
                                                    className="grid h-8 w-8 place-items-center text-ink-soft transition hover:bg-paper-dim hover:text-ink"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center font-label text-sm text-ink">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-label="Increase quantity"
                                                    disabled={
                                                        item.stock != null &&
                                                        item.quantity >= item.stock
                                                    }
                                                    onClick={() =>
                                                        updateQty(item.key, item.quantity + 1)
                                                    }
                                                    className="grid h-8 w-8 place-items-center text-ink-soft transition hover:bg-paper-dim hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="font-label text-sm font-semibold text-ink">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-label={`Remove ${item.name}`}
                                                    onClick={() => removeItem(item.key)}
                                                    className="text-muted transition-colors hover:text-coral"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Footer */}
                        <div className="border-t border-line px-5 pb-5 pt-4">
                            {/* Free-shipping progress */}
                            <div className="mb-4">
                                <p className="text-xs text-ink-soft">
                                    {remaining > 0 ? (
                                        <>
                                            Add{" "}
                                            <span className="font-semibold text-ink">
                                                {formatPrice(remaining)}
                                            </span>{" "}
                                            more for free delivery
                                        </>
                                    ) : (
                                        <span className="font-medium text-grass">
                                            You've unlocked free delivery 🎉
                                        </span>
                                    )}
                                </p>
                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-dim">
                                    <div
                                        className="h-full rounded-full bg-grass transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Receipt tear-line + subtotal */}
                            <div className="flex items-center justify-between border-t border-dashed border-line pt-4">
                                <span className="text-sm text-ink-soft">Subtotal</span>
                                <span className="font-label text-lg font-bold text-ink">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-muted">
                                Shipping & taxes calculated at checkout.
                            </p>

                            <div className="mt-4 flex flex-col gap-2.5">
                                <Link
                                    to="/checkout"
                                    onClick={closeCart}
                                    className="inline-flex items-center justify-center rounded-lg bg-grass px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-grass/90"
                                >
                                    Checkout
                                </Link>
                                <Link
                                    to="/cart"
                                    onClick={closeCart}
                                    className="inline-flex items-center justify-center rounded-lg border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper-dim"
                                >
                                    View full cart
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
};

export default CartDrawer;
