// src/components/store/home/Bestsellers.jsx
import SectionHeader from "../ui/SectionHeader";
import ProductRow from "../ui/ProductRow";
import { bestsellers } from "../../../data/store/bestsellers";

/**
 * Section 5. Static fixtures for now.
 *
 * Backend note: the public getProducts projection does NOT return `isFeatured`,
 * so "best sellers" is driven by popularity. Real wiring later:
 *   GET /products?sortBy=purchaseCount&sortOrder=desc&limit=8
 * (purchaseCount IS in the public .select). Then hand `res.data.products`
 * straight to <ProductRow products={...} />.
 */
export default function Bestsellers() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
            <SectionHeader
                eyebrow="Best sellers"
                title="What everyone keeps on their desk"
                description="The pens, pads, and inks our shoppers reorder most."
                actionLabel="View all"
                actionHref="/products?sort=popular"
            />

            <div className="mt-8">
                {/* onAddToCart intentionally omitted until cart is wired */}
                <ProductRow products={bestsellers} layout="shelf4" />
            </div>
        </section>
    );
}
