// src/components/store/ui/ProductCard.jsx
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice, upscaleCloudinary } from "../../../lib/store/productMapper";

/**
 * Presentational card. Expects a NORMALIZED product (see normalizeProduct).
 * Stays dumb: no fetching, no shape-guessing. Parent maps raw -> VM.
 *
 * Props:
 *   product       normalized VM { id,name,slug,href,image,imageAlt,price,
 *                 basePrice,isOnSale,discountPercent,rating,numReviews,
 *                 inStock,hasVariants }
 *   onAddToCart   optional (product) => void. If provided, an "Add" control
 *                 shows on hover; omitted -> no dead button during static phase.
 */
export default function ProductCard({ product, onAddToCart }) {
    if (!product) return null;

    const {
        name,
        href,
        image,
        imageAlt,
        price,
        basePrice,
        isOnSale,
        discountPercent,
        rating,
        numReviews,
        inStock,
        hasVariants,
    } = product;

    return (
        <Link
            to={href}
            className="group relative flex h-full flex-col overflow-hidden rounded-xl
                       border border-ink/10 bg-paper transition-all duration-200
                       hover:-translate-y-0.5 hover:border-ink/25
                       hover:shadow-[0_10px_30px_-12px_rgb(0_0_0/0.25)] focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
            {/* Image on faint graph paper — ties product to the stationery motif */}
            <div className="relative aspect-square overflow-hidden paper-grid">
                <img
                    src={upscaleCloudinary(image, 600, 600)}
                    alt={imageAlt || name}
                    loading="lazy"
                    className={[
                        "h-full w-full object-cover transition-transform duration-500",
                        "group-hover:scale-[1.04]",
                        inStock ? "" : "opacity-60",
                    ].join(" ")}
                />

                {isOnSale && discountPercent > 0 && (
                    <span
                        className="absolute left-2.5 top-2.5 rounded-md bg-coral px-2 py-0.5
                                   font-label text-[11px] font-semibold tracking-wide text-paper"
                    >
                        −{discountPercent}%
                    </span>
                )}

                {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-paper/55">
                        <span
                            className="rounded-md border border-ink/20 bg-paper px-3 py-1
                                         font-label text-xs uppercase tracking-[0.15em] text-ink/70"
                        >
                            Sold out
                        </span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-3.5">
                <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink">{name}</h3>

                {numReviews > 0 && (
                    <div className="mt-1.5 flex items-center gap-1 text-ink/60">
                        <Star size={13} className="fill-marigold text-marigold" />
                        <span className="font-label text-xs">{rating.toFixed(1)}</span>
                        <span className="font-label text-xs text-ink/40">({numReviews})</span>
                    </div>
                )}

                <div className="mt-auto flex items-baseline gap-2 pt-3">
                    {hasVariants && (
                        <span className="font-label text-[11px] uppercase tracking-wide text-ink/45">
                            from
                        </span>
                    )}
                    <span className="font-label text-base font-semibold text-ink">
                        {formatPrice(price)}
                    </span>
                    {isOnSale && (
                        <span className="font-label text-xs text-ink/40 line-through">
                            {formatPrice(basePrice)}
                        </span>
                    )}
                </div>

                {onAddToCart && inStock && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddToCart(product);
                        }}
                        className="mt-3 w-full rounded-lg border border-ink/15 bg-ink/2
                                   py-2 font-label text-xs uppercase tracking-[0.12em] text-ink
                                   transition-colors hover:bg-grass hover:border-grass hover:text-paper
                                   sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                    >
                        Add to cart
                    </button>
                )}
            </div>
        </Link>
    );
}
