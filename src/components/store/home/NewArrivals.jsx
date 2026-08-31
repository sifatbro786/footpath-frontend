// src/components/store/home/NewArrivals.jsx
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionState from "../ui/SectionState";
import { SkeletonProductRow } from "../../common/Skeleton";
import { useProductList } from "../../../hooks/store/useStorefront";
import { formatPrice, normalizeProducts, upscaleCloudinary, handleImageError } from "../../../lib/store/productMapper";

/**
 * New arrivals — GET /api/products?sortBy=newest (Phase 2).
 *
 * `newest` sorts by Product.publishDate (falling back to createdAt), which is
 * the field an admin actually controls — a product can be created long before
 * it goes on sale.
 *
 * This section keeps its own card markup rather than reusing ProductRow: the
 * washi-tape "New" flag and the date stamp are specific to it.
 */

/** "02 Aug" — the shelf-tag date shown beside each name. */
const shelfDate = (raw) => {
    const d = new Date(raw.publishDate || raw.createdAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

export default function NewArrivals() {
    const { data: raw = [], isLoading, isError } = useProductList({
        sortBy: "newest",
        sortOrder: "desc",
        limit: 4,
    });

    if (!isLoading && (isError || raw.length === 0)) return null;

    // Keep the raw record alongside the view-model so the date stamp (not part
    // of the shared card shape) stays available.
    const items = normalizeProducts(raw).map((p, i) => ({ ...p, added: shelfDate(raw[i]) }));

    return (
        <section className="border-y border-line bg-paper-dim/40">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <span className="font-label tabular-nums text-xs uppercase tracking-[0.2em] text-grass">
                            Just landed
                        </span>
                        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            New on the shelf
                        </h2>
                    </div>
                    <Link
                        to="/shop?sort=newest"
                        className="group inline-flex shrink-0 items-center gap-1.5 font-label text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:text-grass"
                    >
                        See all
                        <ArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>

                <SectionState isLoading={isLoading} skeleton={<SkeletonProductRow count={4} />}>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {items.map((p) => (
                            <Link key={p.id} to={p.href} className="group block">
                                <div className="relative overflow-hidden rounded-xl border border-line bg-paper paper-grid">
                                    <span className="absolute -left-6 top-3 z-10 -rotate-45 bg-marigold px-8 py-0.5 text-center font-label text-[10px] font-bold uppercase tracking-widest text-ink shadow-sm">
                                        New
                                    </span>
                                    <img
                                        src={upscaleCloudinary(p.image, 600, 600)}
                                        alt={p.imageAlt}
                                        loading="lazy"
                                        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={handleImageError}
                                    />
                                </div>

                                <div className="mt-3 flex items-start justify-between gap-2">
                                    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink">
                                        {p.name}
                                    </h3>
                                    {p.added && (
                                        <span className="shrink-0 font-label text-[10px] uppercase tracking-wide text-muted">
                                            {p.added}
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1 flex items-baseline gap-2">
                                    <span className="font-label text-base font-semibold text-ink">
                                        {p.hasVariants && (
                                            <span className="text-xs font-normal text-muted">
                                                from{" "}
                                            </span>
                                        )}
                                        {formatPrice(p.price)}
                                    </span>
                                    {p.isOnSale && (
                                        <span className="font-label text-xs text-muted line-through">
                                            {formatPrice(p.basePrice)}
                                        </span>
                                    )}
                                </p>
                            </Link>
                        ))}
                    </div>
                </SectionState>
            </div>
        </section>
    );
}
