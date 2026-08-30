/**
 * Product structured data.
 *
 * Feeds rich results (price, availability, star rating) in search listings.
 * React 19 hoists a <script> in the body to head the same way it does meta
 * tags, so no portal is needed.
 *
 * Only fields we can state truthfully are emitted: aggregateRating is omitted
 * entirely when there are no reviews, because Google treats a zero rating as
 * invalid markup and it can suppress the whole rich result.
 */
export default function ProductJsonLd({ product, pricing, url }) {
    if (!product) return null;

    const data = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || undefined,
        sku: pricing?.sku || product.sku || undefined,
        brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
        image: product.gallery.slice(0, 5).map((image) => image.url),
        offers: {
            "@type": "Offer",
            url,
            priceCurrency: "BDT",
            price: String(pricing?.price ?? product.price),
            availability:
                (pricing?.stock ?? product.stock) > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
        },
    };

    if (product.numReviews > 0 && product.rating > 0) {
        data.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.numReviews,
        };
    }

    return (
        <script
            type="application/ld+json"
            // Serialised through JSON.stringify, so the only injection risk is
            // a "</script>" sequence inside a field; escape the closing angle.
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, "\\u003c"),
            }}
        />
    );
}
