import { describe, it, expect } from "vitest";
import {
    variantSignature,
    selectionSignature,
    findVariant,
    isSelectionComplete,
    availableValuesFor,
    outOfStockValuesFor,
    defaultSelection,
    variantCartKey,
    variantDisplayName,
} from "../src/lib/store/variants";

/**
 * Variant identity is the highest-consequence logic in the storefront.
 *
 * Product variants are declared `{ _id: false }`, so an options array is the
 * ONLY thing identifying a variant. That same array is what
 * orderController.updateProductStock matches on when decrementing inventory,
 * and a mismatch there does not throw: it logs a warning and leaves stock
 * untouched. So a bug here sells stock that never gets deducted, silently.
 */

// Colour x Size, with a deliberate hole: no Blue A3 variant exists at all,
// and Red A5 exists but is out of stock.
const variants = [
    { options: [{ name: "Colour", value: "Red" }, { name: "Size", value: "A4" }], price: 300, stock: 5 },
    { options: [{ name: "Colour", value: "Red" }, { name: "Size", value: "A5" }], price: 200, stock: 0 },
    { options: [{ name: "Colour", value: "Blue" }, { name: "Size", value: "A4" }], price: 320, stock: 2 },
    { options: [{ name: "Colour", value: "Red" }, { name: "Size", value: "A3" }], price: 450, stock: 1 },
];

const variantOptions = [
    { name: "Colour", values: ["Red", "Blue"] },
    { name: "Size", values: ["A3", "A4", "A5"] },
];

describe("variantSignature", () => {
    it("is independent of option order", () => {
        const a = variantSignature([
            { name: "Colour", value: "Red" },
            { name: "Size", value: "A4" },
        ]);
        const b = variantSignature([
            { name: "Size", value: "A4" },
            { name: "Colour", value: "Red" },
        ]);
        expect(a).toBe(b);
    });

    it("is independent of casing and surrounding space", () => {
        expect(variantSignature([{ name: " Colour ", value: "RED" }])).toBe(
            variantSignature([{ name: "colour", value: "red" }]),
        );
    });

    it("drops incomplete pairs rather than emitting a partial key", () => {
        expect(variantSignature([{ name: "Colour" }, { value: "Red" }])).toBe("");
    });

    it("distinguishes genuinely different variants", () => {
        expect(variantSignature(variants[0].options)).not.toBe(
            variantSignature(variants[1].options),
        );
    });
});

describe("selectionSignature", () => {
    it("matches the signature of the equivalent variant", () => {
        expect(selectionSignature({ Colour: "Red", Size: "A4" })).toBe(
            variantSignature(variants[0].options),
        );
    });

    it("ignores axes that are not yet chosen", () => {
        expect(selectionSignature({ Colour: "Red", Size: "" })).toBe(
            variantSignature([{ name: "Colour", value: "Red" }]),
        );
    });
});

describe("findVariant", () => {
    it("finds a variant regardless of selection order", () => {
        expect(findVariant(variants, { Size: "A4", Colour: "Red" })).toBe(variants[0]);
    });

    it("returns null for a combination that does not exist", () => {
        expect(findVariant(variants, { Colour: "Blue", Size: "A3" })).toBeNull();
    });

    it("returns null for an incomplete selection", () => {
        expect(findVariant(variants, { Colour: "Red" })).toBeNull();
    });
});

describe("isSelectionComplete", () => {
    it("requires every axis", () => {
        expect(isSelectionComplete(variantOptions, { Colour: "Red" })).toBe(false);
        expect(isSelectionComplete(variantOptions, { Colour: "Red", Size: "A4" })).toBe(true);
    });
});

describe("availableValuesFor", () => {
    it("offers every value when nothing else is chosen", () => {
        expect([...availableValuesFor(variants, "Size", {})].sort()).toEqual(["A3", "A4", "A5"]);
    });

    it("hides sizes that do not exist for the chosen colour", () => {
        // Blue only exists in A4.
        expect([...availableValuesFor(variants, "Size", { Colour: "Blue" })]).toEqual(["A4"]);
    });

    it("ignores the axis being computed, so a choice is never a dead end", () => {
        // Asking about Colour while Colour=Blue is set must still offer Red.
        const values = availableValuesFor(variants, "Colour", { Colour: "Blue", Size: "A4" });
        expect([...values].sort()).toEqual(["Blue", "Red"]);
    });
});

describe("outOfStockValuesFor", () => {
    it("flags a value whose only variant has no stock", () => {
        // Red A5 exists but stock is 0.
        expect(outOfStockValuesFor(variants, "Size", { Colour: "Red" }).has("A5")).toBe(true);
    });

    it("does not flag a value that is in stock", () => {
        expect(outOfStockValuesFor(variants, "Size", { Colour: "Red" }).has("A4")).toBe(false);
    });
});

describe("defaultSelection", () => {
    it("picks the cheapest variant that is actually in stock", () => {
        // Red A5 is cheapest at 200 but has no stock, so Blue/Red A4 at 300 wins.
        expect(defaultSelection(variants)).toEqual({ Colour: "Red", Size: "A4" });
    });

    it("still returns a selection when everything is sold out", () => {
        const soldOut = variants.map((v) => ({ ...v, stock: 0 }));
        expect(defaultSelection(soldOut)).not.toEqual({});
    });

    it("returns an empty selection for a product with no variants", () => {
        expect(defaultSelection([])).toEqual({});
    });
});

describe("variantCartKey", () => {
    it("separates different variants of the same product", () => {
        expect(variantCartKey("p1", variants[0].options)).not.toBe(
            variantCartKey("p1", variants[1].options),
        );
    });

    it("collapses the same variant reached in a different order", () => {
        const reversed = [...variants[0].options].reverse();
        expect(variantCartKey("p1", variants[0].options)).toBe(variantCartKey("p1", reversed));
    });

    it("falls back to the product id when there are no options", () => {
        expect(variantCartKey("p1", [])).toBe("p1");
    });
});

describe("variantDisplayName", () => {
    it("renders a readable label", () => {
        expect(variantDisplayName(variants[0].options)).toBe("Colour: Red, Size: A4");
    });
});
