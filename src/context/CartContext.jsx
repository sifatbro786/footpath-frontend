/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { cartApi } from "../api/cartApi";
import { useAuth } from "../hooks/useAuth";
import { variantCartKey } from "../lib/store/variants";

export const CartContext = createContext(null);

/**
 * Dual mode cart engine (Phase 5).
 *
 * WHY DUAL MODE, and why it is not optional:
 *
 *   models/Cart.js declares `user` as required and unique, so there is no such
 *   thing as a server side guest cart. Meanwhile orderController.createOrder
 *   builds a SIGNED IN user's order from the server cart and ignores any items
 *   in the request body; only guests may pass `guestItems`. So the two flows
 *   genuinely need different storage:
 *
 *     guest        localStorage, sent as guestItems at checkout
 *     signed in    server /api/cart, read by createOrder at checkout
 *
 *   On login the local basket is merged server side (POST /api/cart/merge) and
 *   then cleared locally, so it can never be double counted.
 *
 * The public value is unchanged from Phase 1 apart from additions, so every
 * component written against it keeps working.
 *
 * Line identity is variantCartKey (productId::sorted-option-signature). That is
 * the same rule the backend uses to match a cart line to a variant, and
 * ultimately to decrement stock. See lib/store/variants.js.
 */

const STORAGE_KEY = "elmate.cart.v1";

const readStoredCart = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.items)) return [];
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
        /* quota or private mode: in-memory cart still works this session */
    }
};

const clearStoredCart = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* nothing to do */
    }
};

/**
 * Server cart line -> the same flat shape guest lines use, so every consumer
 * sees one item type regardless of where the cart lives.
 *
 * `itemId` is the server's cart.items[]._id and is what update/remove address.
 * Guest lines have no itemId, which is exactly how the engine tells the two
 * apart when mutating.
 */
const fromServerItem = (item) => {
    const product = item.product ?? {};
    const options = item.variant?.options ?? [];

    let image = "";
    const groups = product.imageGroups ?? [];
    if (item.variant?.imageGroupName) {
        const group = groups.find((g) => g.name === item.variant.imageGroupName);
        image = group?.images?.[0]?.url ?? "";
    }
    if (!image) {
        const main = groups.find((g) => g.name === "Main") ?? groups[0];
        image = main?.images?.[0]?.url ?? "";
    }

    return {
        key: variantCartKey(product._id ?? item.product, options),
        itemId: item._id,
        productId: product._id ?? item.product,
        name: product.name ?? "",
        slug: product.slug ?? "",
        image,
        price: Number(item.priceAtPurchase) || 0,
        quantity: Number(item.quantity) || 1,
        variant: options.length
            ? {
                  options,
                  displayName: item.variant.displayName,
                  sku: item.variant.sku,
              }
            : undefined,
        variantLabel: item.variant?.displayName,
        // Effective stock for THIS line. With variants the sellable count lives
        // on the matching variant row; the parent `stock` is usually 0 and
        // meaningless for those products. Undefined only when the product could
        // not be populated, in which case the stepper falls back to unlimited
        // and the server still enforces the real ceiling.
        stock: resolveLineStock(product, options),
    };
};

/** Stock for a cart line: the matching variant's, or the product's. */
function resolveLineStock(product, options) {
    if (!product) return undefined;

    if (product.hasVariants && options.length > 0) {
        const variant = (product.variants ?? []).find((v) =>
            options.every((opt) =>
                v.options?.some((vo) => vo.name === opt.name && vo.value === opt.value),
            ),
        );
        return variant ? Number(variant.stock) || 0 : undefined;
    }

    return Number.isFinite(Number(product.stock)) ? Number(product.stock) : undefined;
}

