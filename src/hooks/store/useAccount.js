import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { accountApi } from "../../api/accountApi";
import { reviewApi } from "../../api/reviewApi";
import { normalizeProducts } from "../../lib/store/productMapper";
import { useAuth } from "../useAuth";
import { storeKeys } from "./useStorefront";

export const accountKeys = {
    orders: () => [...storeKeys.all, "my-orders"],
    reviews: () => [...storeKeys.all, "my-reviews"],
    wishlist: () => [...storeKeys.all, "wishlist"],
};

/** Order history, newest first (the controller sorts by createdAt desc). */
export const useMyOrders = () => {
    const query = useQuery({
        queryKey: accountKeys.orders(),
        queryFn: () => accountApi.getMyOrders().then((r) => r.data?.orders ?? []),
        // Order status changes behind the shopper's back, so this should not sit
        // in cache as long as catalogue data does.
        staleTime: 60 * 1000,
    });

    return { ...query, orders: query.data ?? [] };
};

export const useMyReviews = () => {
    const query = useQuery({
        queryKey: accountKeys.reviews(),
        queryFn: () => reviewApi.getMine().then((r) => r.data?.reviews ?? []),
    });

    return { ...query, reviews: query.data ?? [] };
};

/**
 * Wishlist.
 *
 * Products come back in the same projection the catalogue uses, so they run
 * through normalizeProduct and render in the standard ProductCard.
 *
 * Disabled entirely when signed out rather than falling back to localStorage.
 * A "saved item" that disappears when the browser is cleared is a worse promise
 * than an honest sign-in prompt, and the backend has no guest wishlist concept.
 */
export const useWishlist = () => {
    const { isAuthenticated } = useAuth();

    const query = useQuery({
        queryKey: accountKeys.wishlist(),
        queryFn: () => accountApi.getWishlist().then((r) => r.data?.items ?? []),
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000,
    });

    const rawItems = query.data ?? [];

    return {
        ...query,
        items: rawItems,
        products: normalizeProducts(rawItems.map((i) => i.product)),
        // Set of saved product ids, for the heart toggle on cards.
        savedIds: new Set(rawItems.map((i) => i.product?._id).filter(Boolean)),
        isEnabled: isAuthenticated,
    };
};

/**
 * Add or remove, with an optimistic cache write so the heart fills instantly.
 *
 * Both endpoints return the whole list, so the response replaces the cache
 * outright rather than being merged; on failure the snapshot is restored.
 */
export const useWishlistToggle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, isSaved }) =>
            isSaved
                ? accountApi.removeFromWishlist(productId).then((r) => r.data?.items ?? [])
                : accountApi.addToWishlist(productId).then((r) => r.data?.items ?? []),

        onMutate: async ({ productId, isSaved }) => {
            await queryClient.cancelQueries({ queryKey: accountKeys.wishlist() });
            const previous = queryClient.getQueryData(accountKeys.wishlist()) ?? [];

            queryClient.setQueryData(accountKeys.wishlist(), (old = []) =>
                isSaved
                    ? old.filter((i) => i.product?._id !== productId)
                    : // Placeholder entry: the real product arrives with the
                      // response and replaces this a moment later.
                      [...old, { product: { _id: productId }, addedAt: new Date().toISOString() }],
            );

            return { previous };
        },

        onError: (_error, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(accountKeys.wishlist(), context.previous);
            }
        },

        onSuccess: (items) => {
            queryClient.setQueryData(accountKeys.wishlist(), items);
        },
    });
};

/**
 * Profile update.
 *
 * The controller returns the full updated user, which is pushed straight into
 * AuthContext so the header and every other consumer reflect the change without
 * a refetch of /auth/me.
 */
export const useUpdateProfile = () => {
    const { updateUser } = useAuth();

    return useMutation({
        mutationFn: (payload) => accountApi.updateProfile(payload).then((r) => r.data),
        onSuccess: (data) => {
            if (data?.user) updateUser(data.user);
        },
    });
};

export const useChangePassword = () =>
    useMutation({
        mutationFn: (payload) => accountApi.changePassword(payload).then((r) => r.data),
    });

/**
 * Address book.
 *
 * Every address mutation returns the whole user document, so AuthContext is
 * updated from the response and `user.shippingAddress` stays the single source
 * of truth. There is no separate addresses query to invalidate.
 */
export const useAddressBook = () => {
    const { user, updateUser } = useAuth();

    const applyUser = (data) => {
        if (data?.user) updateUser(data.user);
    };

    const add = useMutation({
        mutationFn: (address) => accountApi.addAddress(address).then((r) => r.data),
        onSuccess: applyUser,
    });

    const update = useMutation({
        mutationFn: ({ addressId, address }) =>
            accountApi.updateAddress(addressId, address).then((r) => r.data),
        onSuccess: applyUser,
    });

    const remove = useMutation({
        mutationFn: (addressId) => accountApi.deleteAddress(addressId).then((r) => r.data),
        onSuccess: applyUser,
    });

    return {
        addresses: user?.shippingAddress ?? [],
        add,
        update,
        remove,
        isBusy: add.isPending || update.isPending || remove.isPending,
    };
};

/** Guest order lookup. A 404 means "no match", which is a normal outcome. */
export const useTrackOrder = () =>
    useMutation({
        mutationFn: (payload) => accountApi.trackOrder(payload).then((r) => r.data?.order ?? null),
    });
