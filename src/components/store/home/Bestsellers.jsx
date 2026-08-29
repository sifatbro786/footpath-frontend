// src/components/store/home/Bestsellers.jsx
import SectionHeader from "../ui/SectionHeader";
import ProductRow from "../ui/ProductRow";
import SectionState from "../ui/SectionState";
import { SkeletonProductRow } from "../../common/Skeleton";
import { useProductList } from "../../../hooks/store/useStorefront";

/**
 * Best sellers — GET /api/products?sortBy=popularity (Phase 2).
 *
 * "Best selling" is driven by Product.purchaseCount, which the controller maps
 * to `sortBy=popularity`. The public projection does not expose `isFeatured`,
 * so popularity (not the featured flag) is the honest signal here — the
 * Featured section covers editor picks separately.
 */
export default function Bestsellers() {
    const { data: products = [], isLoading, isError } = useProductList({
        sortBy: "popularity",
        sortOrder: "desc",
        limit: 8,
    });

    // Nothing to sell yet -> no section at all, rather than an empty shelf.
    if (!isLoading && (isError || products.length === 0)) return null;

    return (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
            <SectionHeader
                eyebrow="Best sellers"
                title="What everyone keeps on their desk"
                description="The pens, pads, and inks our shoppers reorder most."
                actionLabel="View all"
                actionHref="/shop?sort=popular"
            />

            <div className="mt-8">
                <SectionState
                    isLoading={isLoading}
                    skeleton={<SkeletonProductRow count={4} />}
                >
                    {/* onAddToCart omitted until variants land in Phase 4 —
                        a one-click add can't pick a variant correctly yet. */}
                    <ProductRow products={products} layout="shelf4" />
                </SectionState>
            </div>
        </section>
    );
}
