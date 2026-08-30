import ProductCard from "../ui/ProductCard";
import Eyebrow from "../ui/Eyebrow";
import { SkeletonProductRow } from "../../common/Skeleton";
import { useRelatedProducts } from "../../../hooks/store/useProductDetail";

/**
 * Related products, drawn from the same category.
 *
 * Hidden entirely when empty. A "You may also like" heading over nothing is
 * worse than no section, and on a fresh catalogue with one product per category
 * that is the normal case.
 */
export default function RelatedProducts({ product }) {
    const { products, isLoading, isError } = useRelatedProducts(product);

    if (isError) return null;
    if (!isLoading && products.length === 0) return null;

    return (
        <section className="border-t border-line pt-14">
            <Eyebrow>More from {product?.category?.name || "the shop"}</Eyebrow>
            <h2 className="mt-3.5 font-display text-2xl font-semibold tracking-tight text-ink">
                You might also like
            </h2>

            <div className="mt-8">
                {isLoading ? (
                    <SkeletonProductRow count={4} />
                ) : (
                    <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 xl:grid-cols-4">
                        {products.map((item) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
