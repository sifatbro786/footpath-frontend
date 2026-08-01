/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useMemo } from "react";

export const CartContext = createContext(null);

/**
 * Storefront cart + drawer UI state.
 *
 * Items are held in-memory for now — this is a stopgap so the drawer is fully
 * functional during frontend build-out. When wiring the backend:
 *   - hydrate `items` from GET /cart (cartController) on mount for logged-in users,
 *   - and/or persist a guest cart to localStorage,
 *   - route addItem/updateQty/removeItem through the cart API.
 * The public shape below stays stable, so the swap is internal to this file.
 *
 * Item shape (normalized, see productMapper):
 *   { key, productId, name, slug, image, price, quantity, variantLabel?, stock? }
 *   `key` = productId + variant signature (same product, different variant = separate line)
 */
export const CartProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([]);

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

    const value = {
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
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
