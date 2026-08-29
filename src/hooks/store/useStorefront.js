import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { heroApi } from "../../api/heroApi";
import { productApi } from "../../api/productApi";
import categoryApi from "../../api/categoryApi";
import {
    normalizeHeroSlides,
    normalizeCategories,
} from "../../lib/store/productMapper";

/**
 * Storefront read hooks (Phase 2).
 *
 * Every homepage section fetches through here rather than calling axios itself,
 * so caching, retry policy and response unwrapping live in one place. Defaults
 * (staleTime 5m, no refetch-on-focus, no retry on 4xx) come from
 * lib/queryClient.js.
 *
 * Each `queryFn` unwraps the envelope and hands components a plain array —
 * the response shapes are inconsistent across the API (`data` here, `products`
 * there, `sections` elsewhere, and raw for /hero), and that inconsistency
 * should not leak into JSX.
 */

/** Query key factory — prevents typo'd keys silently creating separate caches. */
export const storeKeys = {
    all: ["store"],
    heroItems: () => [...storeKeys.all, "hero-items"],
    heroContent: () => [...storeKeys.all, "hero-content"],
    categories: (params) => [...storeKeys.all, "categories", params ?? {}],
    products: (params) => [...storeKeys.all, "products", params ?? {}],
    featured: () => [...storeKeys.all, "products", "featured"],
    homepageSections: () => [...storeKeys.all, "homepage-sections"],
};

/**
 * Tracks whether we're on a mobile viewport, for filtering hero slides by
 * deviceType client-side.
 *
 * Deliberately NOT done by passing ?device= to the API: that would key the
 * query by viewport and refetch the whole hero every time someone crosses the
 * breakpoint (or rotates a tablet). One fetch of all active slides, filtered
 * locally, is cheaper and flicker-free.
 */
const MOBILE_QUERY = "(max-width: 767px)";

/**
 * matchMedia is missing in jsdom and in older embedded webviews, and the
 * `change` listener API differs across browsers (Safari < 14 only has the
 * deprecated addListener). This hook feeds the Hero, so an exception here would
 * take the whole page down through the ErrorBoundary — hence the guards. When
 * matchMedia is unavailable we assume desktop, which matches the "both" default
 * on HeroItem.deviceType and so still renders slides.
 */
const getMediaQueryList = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia(MOBILE_QUERY)
        : null;

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => getMediaQueryList()?.matches ?? false);

    useEffect(() => {
        const mql = getMediaQueryList();
        if (!mql) return;

        const onChange = (e) => setIsMobile(e.matches);
        setIsMobile(mql.matches);

        if (typeof mql.addEventListener === "function") {
            mql.addEventListener("change", onChange);
            return () => mql.removeEventListener("change", onChange);
        }
        // Safari < 14 fallback
        mql.addListener(onChange);
        return () => mql.removeListener(onChange);
    }, []);

    return isMobile;
};

// ─── Hero ────────────────────────────────────────────────────────────────────

/** Active hero slides, filtered to the current viewport's deviceType. */
export const useHeroSlides = () => {
    const isMobile = useIsMobile();
    const device = isMobile ? "mobile" : "desktop";

    const query = useQuery({
        queryKey: storeKeys.heroItems(),
        queryFn: () => heroApi.getItems().then((r) => r.data?.data ?? []),
    });

    return {
        ...query,
        slides: normalizeHeroSlides(query.data ?? [], device),
    };
};

/**
 * Hero background media (HeroContent).
 *
 * Returns only URLs — the controller discards the copy fields. Picks the right
 * bucket for the viewport and prefers video over image when both exist.
 */
export const useHeroContent = () => {
    const isMobile = useIsMobile();

    const query = useQuery({
        queryKey: storeKeys.heroContent(),
        // This endpoint returns the object at the top level, NOT under `data`.
        queryFn: () => heroApi.getContent().then((r) => r.data ?? {}),
    });

    const d = query.data ?? {};
    const videos = (isMobile ? d.mobileVideos : d.desktopVideos) ?? [];
    const images = (isMobile ? d.mobileImages : d.desktopImages) ?? [];

    return {
        ...query,
        media: videos.length
            ? { type: "video", url: videos[0] }
            : images.length
              ? { type: "image", url: images[0] }
              : null,
        videos,
        images,
    };
};

// ─── Categories ──────────────────────────────────────────────────────────────

/** Top-level categories for the homepage mosaic. */
export const useTopCategories = ({ limit = 12 } = {}) => {
    const params = { level: 0, limit, sort: "name" };

    const query = useQuery({
        queryKey: storeKeys.categories(params),
        queryFn: () => categoryApi.getPublicList(params),
        staleTime: 15 * 60 * 1000, // categories change rarely
    });

    return { ...query, categories: normalizeCategories(query.data ?? []) };
};

// ─── Products ────────────────────────────────────────────────────────────────

/**
 * Generic product list.
 *
 * `sortBy` must be one of the enum values the controller's switch understands:
 * displayOrder | newest | price_asc | price_desc | popularity | rating.
 * Passing a raw field name silently falls back to displayOrder.
 */
export const useProductList = (params = {}) =>
    useQuery({
        queryKey: storeKeys.products(params),
        queryFn: () => productApi.getList(params).then((r) => r.data?.products ?? []),
    });

/** Editor-picked products (isFeatured). Capped at 10 server-side. */
export const useFeaturedProducts = () =>
    useQuery({
        queryKey: storeKeys.featured(),
        queryFn: () => productApi.getFeatured().then((r) => r.data?.products ?? []),
    });

/**
 * Admin-configured homepage sections, each with its products already embedded.
 *
 * Sections with zero products are dropped here rather than in the component —
 * an empty configured section should simply not appear on the page.
 */
export const useHomepageSections = () => {
    const query = useQuery({
        queryKey: storeKeys.homepageSections(),
        queryFn: () => productApi.getHomepageSections().then((r) => r.data?.sections ?? []),
    });

    return {
        ...query,
        sections: (query.data ?? []).filter((s) => s?.products?.length > 0),
    };
};