export const CartProvider = ({ children }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState(readStoredCart);
    const [isSyncing, setIsSyncing] = useState(false);
    const [notice, setNotice] = useState(null);

    // Which storage the current items came from. Guest lines have no itemId.
    const modeRef = useRef("guest");
    const hydrated = useRef(false);
    const mergedForSession = useRef(false);

    // ─── Guest persistence ────────────────────────────────────────────────
    // Only guest carts are mirrored to localStorage. Persisting a signed in
    // cart would leave a stale copy behind on logout that then gets "merged"
    // back in on the next login.
    useEffect(() => {
        if (!hydrated.current) {
            hydrated.current = true;
            return;
        }
        if (modeRef.current === "guest") writeStoredCart(items);
    }, [items]);

    const loadServerCart = useCallback(async () => {
        const { data } = await cartApi.get();
        const serverItems = (data?.cart?.items ?? []).map(fromServerItem);
        modeRef.current = "server";
        setItems(serverItems);
        return { serverItems, data };
    }, []);

    // ─── Login / logout handoff ───────────────────────────────────────────
    useEffect(() => {
        if (authLoading) return;

        let cancelled = false;

        const run = async () => {
            if (isAuthenticated) {
                if (mergedForSession.current) return;
                mergedForSession.current = true;
                setIsSyncing(true);

                try {
                    const guestItems = readStoredCart();

                    if (guestItems.length > 0) {
                        const { data } = await cartApi.merge(
                            guestItems.map((i) => ({
                                productId: i.productId,
                                quantity: i.quantity,
                                variant: i.variant,
                            })),
                        );

                        // Cleared only after the server confirms the merge, so a
                        // failed request can never lose the basket.
                        clearStoredCart();

                        const skipped = data?.skipped ?? [];
                        if (!cancelled && skipped.length > 0) {
                            setNotice(
                                skipped.length === 1
                                    ? "One item in your bag is no longer available and was removed."
                                    : `${skipped.length} items in your bag are no longer available and were removed.`,
                            );
                        }
                    }

                    if (!cancelled) await loadServerCart();
                } catch {
                    // Merge or fetch failed. Stay on the local basket rather
                    // than showing an empty cart; the next mutation retries.
                    if (!cancelled) mergedForSession.current = false;
                } finally {
                    if (!cancelled) setIsSyncing(false);
                }
            } else {
                // Signed out: drop the server copy and fall back to whatever is
                // stored locally for this browser.
                mergedForSession.current = false;
                modeRef.current = "guest";
                setItems(readStoredCart());
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, authLoading, loadServerCart]);

    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);
    const toggleCart = useCallback(() => setIsOpen((v) => !v), []);
    const dismissNotice = useCallback(() => setNotice(null), []);

    // ─── Mutations ────────────────────────────────────────────────────────
    // Every mutation applies optimistically first, then reconciles with the
    // server when signed in. The optimistic step is what keeps the stepper
    // feeling instant; the reconcile is what keeps it honest.

    const addItem = useCallback(
        async (item, qty = 1) => {
            const key = item.key ?? variantCartKey(item.productId, item.variant?.options ?? []);

            setItems((prev) => {
                const existing = prev.find((i) => i.key === key);
                if (existing) {
                    // Same clamp as updateQty: adding to a line already at the
                    // stock ceiling must not push it past.
                    const ceiling = Number.isFinite(existing.stock ?? item.stock)
                        ? (existing.stock ?? item.stock)
                        : Infinity;
                    const next = Math.min(existing.quantity + qty, ceiling);
                    return prev.map((i) => (i.key === key ? { ...i, quantity: next } : i));
                }
                const ceiling = Number.isFinite(item.stock) ? item.stock : Infinity;
                return [...prev, { ...item, key, quantity: Math.min(qty, ceiling) }];
            });
            setIsOpen(true);

            if (!isAuthenticated) return;

            try {
                await cartApi.add({
                    productId: item.productId,
                    quantity: qty,
                    variant: item.variant,
                });
                await loadServerCart();
            } catch (error) {
                // The server enforces stock; surface its message and re-read
                // the authoritative cart.
                setNotice(error?.response?.data?.message ?? "Could not add that to your bag.");
                await loadServerCart().catch(() => {});
            }
        },
        [isAuthenticated, loadServerCart],
    );

    const updateQty = useCallback(
        async (key, qty) => {
            const line = items.find((i) => i.key === key);

            // Clamp to stock BEFORE writing. Previously the optimistic update
            // accepted any number, the server rejected it, and the reload
            // snapped the figure back — which looks like the control fighting
            // you. The server still enforces the real ceiling; this just stops
            // the UI from promising something it cannot deliver.
            const ceiling = Number.isFinite(line?.stock) ? line.stock : Infinity;
            const target = qty <= 0 ? 0 : Math.min(qty, ceiling);

            if (target > 0 && line && target === line.quantity) {
                if (qty > ceiling) {
                    setNotice(
                        ceiling === 1
                            ? `Only 1 left of ${line.name}.`
                            : `Only ${ceiling} left of ${line.name}.`,
                    );
                }
                return; // nothing changed; do not round-trip
            }

            setItems((prev) =>
                target <= 0
                    ? prev.filter((i) => i.key !== key)
                    : prev.map((i) => (i.key === key ? { ...i, quantity: target } : i)),
            );

            if (!isAuthenticated || !line?.itemId) return;

            try {
                if (target <= 0) await cartApi.removeItem(line.itemId);
                else await cartApi.updateItem(line.itemId, target);
                await loadServerCart();
            } catch (error) {
                setNotice(error?.response?.data?.message ?? "Could not update your bag.");
                await loadServerCart().catch(() => {});
            }
        },
        [items, isAuthenticated, loadServerCart],
    );

    const removeItem = useCallback(
        async (key) => {
            const line = items.find((i) => i.key === key);
            setItems((prev) => prev.filter((i) => i.key !== key));

            if (!isAuthenticated || !line?.itemId) return;

            try {
                await cartApi.removeItem(line.itemId);
                await loadServerCart();
            } catch {
                await loadServerCart().catch(() => {});
            }
        },
        [items, isAuthenticated, loadServerCart],
    );

    const clearCart = useCallback(async () => {
        const previous = items;
        setItems([]);
        clearStoredCart();

        if (!isAuthenticated) return;
        // No bulk delete endpoint exists, so remove line by line.
        await Promise.allSettled(
            previous.filter((i) => i.itemId).map((i) => cartApi.removeItem(i.itemId)),
        );
        queryClient.removeQueries({ queryKey: ["store", "cart"] });
    }, [items, isAuthenticated, queryClient]);

    /**
     * Called after a successful order so the basket does not linger.
     * The server cart is deleted by createOrder itself for signed in users, so
     * this only has to clear local state.
     */
    const resetAfterOrder = useCallback(() => {
        setItems([]);
        clearStoredCart();
    }, []);

    const { itemCount, subtotal } = useMemo(
        () => ({
            itemCount: items.reduce((n, i) => n + i.quantity, 0),
            subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
        }),
        [items],
    );

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
            resetAfterOrder,
            refreshCart: loadServerCart,
            isSyncing,
            notice,
            dismissNotice,
            // Guests send their basket as guestItems; signed in users send
            // nothing and the server reads its own cart.
            isGuestCart: !isAuthenticated,
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
            resetAfterOrder,
            loadServerCart,
            isSyncing,
            notice,
            dismissNotice,
            isAuthenticated,
        ],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
