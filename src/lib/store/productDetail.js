// src/lib/store/productDetail.js
//
// Raw product document -> product detail view-model.
//
// Kept separate from productMapper's normalizeProduct (the card shape) because
// the PDP needs almost the whole document: variants, image groups, the spec
// table, campaign window. Cards need eight fields and should not carry that.

import { getPrimaryImage } from "./productMapper";

const FALLBACK_IMAGE_URL = "/placeholder-product.png";

/**
 * Flatten imageGroups into a gallery, keeping the group name on every image so
 * the gallery can jump to a variant's group.
 *
 * models/Product.js has NO top-level images array; imageGroups is the only
 * source. Groups may be empty or missing entirely.
 */
function buildGallery(raw) {
    const groups = Array.isArray(raw?.imageGroups) ? raw.imageGroups : [];

    const images = groups.flatMap((group) =>
        (group.images ?? [])
            .filter((image) => image?.url)
            .map((image) => ({
                url: image.url,
                alt: image.alt || raw?.name || "Product image",
                group: group.name || null,
            })),
    );

    if (images.length) return images;

    // Never hand the gallery an empty array: it would render a hole where the
    // main image belongs.
    const primary = getPrimaryImage(raw);
    return [{ url: primary.url || FALLBACK_IMAGE_URL, alt: primary.alt, group: null }];
}

/**
 * Campaign window.
 *
 * `isUnderValidCampaign` is computed server-side in getProductBySlug and is the
 * only thing trusted for "is there a campaign". endsAt is used purely for the
 * countdown, so a clock skew can shorten the displayed timer but can never make
 * the page claim a discount the server did not grant.
 */
function buildCampaign(raw) {
    if (!raw?.isUnderValidCampaign || !raw?.campaignInfo) return null;
    const { campaignName, endDate, campaignPrice } = raw.campaignInfo;
    return {
        name: campaignName || "Limited offer",
        endsAt: endDate ? new Date(endDate) : null,
        price: campaignPrice ?? null,
    };
}

export function normalizeProductDetail(raw) {
    if (!raw) return null;

    const hasVariants = Boolean(raw.hasVariants) && Array.isArray(raw.variants) && raw.variants.length > 0;

    // `variant.price` is computed and persisted by the Product pre-save hook,
    // campaign included (see models/Product.js). It is read, never recomputed:
    // re-deriving it here would eventually disagree with what checkout charges.
    const variants = hasVariants
        ? raw.variants.map((v) => ({
              options: (v.options ?? []).map((o) => ({ name: o.name, value: o.value })),
              price: Number(v.price) || 0,
              basePrice: Number(v.basePrice) || Number(raw.basePrice) || 0,
              stock: Number(v.stock) || 0,
              sku: v.sku || null,
              imageGroupName: v.imageGroupName || null,
          }))
        : [];

    const price = Number(raw.finalPrice ?? raw.price ?? raw.basePrice) || 0;
    const basePrice = Number(raw.basePrice) || price;

    return {
        id: raw._id,
        name: raw.name ?? "",
        slug: raw.slug ?? "",
        brand: raw.brand || null,
        sku: raw.sku || null,
        description: raw.description || "",
        bulletPoints: (raw.bulletPoints ?? []).filter(Boolean),

        gallery: buildGallery(raw),

        price,
        basePrice,
        currency: raw.currency || "BDT",
        isOnSale: Boolean(raw.isOnSale) && price < basePrice,
        discountAmount: Number(raw.discountAmount) || 0,
        campaign: buildCampaign(raw),

        hasVariants,
        variants,
        variantOptions: hasVariants
            ? (raw.variantOptions ?? []).filter((o) => o?.name && o.values?.length)
            : [],

        // Product-level stock is only meaningful without variants; with
        // variants the truth is per variant.
        stock: Number(raw.stock) || 0,
        lowStockAlert: Number(raw.lowStockAlert) || 5,

        attributes: (raw.attributes ?? []).filter((a) => a?.key && a?.value),

        // Physical dimensions were on the model from the start and never
        // surfaced. For stationery they are one of the first things a buyer
        // checks: "A5" means nothing until you see 21 by 14.8cm. Zero means
        // "not measured" (the schema default), so both are normalised to null
        // rather than rendering a row of zeroes.
        weight: Number(raw.weight) > 0 ? Number(raw.weight) : null,
        dimensions:
            raw.dimensions &&
            (raw.dimensions.length > 0 || raw.dimensions.width > 0 || raw.dimensions.height > 0)
                ? {
                      length: Number(raw.dimensions.length) || 0,
                      width: Number(raw.dimensions.width) || 0,
                      height: Number(raw.dimensions.height) || 0,
                  }
                : null,
        category: raw.category
            ? { id: raw.category._id, name: raw.category.name, slug: raw.category.slug }
            : null,
        subCategory: raw.subCategory
            ? { id: raw.subCategory._id, name: raw.subCategory.name, slug: raw.subCategory.slug }
            : null,

        rating: Number(raw.averageRating) || 0,
        numReviews: Number(raw.numReviews) || 0,

        metaTitle: raw.metaTitle || null,
        metaDescription: raw.metaDescription || null,
    };
}

/**
 * Effective price, stock and image group for the current selection.
 *
 * Without variants this simply mirrors the product. With variants, an
 * incomplete selection reports the cheapest available price so the page can
 * show "from X" rather than a misleading concrete figure.
 */
export function resolvePricing(product, variant) {
    if (!product) return { price: 0, basePrice: 0, stock: 0, isOnSale: false, isFrom: false };

    if (!product.hasVariants) {
        return {
            price: product.price,
            basePrice: product.basePrice,
            stock: product.stock,
            isOnSale: product.isOnSale,
            sku: product.sku,
            isFrom: false,
        };
    }

    if (variant) {
        return {
            price: variant.price,
            basePrice: variant.basePrice,
            stock: variant.stock,
            isOnSale: variant.basePrice > variant.price,
            sku: variant.sku ?? product.sku,
            isFrom: false,
        };
    }

    const prices = product.variants.map((v) => v.price).filter((p) => p > 0);
    const lowest = prices.length ? Math.min(...prices) : product.price;
    return {
        price: lowest,
        basePrice: product.basePrice,
        stock: product.variants.reduce((sum, v) => sum + v.stock, 0),
        isOnSale: product.basePrice > lowest,
        sku: product.sku,
        isFrom: true,
    };
}
