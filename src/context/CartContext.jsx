/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useMemo, useEffect, useRef } from "react";

export const CartContext = createContext(null);

/**
 * Storefront cart + drawer UI state.
 *
 * PHASE 1: items now survive a reload and a trip through the auth routes.
 * Previously this lived inside StoreLayout with in-memory state only, so a
 * guest who added items and then navigated to /login (a different layout)
 * came back to an empty cart — the provider had unmounted.
 *
 * PHASE 5 swaps the internals to dual-mode (localStorage for guests, the
 * /api/cart endpoints for signed-in users, merged on login). The public value
 * below is the contract those changes must preserve, so components written
 * against it today keep working.
 *
 * Item shape (normalized, see productMapper):
 *   { key, productId, name, slug, image, price, quantity, variantLabel?, stock? }
 *   `key` = productId + variant signature — same product, different variant is
 *   a separate line. Phase 4 defines the signature properly once variants land;
 *   until then `key` falls back to the product id.
 */

const STORAGE_KEY = "elmate.cart.v1";

/**
 * Read the persisted cart.
 *
 * Everything here is defensive on purpose: localStorage throws outright in some
 * privacy modes, the value can be corrupt or hand-edited, and a stale schema
 * from a future/older build must never crash the store. Any doubt -> empty cart.
 */
const readStoredCart = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.items)) return [];

        // Drop anything that can't render or price correctly rather than letting
        // a malformed line poison subtotal maths.
        return parsed.items.filter(
            (i) =>
                i &&
                typeof i.key === "string" &&
                Number.isFinite(Number(i.price)) &&
                Number.isFinite(Number(i.quantity)) &&
                Number(i.quantity) > 0,
        );
    } catch {
        return [];
    }
};

const writeStoredCart = (items) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items }));
    } catch {
        // Quota exceeded or storage disabled. The in-memory cart still works for
        // this session, so failing silently is the right degradation.
    }
};

export const CartProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Lazy initialiser: hydrate during the first render so there is no flash of
    // an empty cart badge before an effect could fill it in.
    const [items, setItems] = useState(readStoredCart);

    // Skip the very first write — it would only rewrite what we just read.
    const hydrated = useRef(false);
    useEffect(() => {
        if (!hydrated.current) {
            hydrated.current = true;
            return;
        }
        writeStoredCart(items);
    }, [items]);

    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
    const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

    const addItem = useCallback((item, qty = 1) => {
        setItems((prev) => {
            const key = item.key ?? item.productId ?? item.id;
            const existing = prev.find((i) => i.key === key);
            if (existing) {
                return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + qty } : i));
            }
            return [...prev, { ...item, key, quantity: qty }];
        });
        setIsOpen(true); // open drawer on add — standard e-comm feedback
    }, []);

    const updateQty = useCallback((key, qty) => {
        setItems((prev) =>
            qty <= 0
                ? prev.filter((i) => i.key !== key)
                : prev.map((i) => (i.key === key ? { ...i, quantity: qty } : i)),
        );
    }, []);

    const removeItem = useCallback((key) => {
        setItems((prev) => prev.filter((i) => i.key !== key));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const { itemCount, subtotal } = useMemo(
        () => ({
            itemCount: items.reduce((n, i) => n + i.quantity, 0),
            subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
        }),
        [items],
    );

    // Memoised so consumers don't re-render on unrelated parent updates now that
    // this provider sits at the app root rather than inside the store layout.
    const value = useMemo(
        () => ({
            isOpen,
            openCart,
            closeCart,
            toggleCart,
            items,
            itemCount,
            subtotal,
            addItem,
            updateQty,
            removeItem,
            clearCart,
        }),
        [
            isOpen,
            openCart,
            closeCart,
            toggleCart,
            items,
            itemCount,
            subtotal,
            addItem,
            updateQty,
            removeItem,
            clearCart,
        ],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
