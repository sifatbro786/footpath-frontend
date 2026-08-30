import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Seo from "../../components/common/Seo";
import { PageLoader } from "../../components/common/Skeleton";
import NotFoundPage from "../client/NotFoundPage";
import Breadcrumbs from "../../components/store/ui/Breadcrumbs";

import ProductGallery from "../../components/store/product/ProductGallery";
import VariantSelector from "../../components/store/product/VariantSelector";
import PriceBlock from "../../components/store/product/PriceBlock";
import BuyBox from "../../components/store/product/BuyBox";
import ProductSpecs from "../../components/store/product/ProductSpecs";
import AplusContent from "../../components/store/product/AplusContent";
import ReviewsSection from "../../components/store/product/ReviewsSection";
import RelatedProducts from "../../components/store/product/RelatedProducts";
import ProductJsonLd from "../../components/store/product/ProductJsonLd";
import WishlistButton from "../../components/store/product/WishlistButton";

import { useProductDetail, useProductViewCounter } from "../../hooks/store/useProductDetail";
import { useCategoryBySlug } from "../../hooks/store/useCatalog";
import { useCart } from "../../hooks/useCart";
import { resolvePricing } from "../../lib/store/productDetail";
import {
    defaultSelection,
    findVariant,
    isSelectionComplete,
    variantCartKey,
    variantDisplayName,
} from "../../lib/store/variants";

/**
 * /products/:slug
 *
 * The page is driven by one request (getProductBySlug with includeAplus), then
 * a selection state on top of it. Everything price and stock related flows
 * through resolvePricing so the buy box, the JSON-LD and the cart line can
 * never disagree about what is being sold.
 */
export default function ProductDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const { product, aplusContent, isLoading, notFound, isError } = useProductDetail(slug);

    const [selection, setSelection] = useState({});
    const [quantity, setQuantity] = useState(1);

    // Seed the selection once the product arrives, and reset it when navigating
    // between products (the component stays mounted across slug changes).
    useEffect(() => {
        setSelection(product?.hasVariants ? defaultSelection(product.variants) : {});
        setQuantity(1);
    }, [product?.id, product?.hasVariants, product?.variants]);

    useProductViewCounter(product?.id);

    const selectedVariant = useMemo(
        () => (product?.hasVariants ? findVariant(product.variants, selection) : null),
        [product, selection],
    );

    const pricing = useMemo(
        () => resolvePricing(product, selectedVariant),
        [product, selectedVariant],
    );

    // Breadcrumbs reuse the cached category tree, so a category page and a
    // product page under it show an identical trail.
    const { breadcrumbs: categoryTrail } = useCategoryBySlug(product?.category?.slug);

    // Clamp quantity down when a variant with less stock is chosen.
    useEffect(() => {
        setQuantity((current) => Math.max(1, Math.min(current, pricing.stock || 1)));
    }, [pricing.stock]);

    if (isLoading) return <PageLoader />;
    if (notFound || (!product && !isError)) return <NotFoundPage />;
    if (isError || !product) {
        return (
            <div className="mx-auto max-w-lg px-4 py-24 text-center">
                <h1 className="font-display text-2xl font-semibold text-ink">
                    This product did not load
                </h1>
                <p className="mt-3 text-sm text-ink-soft">Please refresh the page and try again.</p>
            </div>
        );
    }

    const needsSelection =
        product.hasVariants && !isSelectionComplete(product.variantOptions, selection);
    const soldOut = !needsSelection && pricing.stock <= 0;

    const buildCartItem = () => {
        const options = selectedVariant?.options ?? [];
        return {
            key: variantCartKey(product.id, options),
            productId: product.id,
            name: product.name,
            slug: product.slug,
            image: product.gallery[0]?.url,
            price: pricing.price,
            stock: pricing.stock,
            // The options array IS the variant identity (variants have no _id).
            // Cart, checkout and stock decrement all match on it, so it is
            // stored verbatim rather than flattened to a label.
            variant: options.length
                ? {
                      options,
                      displayName: variantDisplayName(options),
                      sku: selectedVariant?.sku ?? undefined,
                  }
                : undefined,
            variantLabel: options.length ? variantDisplayName(options) : undefined,
        };
    };

    const handleAddToCart = () => {
        addItem(buildCartItem(), quantity);
        toast.success("Added to your bag");
    };

    const handleBuyNow = () => {
        addItem(buildCartItem(), quantity);
        navigate("/checkout");
    };

    const canonicalUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/products/${product.slug}`
            : undefined;

    return (
        <>
            <Seo
                title={product.metaTitle || `${product.name} | Elmate Stationery`}
                description={
                    product.metaDescription ||
                    product.description?.slice(0, 155) ||
                    `Buy ${product.name} at Elmate Stationery.`
                }
                image={product.gallery[0]?.url}
                canonical={canonicalUrl}
            />
            <ProductJsonLd product={product} pricing={pricing} url={canonicalUrl} />

            <div className="bg-paper">
                <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:pt-10">
                    <Breadcrumbs
                        items={[...categoryTrail, { label: product.name, href: `/products/${product.slug}` }]}
                        className="mb-7"
                    />

                    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                        <ProductGallery
                            images={product.gallery}
                            activeGroup={selectedVariant?.imageGroupName ?? null}
                        />

                        <div>
                            {product.brand && (
                                <p className="font-label text-[11px] uppercase tracking-[0.2em] text-ink/45">
                                    {product.brand}
                                </p>
                            )}

                            <h1 className="mt-2.5 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                                {product.name}
                            </h1>

                            {product.numReviews > 0 && (
                                <a
                                    href="#reviews"
                                    className="mt-3 inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.14em] text-ink/50 underline underline-offset-4 transition-colors hover:text-ink"
                                >
                                    {product.rating.toFixed(1)} out of 5 · {product.numReviews}{" "}
                                    {product.numReviews === 1 ? "review" : "reviews"}
                                </a>
                            )}

                            <div className="mt-7">
                                <PriceBlock
                                    pricing={pricing}
                                    campaign={product.campaign}
                                    lowStockAlert={product.lowStockAlert}
                                    requiresSelection={needsSelection}
                                />
                            </div>

                            {product.hasVariants && (
                                <div className="mt-8 border-t border-line pt-8">
                                    <VariantSelector
                                        variantOptions={product.variantOptions}
                                        variants={product.variants}
                                        selection={selection}
                                        onChange={setSelection}
                                    />
                                </div>
                            )}

                            <div className="mt-8 border-t border-line pt-8">
                                <BuyBox
                                    quantity={quantity}
                                    onQuantityChange={setQuantity}
                                    maxQuantity={Math.max(1, pricing.stock)}
                                    disabled={needsSelection || soldOut}
                                    disabledReason={
                                        needsSelection
                                            ? "Select an option to continue"
                                            : soldOut
                                              ? "This option is out of stock"
                                              : null
                                    }
                                    onAddToCart={handleAddToCart}
                                    onBuyNow={handleBuyNow}
                                />
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                <WishlistButton productId={product.id} showLabel />
                                {pricing.sku && (
                                    <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink/35">
                                        SKU {pricing.sku}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 space-y-14">
                        <ProductSpecs product={product} />
                        {aplusContent && <AplusContent content={aplusContent} />}
                        <ReviewsSection
                            productId={product.id}
                            fallbackRating={product.rating}
                            fallbackCount={product.numReviews}
                        />
                        <RelatedProducts product={product} />
                    </div>
                </div>
            </div>
        </>
    );
}
