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
 * Second image, used for the hover swap on product cards.
 *
 * Looks for another shot of the SAME item first (second image in group one),
 * then falls back to the first image of the next group. Returns null when the
 * product only has one photo, so the card can skip the swap entirely rather
 * than cross-fading an image into itself.
 */
export function getSecondaryImage(raw) {
    const groups = raw?.imageGroups;
    if (!Array.isArray(groups) || groups.length === 0) return null;

    const sameGroup = groups[0]?.images?.[1];
    if (sameGroup?.url) return { url: sameGroup.url, alt: sameGroup.alt || raw?.name || "" };

    const nextGroup = groups[1]?.images?.[0];
    if (nextGroup?.url) return { url: nextGroup.url, alt: nextGroup.alt || raw?.name || "" };

    return null;
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

/**
 * onError handler for any product image.
 *
 * A `src` guard only covers a MISSING url. It does nothing when the url is
 * present but dead: a deleted Cloudinary asset, an expired external link, a
 * typo in an admin paste. Those render the browser's broken-image icon, which
 * looks like the site is broken rather than the photo.
 *
 * Swaps to the placeholder once and then detaches itself, so a placeholder that
 * somehow also fails cannot loop.
 */
export function handleImageError(event) {
    const img = event.currentTarget;
    if (img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = "true";
    img.src = FALLBACK_IMAGE.url;
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
    const hover = getSecondaryImage(raw);
    const price = Number(raw.finalPrice ?? raw.price ?? raw.basePrice) || 0;
    const basePrice = Number(raw.basePrice) || price;
    const isOnSale = Boolean(raw.isOnSale) && price < basePrice;

    // Campaign state is computed server-side in getProducts. Note that
    // /products/featured and /products/homepage-sections do NOT compute it, so
    // these fields are simply absent there rather than false-but-wrong.
    const onCampaign = Boolean(raw.isUnderValidCampaign);

    return {
        id: raw._id ?? raw.id,
        name: raw.name ?? "",
        slug: raw.slug ?? "",
        href: `/products/${raw.slug ?? ""}`,
        image: image.url,
        imageAlt: image.alt,
        hoverImage: hover?.url ?? null,
        price,
        basePrice,
        isOnSale,
        discountPercent: isOnSale ? getDiscountPercent(raw) : 0,
        onCampaign,
        campaignName: onCampaign ? (raw.campaignInfo?.campaignName ?? null) : null,
        rating: Number(raw.averageRating) || 0,
        numReviews: Number(raw.numReviews) || 0,
        inStock: (Number(raw.stock) || 0) > 0,
        hasVariants: Boolean(raw.hasVariants), // -> "from ৳X"
    };
}

export function normalizeProducts(list = []) {
    return list.map(normalizeProduct).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero slides  (models/Hero.js via GET /api/hero-items)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The hero design underlines one phrase in marigold, but the backend stores the
 * headline as a single `title` string with no way to mark that phrase.
 *
 * Rather than guess (underlining the last word is arbitrary and reads as a bug
 * when it lands on "the"), we support an opt-in convention: wrap the phrase in
 * asterisks in the admin Title field.
 *
 *   "The good stuff for your *desk*."  ->  lead "The good stuff for your "
 *                                          accent "desk"
 *                                          trail "."
 *
 * A title with no asterisks renders plain, with no underline. That keeps every
 * existing title valid and makes the feature discoverable without a migration.
 */
export function parseHeroTitle(title = "") {
    const match = String(title).match(/^(.*?)\*([^*]+)\*(.*)$/s);
    if (!match) return { lead: String(title), accent: "", trail: "" };
    return { lead: match[1], accent: match[2], trail: match[3] };
}

/**
 * Raw HeroItem -> flat slide view-model.
 *
 * `buttonLink` does not exist on the model (see api/heroApi.js), so the CTA
 * target falls back to /shop. `duration` is per-slide autoplay seconds.
 */
export function normalizeHeroSlide(raw) {
    if (!raw?.mediaUrl) return null;
    return {
        id: raw._id,
        titleParts: parseHeroTitle(raw.title),
        subtitle: raw.subtitle || "",
        ctaLabel: raw.buttonText || "Shop now",
        ctaHref: raw.buttonLink || "/shop",
        mediaType: raw.mediaType === "video" ? "video" : "image",
        mediaUrl: raw.mediaUrl,
        deviceType: raw.deviceType || "both",
        // Model default is 5s; Swiper wants milliseconds.
        durationMs: Math.max(1, Number(raw.duration) || 5) * 1000,
    };
}

export function normalizeHeroSlides(list = [], device) {
    return list
        .map(normalizeHeroSlide)
        .filter(Boolean)
        .filter((s) => !device || s.deviceType === "both" || s.deviceType === device);
}

// ─────────────────────────────────────────────────────────────────────────────
// Categories  (models/Category.js via GET /api/categories)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Raw Category -> tile view-model.
 *
 * `image` is an object ({ url, public_id }), not a string — a category with no
 * image uploaded has `image: undefined`, so the tile must cope with a null URL
 * rather than rendering a broken <img>.
 *
 * There is no product count on this endpoint, so tiles omit the count chip
 * rather than displaying a fabricated number.
 */
export function normalizeCategory(raw) {
    if (!raw?.slug) return null;
    return {
        id: raw._id,
        name: raw.name || "",
        slug: raw.slug,
        href: `/category/${raw.slug}`,
        image: raw.image?.url || null,
        description: raw.description || "",
    };
}

export function normalizeCategories(list = []) {
    return list.map(normalizeCategory).filter(Boolean);
}
