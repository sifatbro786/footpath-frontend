import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { productApi } from "../../api/productApi";
import categoryApi from "../../api/categoryApi";
import { navbarApi } from "../../api/navbarApi";
import { normalizeProducts } from "../../lib/store/productMapper";
import { findCategoryPath, toBreadcrumbs } from "../../lib/store/categoryTree";
import { storeKeys } from "./useStorefront";

/**
 * Catalogue state and data (Phase 3).
 *
 * The URL is the single source of truth for every filter, sort and page. Not
 * component state mirrored into the URL — the URL itself. That is what makes a
 * filtered listing shareable, bookmarkable, and correct when someone presses
 * back, and it means a refresh reproduces the exact same result set.
 */

export const PAGE_SIZE = 12;

/** Sort options. `value` maps to the getProducts sortBy enum; anything else is ignored server-side. */
export const SORT_OPTIONS = [
    { value: "newest", label: "Newest first", sortOrder: "desc" },
    { value: "popularity", label: "Most popular", sortOrder: "desc" },
    { value: "price_asc", label: "Price, low to high", sortOrder: "asc" },
    { value: "price_desc", label: "Price, high to low", sortOrder: "desc" },
    { value: "rating", label: "Best rated", sortOrder: "desc" },
];

export const DEFAULT_SORT = "newest";

/**
 * Read and write catalogue filters through the query string.
 *
 * Attribute facets are stored as `attr.Colour=Blue,Black` — one param per
 * facet, comma separated. That keeps the URL readable and hand editable, which
 * a single JSON blob would not. It is converted to the JSON shape the API
 * expects only at request time.
 */
export const useCatalogParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(() => {
        const attributes = {};
        for (const [key, value] of searchParams.entries()) {
            if (!key.startsWith("attr.")) continue;
            const values = value.split(",").map((v) => v.trim()).filter(Boolean);
            if (values.length) attributes[key.slice(5)] = values;
        }

        const page = parseInt(searchParams.get("page"), 10);
        const minPrice = searchParams.get("min");
        const maxPrice = searchParams.get("max");
        const minRating = searchParams.get("rating");

        return {
            search: searchParams.get("search") || "",
            category: searchParams.get("category") || "",
            minPrice: minPrice === null ? "" : minPrice,
            maxPrice: maxPrice === null ? "" : maxPrice,
            inStock: searchParams.get("inStock") === "true",
            onSale: searchParams.get("onSale") === "true",
            minRating: minRating ? Number(minRating) : 0,
            attributes,
            sort: searchParams.get("sort") || DEFAULT_SORT,
            page: Number.isFinite(page) && page > 0 ? page : 1,
        };
    }, [searchParams]);

    /**
     * Merge a patch into the query string.
     *
     * Any change other than paging resets to page 1 — staying on page 4 while
     * narrowing a filter down to two results is the classic "empty page"
     * catalogue bug.
     */
    const setFilters = useCallback(
        (patch, { resetPage = true } = {}) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);

                    for (const [key, value] of Object.entries(patch)) {
                        if (key === "attributes") {
                            // Rewrite the whole attr.* namespace so cleared
                            // facets actually disappear from the URL.
                            for (const existing of [...next.keys()]) {
                                if (existing.startsWith("attr.")) next.delete(existing);
                            }
                            for (const [facet, values] of Object.entries(value ?? {})) {
                                if (values?.length) next.set(`attr.${facet}`, values.join(","));
                            }
                            continue;
                        }

                        const paramKey =
                            { minPrice: "min", maxPrice: "max", minRating: "rating" }[key] ?? key;

                        const isEmpty =
                            value === "" ||
                            value === null ||
                            value === undefined ||
                            value === false ||
                            (paramKey === "rating" && Number(value) === 0) ||
                            (paramKey === "sort" && value === DEFAULT_SORT) ||
                            (paramKey === "page" && Number(value) === 1);

                        if (isEmpty) next.delete(paramKey);
                        else next.set(paramKey, String(value));
                    }

                    if (resetPage && !("page" in patch)) next.delete("page");
                    return next;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    const clearFilters = useCallback(() => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams();
                // A search term is the user's query, not a filter — clearing
                // filters on a results page must not throw away what they typed.
                const term = prev.get("search");
                if (term) next.set("search", term);
                return next;
            },
            { replace: true },
        );
    }, [setSearchParams]);

    /** True when anything narrowing is applied (sort and page do not count). */
    const hasActiveFilters = useMemo(
        () =>
            Boolean(
                filters.category ||
                    filters.minPrice ||
                    filters.maxPrice ||
                    filters.inStock ||
                    filters.onSale ||
                    filters.minRating ||
                    Object.keys(filters.attributes).length,
            ),
        [filters],
    );

    return { filters, setFilters, clearFilters, hasActiveFilters };
};

