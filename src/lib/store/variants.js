// src/lib/store/variants.js
//
// Variant identity and availability.
//
// THE CENTRAL FACT: a variant has no id. models/Product.js declares
// variantSchema with `{ _id: false }`, so the only thing that identifies a
// variant is its `options` array of { name, value } pairs. Everything here
// exists to make that array behave like a stable key.
//
// This matters well beyond the product page. Cart lines, and later order items,
// are matched back to a variant by these same option pairs
// (see updateProductStock in orderController). If the storefront ever produced
// a differently ordered or differently cased options array, stock would fail to
// decrement for that order and no error would be raised: the backend logs a
// warning and moves on. So the signature below is the contract.

/**
 * Stable, order-independent key for a set of option pairs.
 *
 *   [{name:"Size",value:"A5"}, {name:"Colour",value:"Blue"}]
 *   -> "Colour::Blue||Size::A5"
 *
 * Sorted by option name so selection order can never change the key, and
 * lowercased so casing drift between admin entries cannot split one variant
 * into two cart lines.
 */
export function variantSignature(options = []) {
    return options
        .filter((o) => o?.name && o?.value)
        .map((o) => `${String(o.name).trim().toLowerCase()}::${String(o.value).trim().toLowerCase()}`)
        .sort()
        .join("||");
}

/** Signature for a { [optionName]: value } selection map. */
export function selectionSignature(selection = {}) {
    return variantSignature(
        Object.entries(selection)
            .filter(([, value]) => value)
            .map(([name, value]) => ({ name, value })),
    );
}

/** The variant matching a complete selection, or null when none matches. */
export function findVariant(variants = [], selection = {}) {
    const target = selectionSignature(selection);
    if (!target) return null;
    return variants.find((v) => variantSignature(v.options) === target) ?? null;
}

/** True once every axis in variantOptions has a chosen value. */
export function isSelectionComplete(variantOptions = [], selection = {}) {
    return variantOptions.every((option) => Boolean(selection[option.name]));
}

/**
 * Which values remain reachable for one axis, given the choices on the others.
 *
 * A value is offered when at least one variant matches it together with every
 * OTHER currently selected axis. This is what lets the UI grey out "A3" once
 * "Red" is picked and no red A3 exists, instead of letting someone build a
 * combination that cannot be bought.
 *
 * Availability ignores the axis being computed, so changing your mind about
 * one axis never traps you in a dead end.
 */
export function availableValuesFor(variants = [], axisName, selection = {}) {
    const others = Object.entries(selection).filter(
        ([name, value]) => name !== axisName && value,
    );

    const reachable = new Set();
    for (const variant of variants) {
        const matchesOthers = others.every(([name, value]) =>
            variant.options?.some((o) => o.name === name && o.value === value),
        );
        if (!matchesOthers) continue;

        const own = variant.options?.find((o) => o.name === axisName);
        if (own?.value) reachable.add(own.value);
    }
    return reachable;
}

/** Values that lead only to out-of-stock variants, for a "sold out" treatment. */
export function outOfStockValuesFor(variants = [], axisName, selection = {}) {
    const others = Object.entries(selection).filter(
        ([name, value]) => name !== axisName && value,
    );

    const stockByValue = new Map();
    for (const variant of variants) {
        const matchesOthers = others.every(([name, value]) =>
            variant.options?.some((o) => o.name === name && o.value === value),
        );
        if (!matchesOthers) continue;

        const own = variant.options?.find((o) => o.name === axisName);
        if (!own?.value) continue;
        stockByValue.set(own.value, (stockByValue.get(own.value) ?? 0) + (Number(variant.stock) || 0));
    }

    const soldOut = new Set();
    for (const [value, stock] of stockByValue) if (stock <= 0) soldOut.add(value);
    return soldOut;
}

/**
 * First selection worth showing on load: the cheapest variant that is actually
 * in stock, falling back to the first variant so a fully sold out product still
 * renders a coherent page rather than an empty selector.
 */
export function defaultSelection(variants = []) {
    if (!variants.length) return {};

    const inStock = variants.filter((v) => (Number(v.stock) || 0) > 0);
    const pool = inStock.length ? inStock : variants;
    const cheapest = pool.reduce((best, v) =>
        (Number(v.price) || Infinity) < (Number(best.price) || Infinity) ? v : best,
    );

    return Object.fromEntries((cheapest.options ?? []).map((o) => [o.name, o.value]));
}

/**
 * Cart line key. Same product with different options is a separate line.
 *
 * Phase 5 consumes this directly; it is defined here rather than in the cart so
 * the identity rule lives in exactly one place.
 */
export function variantCartKey(productId, options = []) {
    const signature = variantSignature(options);
    return signature ? `${productId}::${signature}` : String(productId);
}

/** Human label for a chosen variant: "Colour: Blue, Size: A5". */
export function variantDisplayName(options = []) {
    return options
        .filter((o) => o?.name && o?.value)
        .map((o) => `${o.name}: ${o.value}`)
        .join(", ");
}
