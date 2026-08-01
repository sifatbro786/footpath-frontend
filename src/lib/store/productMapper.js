// src/lib/store/productMapper.js
//
// Single point of translation between the backend Product shape and the flat
// view-model the storefront UI consumes. When the real API is wired in, ONLY
// this file changes — cards/rows keep working untouched.
//
// Backend reference (productController.getProducts .select + computed fields):
//   name slug price basePrice discountType discountValue imageGroups
//   averageRating numReviews stock hasVariants category subCategory
//   isUnderCampaign campaignDiscount originalDiscount displayOrder
//   publishDate purchaseCount viewCount
//   + computed: finalPrice, isUnderValidCampaign, campaignInfo, discountAmount, isOnSale
//
// NOTE: model default currency is "USD", but this is a BD store. Currency is
// centralised here so the card never hardcodes a symbol. Change once if needed.

export const CURRENCY_SYMBOL = "৳";

const FALLBACK_IMAGE = {
    url: "/placeholder-product.png", // drop a real placeholder in /public
    alt: "Product image unavailable",
};

/**
 * Primary image = first image of the first image group.
 * Backend has NO top-level `images[]` — that was the assumed-shape footgun.
 */
export function getPrimaryImage(raw) {
    const img = raw?.imageGroups?.[0]?.images?.[0];
    if (!img?.url) return FALLBACK_IMAGE;
    return { url: img.url, alt: img.alt || raw?.name || "Product image" };
}

/**
 * Cloudinary URLs are stored as 200x200 thumbnails (Product.js pre-save hook
 * rewrites /upload/ -> /upload/w_200,h_200,c_fill/). For larger card renders,
 * request a bigger transform on the fly instead of upscaling a 200px image.
 */
export function upscaleCloudinary(url, w = 600, h = 600) {
    if (typeof url !== "string" || !url.includes("cloudinary")) return url;
    return url.replace(/\/upload\/w_\d+,h_\d+,c_fill\//, `/upload/w_${w},h_${h},c_fill/`);
}

export function formatPrice(amount, { symbol = CURRENCY_SYMBOL } = {}) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return `${symbol}0`;
    return `${symbol}${n.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

/**
 * Prefer the server-computed discountAmount (campaign-aware). Fall back to a
 * base-price calc only if it's absent (e.g. hand-authored fixtures).
 */
export function getDiscountPercent(raw) {
    const base = Number(raw?.basePrice) || 0;
    if (base <= 0) return 0;

    let amount = Number(raw?.discountAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
        const final = Number(raw?.finalPrice ?? raw?.price);
        amount = Number.isFinite(final) ? base - final : 0;
    }
    if (amount <= 0) return 0;
    return Math.round((amount / base) * 100);
}

/**
 * Raw backend product -> flat card view-model.
 * `price` = campaign-aware finalPrice (falls back to price).
 * `isOnSale` = server value (base discount OR valid campaign) — NOT the model virtual.
 */
export function normalizeProduct(raw) {
    if (!raw) return null;
    const image = getPrimaryImage(raw);
    const price = Number(raw.finalPrice ?? raw.price ?? raw.basePrice) || 0;
    const basePrice = Number(raw.basePrice) || price;
    const isOnSale = Boolean(raw.isOnSale) && price < basePrice;

    return {
        id: raw._id ?? raw.id,
        name: raw.name ?? "",
        slug: raw.slug ?? "",
        href: `/products/${raw.slug ?? ""}`,
        image: image.url,
        imageAlt: image.alt,
        price,
        basePrice,
        isOnSale,
        discountPercent: isOnSale ? getDiscountPercent(raw) : 0,
        rating: Number(raw.averageRating) || 0,
        numReviews: Number(raw.numReviews) || 0,
        inStock: (Number(raw.stock) || 0) > 0,
        hasVariants: Boolean(raw.hasVariants), // -> "from ৳X"
    };
}

export function normalizeProducts(list = []) {
    return list.map(normalizeProduct).filter(Boolean);
}
