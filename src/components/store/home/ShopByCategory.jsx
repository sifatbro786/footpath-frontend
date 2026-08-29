// src/components/store/home/ShopByCategory.jsx
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionState from "../ui/SectionState";
import { Skeleton } from "../../common/Skeleton";
import { useTopCategories } from "../../../hooks/store/useStorefront";

/**
 * Category mosaic — GET /api/categories?level=0 (Phase 2).
 *
 * Only top-level categories (Category.level === 0) appear here; sub-categories
 * belong on the category page itself.
 *
 * The mosaic was hand-authored per category, which cannot survive dynamic data.
 * Instead the span pattern repeats every 5 tiles, so the first tile of each
 * group is the tall feature and the rhythm holds for any number of categories.
 * Classes are literal strings so Tailwind's scanner can see them.
 */
const SPAN_PATTERN = [
    "col-span-2 row-span-2 min-h-[280px] sm:min-h-[420px]", // feature
    "col-span-2 min-h-[200px]",
    "col-span-1 min-h-[200px]",
    "col-span-1 min-h-[200px]",
    "col-span-2 min-h-[200px]",
];

const CategorySkeleton = () => (
    <div className="grid auto-rows-1fr grid-cols-2 gap-3 md:grid-cols-4">
        {SPAN_PATTERN.map((span, i) => (
            <Skeleton key={i} className={`rounded-xl ${span}`} />
        ))}
    </div>
);

export default function ShopByCategory() {
    const { categories, isLoading, isError } = useTopCategories({ limit: 10 });

    if (!isLoading && (isError || categories.length === 0)) return null;

    return (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
            {/* Editorial header — asymmetric, not centered */}
            <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                    <span className="font-label text-xs uppercase tracking-[0.2em] text-grass">
                        Aisles
                    </span>
                    <h2 className="mt-2 max-w-md font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                        Find your section of the shop
                    </h2>
                </div>
                <Link
                    to="/shop"
                    className="hidden shrink-0 items-center gap-1.5 border-b-2 border-grass pb-1 font-label text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:text-grass sm:inline-flex"
                >
                    All categories
                    <ArrowUpRight size={14} />
                </Link>
            </div>

            <SectionState isLoading={isLoading} skeleton={<CategorySkeleton />}>
                <div className="grid auto-rows-1fr grid-cols-2 gap-3 md:grid-cols-4">
                    {categories.map((cat, i) => (
                        <Link
                            key={cat.id}
                            to={cat.href}
                            className={`group relative overflow-hidden rounded-xl border border-line bg-paper-dim ${
                                SPAN_PATTERN[i % SPAN_PATTERN.length]
                            }`}
                        >
                            {/* A category with no image uploaded falls back to
                                the paper-grid ground rather than a broken img. */}
                            {cat.image ? (
                                <img
                                    src={cat.image}
                                    alt=""
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-600 ease-out group-hover:scale-105"
                                />
                            ) : (
                                <div className="absolute inset-0 paper-grid bg-paper-dim" />
                            )}

                            <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" />

                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                                <h3 className="font-display text-lg font-semibold leading-tight text-paper sm:text-xl">
                                    {cat.name}
                                </h3>
                                <span className="grid h-9 w-9 shrink-0 translate-y-1 place-items-center rounded-full bg-grass text-paper opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                                    <ArrowUpRight size={18} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </SectionState>
        </section>
    );
}
