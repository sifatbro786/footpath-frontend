// src/components/store/ui/ProductCard.jsx
import { useState } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice, upscaleCloudinary, handleImageError } from "../../../lib/store/productMapper";

/**
 * Presentational card. Expects a NORMALIZED product (see normalizeProduct).
 * Stays dumb: no fetching, no shape-guessing. Parent maps raw -> VM.
 *
 * Design notes (Phase 3):
 *   The card sits on paper with a single crisp hairline and a square-ish 2px
 *   radius. On hover the border darkens and a thin marigold rule draws across
 *   the top of the body, like a pencil line under a label. No lift, no blurred
 *   drop shadow: those read as generic web-app cards and fight the paper feel.
 *
 *   The image swaps to a second photograph on hover when the product has one,
 *   cross-faded rather than replaced so it never flashes white mid-load.
 *
 * Props:
 *   product       normalized VM (see normalizeProduct)
 *   onAddToCart   optional (product) => void. Renders a quick-add control.
 */
export default function ProductCard({ product, onAddToCart }) {
    const [hoverLoaded, setHoverLoaded] = useState(false);

    if (!product) return null;

    const {
        name,
        href,
        image,
        imageAlt,
        hoverImage,
        price,
        basePrice,
        isOnSale,
        discountPercent,
        onCampaign,
        campaignName,
        rating,
        numReviews,
        inStock,
        hasVariants,
    } = product;

    return (
        <Link
            to={href}
            className="group relative flex h-full flex-col overflow-hidden rounded-[2px]
                       border border-ink/12 bg-paper transition-colors duration-200
                       hover:border-ink/35 focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
            <div className="relative aspect-square overflow-hidden paper-grid">
                <img
                    src={upscaleCloudinary(image, 600, 600)}
                    alt={imageAlt || name}
                    loading="lazy"
                    className={[
                        "h-full w-full object-cover transition-opacity duration-300",
                        inStock ? "" : "opacity-60",
                        hoverImage && hoverLoaded ? "group-hover:opacity-0" : "",
                    ].join(" ")}
                    onError={handleImageError}
                />

                {hoverImage && (
                    <img
                        src={upscaleCloudinary(hoverImage, 600, 600)}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        onLoad={() => setHoverLoaded(true)}
                        // A dead hover image must not swap in over a working
                        // primary: leave it hidden rather than showing the
                        // placeholder on hover.
                        onError={() => setHoverLoaded(false)}
                        className={`absolute inset-0 h-full w-full object-cover opacity-0
                                   transition-opacity duration-300 ${
                                       hoverLoaded ? "group-hover:opacity-100" : ""
                                   }`}
                    />
                )}

                {/* Badges. Campaign outranks a plain discount: it is the more
                    specific claim, and stacking both is noise. */}
                <div className="pointer-events-none absolute left-0 top-3 flex flex-col items-start gap-1.5">
                    {onCampaign ? (
                        <span className="bg-ink px-2.5 py-1 font-label text-[10px] uppercase tracking-[0.14em] text-paper">
                            {campaignName || "Campaign"}
                        </span>
                    ) : (
                        isOnSale &&
                        discountPercent > 0 && (
                            <span className="bg-coral px-2.5 py-1 font-label text-[10px] font-semibold uppercase tracking-[0.14em] text-paper">
                                Save {discountPercent}%
                            </span>
                        )
                    )}
                </div>

                {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-paper/60">
                        <span className="border border-ink/25 bg-paper px-3 py-1 font-label text-[11px] uppercase tracking-[0.18em] text-ink/70">
                            Sold out
                        </span>
                    </div>
                )}
            </div>

            <div className="relative flex flex-1 flex-col p-4">
                {/* Pencil rule that draws in on hover */}
                <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-marigold
                               transition-transform duration-300 group-hover:scale-x-100"
                />

                <h3 className="line-clamp-2 text-[13.5px] font-medium leading-snug text-ink">
                    {name}
                </h3>

                {numReviews > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-ink/55">
                        <Star size={12} className="fill-marigold text-marigold" />
                        <span className="font-label text-[11px] tabular-nums">
                            {rating.toFixed(1)}
                        </span>
                        <span className="font-label text-[11px] text-ink/35 tabular-nums">
                            ({numReviews})
                        </span>
                    </div>
                )}

                <div className="mt-auto flex items-baseline gap-2 pt-4">
                    {hasVariants && (
                        <span className="font-label text-[10px] uppercase tracking-[0.14em] text-ink/40">
                            from
                        </span>
                    )}
                    <span className="font-label text-[15px] font-semibold tabular-nums text-ink">
                        {formatPrice(price)}
                    </span>
                    {isOnSale && (
                        <span className="font-label text-xs tabular-nums text-ink/35 line-through">
                            {formatPrice(basePrice)}
                        </span>
                    )}
                </div>

                {onAddToCart && inStock && (
                    <button
                        type="button"
                        onClick={(e) => {
                            // The card is a Link; without this the click both
                            // adds to cart and navigates away from the listing.
                            e.preventDefault();
                            e.stopPropagation();
                            onAddToCart(product);
                        }}
                        className="mt-3.5 w-full border border-ink/20 bg-transparent py-2
                                   font-label text-[11px] uppercase tracking-[0.16em] text-ink
                                   transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                    >
                        Add to bag
                    </button>
                )}
            </div>
        </Link>
    );
}
