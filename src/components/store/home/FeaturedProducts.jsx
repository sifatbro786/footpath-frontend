// src/components/store/home/FeaturedProducts.jsx
import SectionHeader from "../ui/SectionHeader";
import ProductRow from "../ui/ProductRow";
import SectionState from "../ui/SectionState";
import { SkeletonProductRow } from "../../common/Skeleton";
import { useFeaturedProducts } from "../../../hooks/store/useStorefront";

/**
 * Editor picks — GET /api/products/featured (Phase 2).
 *
 * Driven by the `isFeatured` flag on Product, toggled per product in
 * /admin/products. Unlike Bestsellers (popularity, automatic) this is a
 * deliberate merchandising slot.
 *
 * Server-side the endpoint is hard-limited to 10 with no sort and no
 * pagination, so ordering is effectively insertion order.
 *
 * ⚠️ Known backend gap: getFeaturedProducts does not run the campaign-pricing
 * block that getProducts does, so it returns no finalPrice /
 * isUnderValidCampaign. productMapper falls back to `price`, which means a
 * featured product inside an active campaign shows its pre-campaign price here
 * while showing the campaign price in every other section. Fix belongs in the
 * controller, not the mapper.
 */
export default function FeaturedProducts() {
    const { data: products = [], isLoading, isError } = useFeaturedProducts();

    if (!isLoading && (isError || products.length === 0)) return null;

    return (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
            <SectionHeader
                eyebrow="Hand picked"
                title="Things we think you'll like"
                description="A short list, chosen by us rather than by the algorithm."
                actionLabel="View all"
                actionHref="/shop"
            />

            <div className="mt-8">
                <SectionState isLoading={isLoading} skeleton={<SkeletonProductRow count={4} />}>
                    <ProductRow products={products} layout="shelf4" />
                </SectionState>
            </div>
        </section>
    );
}
