// src/components/admin/products/productPricing.js
// Single source of truth for price math on the client — mirrors the backend
// pre("save") rule exactly so the "Final Price" shown always equals what the
// server will persist. NEVER send `price` to the API; it is derived.

export const applyDiscount = (base, type, value) => {
    const b = Number(base) || 0;
    const v = Number(value) || 0;
    if (type === "percentage") return Math.max(0, b - (b * v) / 100);
    if (type === "fixed") return Math.max(0, b - v);
    return b;
};

// Product-level final price.
export const productFinalPrice = (basePrice, discountType, discountValue) =>
    applyDiscount(basePrice, discountType, discountValue);

// Variant final price: variant discount wins; else product discount applies to
// the variant's base; else the (variant or product) base price.
export const variantFinalPrice = (
    variant,
    productBasePrice,
    productDiscountType,
    productDiscountValue,
) => {
    const base =
        variant.basePrice !== "" && variant.basePrice != null
            ? Number(variant.basePrice)
            : Number(productBasePrice) || 0;

    if (
        variant.discountType &&
        variant.discountType !== "none" &&
        Number(variant.discountValue) > 0
    ) {
        return applyDiscount(base, variant.discountType, variant.discountValue);
    }
    if (productDiscountType && productDiscountType !== "none" && Number(productDiscountValue) > 0) {
        return applyDiscount(base, productDiscountType, productDiscountValue);
    }
    return base;
};

// Product currency defaults to USD in the schema — format accordingly.
export const formatPrice = (n, currency = "USD") => {
    const value = Number(n) || 0;
    try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
    } catch {
        return `$${value.toFixed(2)}`;
    }
};
