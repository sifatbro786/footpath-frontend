import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "../ui/ProductCard";
import Breadcrumbs from "../ui/Breadcrumbs";
import Eyebrow from "../ui/Eyebrow";
import FilterSidebar from "./FilterSidebar";
import CatalogToolbar from "./CatalogToolbar";
import CatalogPagination from "./CatalogPagination";
import { SkeletonProductCard } from "../../common/Skeleton";
import {
    useCatalogParams,
    useCatalogProducts,
    useCategoryTree,
    useProductAttributes,
    SORT_OPTIONS,
} from "../../../hooks/store/useCatalog";

/**
 * The listing engine behind /shop, /category/:slug and /search.
 *
 * All three are the same view over the same endpoint; only the heading and the
 * category scope differ. Keeping one implementation means a fix to filtering or
 * pagination lands on every route at once.
 *
 * Props:
 *   title, description   page heading copy
 *   eyebrow              small label above the title
 *   breadcrumbs          [{ label, href }]
 *   categoryId           scope set by the route (category pages). When present
 *                        the sidebar's category picker is hidden so the URL and
 *                        the sidebar can never disagree.
 *   emptyMessage         shown when the query returns nothing
 */
export default function CatalogView({
    title,
    description,
    eyebrow,
    breadcrumbs = [],
    categoryId = null,
    emptyMessage = "Nothing matches these filters just yet.",
}) {
    const { filters, setFilters, clearFilters, hasActiveFilters } = useCatalogParams();
    const { data: categoryTree = [] } = useCategoryTree();
    const { data: attributes = {} } = useProductAttributes();

    const { products, total, totalPages, currentPage, isLoading, isError, isRefreshing } =
        useCatalogProducts(filters, { categoryId });

    const [filtersOpen, setFiltersOpen] = useState(false);

    // Lock the page behind the mobile filter sheet.
    useEffect(() => {
        document.body.style.overflow = filtersOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [filtersOpen]);

    useEffect(() => {
        if (!filtersOpen) return;
        const onKey = (e) => e.key === "Escape" && setFiltersOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [filtersOpen]);

    // Removable summary of what is currently narrowing the results.
    const chips = [];
    if (!categoryId && filters.category) {
        const findName = (nodes) => {
            for (const n of nodes) {
                if (n._id === filters.category) return n.name;
                const found = n.children?.length ? findName(n.children) : null;
                if (found) return found;
            }
            return null;
        };
        const name = findName(categoryTree);
        if (name) chips.push({ key: "category", label: name, patch: { category: "" } });
    }
    if (filters.minPrice !== "" || filters.maxPrice !== "") {
        const lo = filters.minPrice === "" ? "0" : filters.minPrice;
        const hi = filters.maxPrice === "" ? "any" : filters.maxPrice;
        chips.push({
            key: "price",
            label: `৳${lo} to ৳${hi}`,
            patch: { minPrice: "", maxPrice: "" },
        });
    }
    if (filters.inStock) chips.push({ key: "inStock", label: "In stock", patch: { inStock: false } });
    if (filters.onSale) chips.push({ key: "onSale", label: "On offer", patch: { onSale: false } });
    if (filters.minRating) {
        chips.push({
            key: "rating",
            label: `${filters.minRating} stars and above`,
            patch: { minRating: 0 },
        });
    }
    for (const [facet, values] of Object.entries(filters.attributes)) {
        for (const value of values) {
            chips.push({
                key: `${facet}:${value}`,
                label: value,
                patch: {
                    attributes: {
                        ...filters.attributes,
                        [facet]: values.filter((v) => v !== value),
                    },
                },
            });
        }
    }

    const sidebar = (
        <FilterSidebar
            filters={filters}
            onChange={setFilters}
            categoryTree={categoryTree}
            attributes={attributes}
            lockedCategory={Boolean(categoryId)}
        />
    );

    return (
        <div className="bg-paper">
            <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:pt-10">
                {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="mb-7" />}

                <header className="max-w-2xl">
                    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
                    <h1 className="mt-3.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                            {description}
                        </p>
                    )}
                </header>

                <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-12">
                    <aside className="hidden lg:block">
                        <div className="sticky top-28">{sidebar}</div>
                    </aside>

                    <div>
                        <CatalogToolbar
                            total={total}
                            isRefreshing={isRefreshing}
                            sort={filters.sort}
                            onSortChange={(value) => setFilters({ sort: value })}
                            onOpenFilters={() => setFiltersOpen(true)}
                            activeChips={chips}
                            onRemoveChip={(chip) => setFilters(chip.patch)}
                            onClearAll={clearFilters}
                        />

                        {isLoading ? (
                            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 xl:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <SkeletonProductCard key={i} />
                                ))}
                            </div>
                        ) : isError ? (
                            <p className="mt-16 text-center text-sm text-ink-soft">
                                We could not load these products. Please refresh the page.
                            </p>
                        ) : products.length === 0 ? (
                            <div className="mt-16 text-center">
                                <p className="font-display text-lg text-ink">{emptyMessage}</p>
                                {hasActiveFilters ? (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-4 border border-ink/20 px-5 py-2.5 font-label
                                                   text-[11px] uppercase tracking-[0.16em] text-ink
                                                   transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                                    >
                                        Clear filters
                                    </button>
                                ) : (
                                    <Link
                                        to="/shop"
                                        className="mt-4 inline-block border border-ink/20 px-5 py-2.5
                                                   font-label text-[11px] uppercase tracking-[0.16em]
                                                   text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                                    >
                                        Browse everything
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Dim rather than unmount while a new page loads,
                                    so the grid does not collapse and jump. */}
                                <div
                                    className={`mt-8 grid grid-cols-2 gap-x-5 gap-y-9 transition-opacity duration-200 sm:grid-cols-3 xl:grid-cols-4 ${
                                        isRefreshing ? "opacity-50" : "opacity-100"
                                    }`}
                                >
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                <CatalogPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={(page) => {
                                        setFilters({ page }, { resetPage: false });
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile filter sheet */}
            <div
                onClick={() => setFiltersOpen(false)}
                aria-hidden="true"
                className={`fixed inset-0 z-90 bg-ink/45 transition-opacity duration-300 lg:hidden ${
                    filtersOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
                aria-hidden={!filtersOpen}
                className={`fixed inset-y-0 right-0 z-100 flex w-[86%] max-w-sm flex-col border-l
                            border-line bg-paper transition-transform duration-300 ease-out lg:hidden ${
                                filtersOpen ? "translate-x-0" : "translate-x-full"
                            }`}
            >
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <h2 className="font-label text-[11px] uppercase tracking-[0.2em] text-ink/60">
                        Filters
                    </h2>
                    <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        aria-label="Close filters"
                        className="grid h-9 w-9 place-items-center border border-ink/15 text-ink transition-colors hover:border-ink"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5">{sidebar}</div>

                <div className="border-t border-line p-5">
                    <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        className="w-full bg-ink py-3 font-label text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-ink/85"
                    >
                        Show {total} {total === 1 ? "product" : "products"}
                    </button>
                </div>
            </aside>
        </div>
    );
}

export { SORT_OPTIONS };
