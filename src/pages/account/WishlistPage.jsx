import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import Seo from "../../components/common/Seo";
import ProductCard from "../../components/store/ui/ProductCard";
import { SkeletonProductRow } from "../../components/common/Skeleton";
import { useWishlist, useWishlistToggle } from "../../hooks/store/useAccount";

/**
 * /account/wishlist
 *
 * Wishlist entries carry the same product projection the catalogue uses, so
 * they render through the standard ProductCard rather than a bespoke card. The
 * only addition is a remove control, overlaid on the card.
 *
 * Products that were deleted or deactivated after being saved are filtered out
 * server side, so this list never shows a dead link.
 */
export default function WishlistPage() {
    const { products, isLoading, isError } = useWishlist();
    const toggle = useWishlistToggle();

    return (
        <>
            <Seo title="Saved items | Elmate Stationery" noIndex />

            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Saved items
            </h2>

            {isLoading ? (
                <div className="mt-6">
                    <SkeletonProductRow count={4} />
                </div>
            ) : isError ? (
                <p className="mt-6 text-sm text-ink-soft">
                    We could not load your saved items. Please refresh the page.
                </p>
            ) : products.length === 0 ? (
                <div className="mt-6 border border-line px-5 py-10 text-center">
                    <Heart size={24} className="mx-auto text-ink/20" aria-hidden="true" />
                    <p className="mt-4 font-display text-lg text-ink">Nothing saved yet</p>
                    <p className="mt-2 text-sm text-ink-soft">
                        Tap the heart on anything you want to come back to.
                    </p>
                    <Link
                        to="/shop"
                        className="mt-6 inline-block border border-ink bg-ink px-5 py-2.5 font-label
                                   text-[11px] uppercase tracking-[0.16em] text-paper
                                   transition-colors hover:bg-transparent hover:text-ink"
                    >
                        Browse the shop
                    </Link>
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3">
                    {products.map((product) => (
                        <div key={product.id} className="relative">
                            <ProductCard product={product} />
                            <button
                                type="button"
                                onClick={() =>
                                    toggle.mutate({ productId: product.id, isSaved: true })
                                }
                                aria-label={`Remove ${product.name} from saved items`}
                                className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center
                                           border border-ink/15 bg-paper/95 text-coral
                                           transition-colors hover:border-coral"
                            >
                                <Heart size={14} className="fill-coral" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
