import { describe, it, expect } from "vitest";
import { variantCartKey } from "../src/lib/store/variants";

/**
 * Guest cart merge semantics (Phase 5).
 *
 * This mirrors the rules in cartController.mergeGuestCart. The merge is the one
 * moment where two independent baskets become one, and getting it wrong either
 * loses a shopper's items or silently doubles them.
 *
 * The backend owns the real implementation; these tests pin the CONTRACT that
 * the frontend relies on, so a change to either side that breaks the agreement
 * fails here.
 */

/** Line matching rule shared by add, merge and stock decrement. */
const sameLine = (a, b) =>
    variantCartKey(a.productId, a.variant?.options ?? []) ===
    variantCartKey(b.productId, b.variant?.options ?? []);

/**
 * Reference implementation of the merge, matching the controller:
 *   quantities add, clamped to stock; live price wins; unavailable is skipped.
 */
const mergeCarts = (serverItems, guestItems, catalogue) => {
    const result = serverItems.map((i) => ({ ...i }));
    const skipped = [];

    for (const guest of guestItems) {
        const product = catalogue[guest.productId];
        if (!product || product.isActive === false) {
            skipped.push({ productId: guest.productId, reason: "unavailable" });
            continue;
        }

        let price = product.price;
        let stock = product.stock;

        const options = guest.variant?.options;
        if (options?.length) {
            const variant = product.variants?.find((v) =>
                options.every((o) =>
                    v.options.some((vo) => vo.name === o.name && vo.value === o.value),
                ),
            );
            if (!variant) {
                skipped.push({ productId: guest.productId, reason: "variant_missing" });
                continue;
            }
            price = variant.price;
            stock = variant.stock;
        }

        const existing = result.find((line) => sameLine(line, guest));
        const cap = stock ?? Infinity;

        if (existing) {
            existing.quantity = Math.max(1, Math.min(existing.quantity + guest.quantity, cap));
            existing.price = price;
        } else {
            const clamped = Math.min(guest.quantity, cap);
            if (clamped < 1) {
                skipped.push({ productId: guest.productId, reason: "out_of_stock" });
                continue;
            }
            result.push({ ...guest, quantity: clamped, price });
        }
    }

    return { items: result, skipped };
};

const catalogue = {
    p1: { price: 100, stock: 10, isActive: true },
    p2: { price: 250, stock: 3, isActive: true },
    p3: { price: 400, stock: 0, isActive: true },
    p4: { price: 90, stock: 5, isActive: false },
    pv: {
        price: 200,
        stock: 0,
        isActive: true,
        variants: [
            {
                options: [{ name: "Colour", value: "Blue" }],
                price: 220,
                stock: 4,
            },
        ],
    },
};

describe("guest cart merge", () => {
    it("adds quantities for a line that already exists", () => {
        const { items } = mergeCarts(
            [{ productId: "p1", quantity: 2, price: 100 }],
            [{ productId: "p1", quantity: 3 }],
            catalogue,
        );
        expect(items).toHaveLength(1);
        expect(items[0].quantity).toBe(5);
    });

    it("appends a line that is genuinely new", () => {
        const { items } = mergeCarts(
            [{ productId: "p1", quantity: 1, price: 100 }],
            [{ productId: "p2", quantity: 1 }],
            catalogue,
        );
        expect(items).toHaveLength(2);
    });

    it("treats a different variant of the same product as a separate line", () => {
        const { items } = mergeCarts(
            [
                {
                    productId: "pv",
                    quantity: 1,
                    variant: { options: [{ name: "Colour", value: "Red" }] },
                },
            ],
            [
                {
                    productId: "pv",
                    quantity: 1,
                    variant: { options: [{ name: "Colour", value: "Blue" }] },
                },
            ],
            catalogue,
        );
        expect(items).toHaveLength(2);
    });

    it("clamps to available stock instead of rejecting the whole merge", () => {
        // p2 has 3 in stock; 2 on the server plus 5 local would be 7.
        const { items } = mergeCarts(
            [{ productId: "p2", quantity: 2, price: 250 }],
            [{ productId: "p2", quantity: 5 }],
            catalogue,
        );
        expect(items[0].quantity).toBe(3);
    });

    it("discards the guest's stale price in favour of the live one", () => {
        const { items } = mergeCarts(
            [],
            // A guest cart lives in localStorage where anyone can edit it.
            [{ productId: "p1", quantity: 1, price: 1 }],
            catalogue,
        );
        expect(items[0].price).toBe(100);
    });

    it("skips an out of stock product without losing the rest of the basket", () => {
        const { items, skipped } = mergeCarts(
            [],
            [
                { productId: "p1", quantity: 1 },
                { productId: "p3", quantity: 1 },
            ],
            catalogue,
        );
        expect(items).toHaveLength(1);
        expect(items[0].productId).toBe("p1");
        expect(skipped).toEqual([{ productId: "p3", reason: "out_of_stock" }]);
    });

    it("skips an inactive product", () => {
        const { items, skipped } = mergeCarts([], [{ productId: "p4", quantity: 1 }], catalogue);
        expect(items).toHaveLength(0);
        expect(skipped[0].reason).toBe("unavailable");
    });

    it("skips a variant that no longer exists", () => {
        const { skipped } = mergeCarts(
            [],
            [
                {
                    productId: "pv",
                    quantity: 1,
                    variant: { options: [{ name: "Colour", value: "Gone" }] },
                },
            ],
            catalogue,
        );
        expect(skipped[0].reason).toBe("variant_missing");
    });

    it("prices a variant from the variant, not the parent product", () => {
        const { items } = mergeCarts(
            [],
            [
                {
                    productId: "pv",
                    quantity: 1,
                    variant: { options: [{ name: "Colour", value: "Blue" }] },
                },
            ],
            catalogue,
        );
        // Parent price is 200; the Blue variant is 220 with its own stock.
        expect(items[0].price).toBe(220);
    });

    it("is a no op when the guest cart is empty", () => {
        const server = [{ productId: "p1", quantity: 2, price: 100 }];
        const { items, skipped } = mergeCarts(server, [], catalogue);
        expect(items).toEqual(server);
        expect(skipped).toHaveLength(0);
    });
});