/** Translate UI filter state into the exact query params getProducts expects. */
export const buildProductQuery = (filters, { limit = PAGE_SIZE, categoryId } = {}) => {
    const sort = SORT_OPTIONS.find((o) => o.value === filters.sort) ?? SORT_OPTIONS[0];

    const params = {
        page: filters.page,
        limit,
        sortBy: sort.value,
        sortOrder: sort.sortOrder,
    };

    if (filters.search) params.search = filters.search;
    // A route-level category (/category/:slug) wins over the sidebar param.
    const activeCategory = categoryId || filters.category;
    if (activeCategory) params.category = activeCategory;
    if (filters.minPrice !== "") params.minPrice = filters.minPrice;
    if (filters.maxPrice !== "") params.maxPrice = filters.maxPrice;
    if (filters.inStock) params.inStock = "true";
    if (filters.onSale) params.onSale = "true";
    if (filters.minRating) params.minRating = filters.minRating;
    if (Object.keys(filters.attributes).length) {
        // Single-value facets are sent as a plain string; the backend accepts
        // both and a string keeps the URL and the query log readable.
        const compact = Object.fromEntries(
            Object.entries(filters.attributes).map(([k, v]) => [k, v.length === 1 ? v[0] : v]),
        );
        params.attributes = JSON.stringify(compact);
    }

    return params;
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const catalogKeys = {
    tree: () => [...storeKeys.all, "category-tree"],
    attributes: () => [...storeKeys.all, "attributes"],
    list: (params) => [...storeKeys.all, "catalog", params],
    suggest: (term) => [...storeKeys.all, "suggest", term],
    navbar: () => [...storeKeys.all, "navbar"],
};

/** Full active category tree. Cached hard: it changes on admin action only. */
export const useCategoryTree = () =>
    useQuery({
        queryKey: catalogKeys.tree(),
        queryFn: () => categoryApi.getTreePublic(),
        staleTime: 30 * 60 * 1000,
    });

/** Distinct attribute vocabulary across active products: { Colour: [...], Size: [...] }. */
export const useProductAttributes = () =>
    useQuery({
        queryKey: catalogKeys.attributes(),
        queryFn: () => productApi.getAttributeVocabulary().then((r) => r.data?.attributes ?? {}),
        staleTime: 30 * 60 * 1000,
    });

/**
 * The listing itself.
 *
 * placeholderData keeps the previous page on screen while the next one loads,
 * so changing a filter dims the grid instead of collapsing the page to a
 * skeleton and throwing the scroll position to the top.
 */
export const useCatalogProducts = (filters, options = {}) => {
    const params = buildProductQuery(filters, options);

    const query = useQuery({
        queryKey: catalogKeys.list(params),
        queryFn: () => productApi.getList(params).then((r) => r.data),
        placeholderData: keepPreviousData,
    });

    const data = query.data;
    return {
        ...query,
        products: normalizeProducts(data?.products ?? []),
        total: data?.total ?? 0,
        totalPages: data?.totalPages ?? 0,
        currentPage: data?.currentPage ?? filters.page,
        // True while a NEW result set is in flight but old rows are still shown.
        isRefreshing: query.isFetching && !query.isLoading,
    };
};

/** Resolve /category/:slug against the cached tree, with its breadcrumb trail. */
export const useCategoryBySlug = (slug) => {
    const { data: tree = [], isLoading, isError } = useCategoryTree();

    return useMemo(() => {
        const trail = findCategoryPath(tree, slug);
        return {
            isLoading,
            isError,
            category: trail?.[trail.length - 1] ?? null,
            trail: trail ?? [],
            breadcrumbs: toBreadcrumbs(trail ?? []),
            // Only meaningful once the tree has actually loaded.
            notFound: !isLoading && !isError && Boolean(slug) && !trail,
        };
    }, [tree, slug, isLoading, isError]);
};

/** Header autocomplete. Debouncing lives in the component that owns the input. */
export const useProductSuggestions = (term) =>
    useQuery({
        queryKey: catalogKeys.suggest(term),
        queryFn: () =>
            productApi
                .getList({ search: term, limit: 6, sortBy: "popularity", sortOrder: "desc" })
                .then((r) => normalizeProducts(r.data?.products ?? [])),
        // Below three characters the text index returns noise, not suggestions.
        enabled: term.trim().length >= 2,
        staleTime: 5 * 60 * 1000,
    });

/**
 * Header navigation.
 *
 * ⚠️ navbarItemSchema's pre-save hook builds `path` as `/category/<ObjectId>`,
 * not `/category/<slug>` — so the stored path is unusable as a link. The
 * controller populates `category` to { _id, name, slug }, so the href is built
 * from the slug here and `path` is only trusted for custom/link items.
 * Fixing the hook is a backend change; this keeps the storefront correct
 * regardless of which items were saved before or after that fix.
 */
export const useNavbarLinks = () => {
    const query = useQuery({
        queryKey: catalogKeys.navbar(),
        queryFn: () => navbarApi.getConfig().then((r) => r.data?.data ?? null),
        staleTime: 30 * 60 * 1000,
    });

    const links = useMemo(() => {
        const items = query.data?.items ?? [];
        return items
            .filter((item) => item.isActive !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((item) => {
                let to = item.customUrl || item.path || "/shop";
                if (item.type === "category" && item.category?.slug) {
                    to = `/category/${item.category.slug}`;
                }
                return { id: item._id, label: item.name, to };
            })
            .filter((link) => link.label && link.to);
    }, [query.data]);

    return { ...query, links };
};
