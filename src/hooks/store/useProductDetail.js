import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import { productApi } from "../../api/productApi";
import { reviewApi } from "../../api/reviewApi";
import { normalizeProductDetail } from "../../lib/store/productDetail";
import { normalizeProducts } from "../../lib/store/productMapper";
import { storeKeys } from "./useStorefront";

export const productKeys = {
    detail: (slug) => [...storeKeys.all, "product", slug],
    reviews: (productId, params) => [...storeKeys.all, "reviews", productId, params ?? {}],
    related: (productId) => [...storeKeys.all, "related", productId],
    featuredReviews: () => [...storeKeys.all, "reviews", "featured"],
};

/**
 * Product detail.
 *
 * A+ content is folded into the same request (includeAplus=true) rather than
 * fetched separately: the PDP always wants it, and a second request would only
 * add a spinner halfway down the page.
 */
export const useProductDetail = (slug) => {
    const query = useQuery({
        queryKey: productKeys.detail(slug),
        queryFn: () => productApi.getBySlug(slug).then((r) => r.data?.product ?? null),
        enabled: Boolean(slug),
        retry: false, // a 404 here means the slug is wrong; retrying cannot help
    });

    // MUST be memoised. normalizeProductDetail builds fresh objects and arrays
    // every call, so without this `product` and `product.variants` get a new
    // identity on every render. Any effect depending on them then fires on
    // every render — which is exactly what pinned the quantity stepper to 1:
    // pressing "+" re-rendered, the reset effect saw a "changed" variants array
    // and set quantity back to 1, forever.
    const product = useMemo(() => normalizeProductDetail(query.data), [query.data]);

    return {
        ...query,
        product,
        aplusContent: query.data?.aplusContent ?? null,
        notFound: query.isError && query.error?.response?.status === 404,
    };
};

/**
 * Bump viewCount once per product per browser session.
 *
 * sessionStorage rather than component state: React 18+ mounts effects twice in
 * StrictMode during development, and any remount (a variant change that
 * remounts the tree, a back navigation) would otherwise inflate the count.
 * Failures are swallowed entirely; a analytics counter must never interrupt
 * someone shopping.
 */
export const useProductViewCounter = (productId) => {
    const fired = useRef(false);

    useEffect(() => {
        if (!productId || fired.current) return;
        fired.current = true;

        const key = `elmate.viewed.${productId}`;
        try {
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, "1");
        } catch {
            // Storage blocked. Counting once per mount is still better than not
            // counting, so fall through rather than returning.
        }

        productApi.incrementView(productId).catch(() => {});
    }, [productId]);
};

/**
 * Approved reviews for a product, plus the histogram.
 *
 * `ratingStats` from the API is sparse (only ratings that occur), so it is
 * expanded into a full 1..5 map here. A histogram that silently omits "2 stars"
 * because nobody gave two is misleading.
 */
export const useProductReviews = (productId, { page = 1, limit = 5 } = {}) => {
    const params = { page, limit, sortBy: "createdAt", sortOrder: "desc" };

    const query = useQuery({
        queryKey: productKeys.reviews(productId, params),
        queryFn: () => reviewApi.getForProduct(productId, params).then((r) => r.data),
        enabled: Boolean(productId),
        placeholderData: keepPreviousData,
    });

    const data = query.data;
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const stat of data?.ratingStats ?? []) {
        if (stat?._id >= 1 && stat._id <= 5) histogram[stat._id] = stat.count;
    }

    return {
        ...query,
        reviews: data?.reviews ?? [],
        total: data?.total ?? 0,
        totalPages: data?.totalPages ?? 0,
        currentPage: data?.currentPage ?? page,
        averageRating: data?.averageRating ?? 0,
        totalReviews: data?.totalReviews ?? 0,
        histogram,
    };
};

/**
 * Submit a review.
 *
 * On success the product's review list is invalidated even though the new
 * review will NOT appear in it (reviews save as "pending" and need admin
 * approval). The invalidation is for the case where an admin approves while
 * the shopper is still on the page; the UI states the pending rule explicitly
 * so the absence never reads as a failure.
 */
export const useSubmitReview = (productId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => reviewApi.create({ productId, ...payload }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [...storeKeys.all, "reviews", productId],
            });
        },
    });
};

/** Related products, by category. Skipped entirely when the product has none. */
export const useRelatedProducts = (product) => {
    const productId = product?.id;
    const categoryId = product?.category?.id;

    const query = useQuery({
        queryKey: productKeys.related(productId),
        queryFn: () =>
            productApi
                .getRelated({ productId, categoryId, limit: 5 })
                .then((r) => normalizeProducts(r.data?.products ?? [])),
        enabled: Boolean(productId && categoryId),
    });

    return {
        ...query,
        // The API excludes the current product by id, but a duplicate slug in
        // the data would still slip through; filter defensively.
        products: (query.data ?? []).filter((p) => p.slug !== product?.slug).slice(0, 4),
    };
};

/** Site-wide testimonials for the homepage. */
export const useFeaturedReviews = (limit = 6) => {
    const query = useQuery({
        queryKey: productKeys.featuredReviews(),
        queryFn: () => reviewApi.getFeatured(limit).then((r) => r.data?.reviews ?? []),
        staleTime: 30 * 60 * 1000,
    });

    return { ...query, reviews: query.data ?? [] };
};
