import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

/**
 * Homepage data-wiring regression suite (Phase 2).
 *
 * Every mocked response below mirrors the REAL controller output shape, taken
 * from the backend source — envelopes included, because they are inconsistent
 * across endpoints and that inconsistency is exactly what breaks silently:
 *   /hero-items                  { success, data: [...] }
 *   /hero                        { desktopVideos, desktopImages, ... }   ← unwrapped
 *   /categories                  { success, count, total, data: [...] }
 *   /products                    { success, products: [...], total }
 *   /products/featured           { success, products: [...] }
 *   /products/homepage-sections  { success, sections: [{ ..., products }] }
 *   /page-meta/:slug             { success, data: {...} }
 *
 * If someone "tidies" one of those unwrappings in useStorefront.js, a test here
 * fails instead of the homepage silently rendering nothing.
 */

const routes = {};

vi.mock("../src/api/axiosInstance.js", () => ({
    default: {
        get: (url) => {
            // Longest match wins, so "/products/featured" is not shadowed by "/products".
            const key = Object.keys(routes)
                .filter((k) => url.startsWith(k))
                .sort((a, b) => b.length - a.length)[0];
            if (!key) return Promise.reject(new Error("unmocked GET " + url));
            const value = routes[key];
            return value instanceof Error
                ? Promise.reject(value)
                : Promise.resolve({ data: value });
        },
    },
}));

const withImage = (url) => ({ imageGroups: [{ images: [{ url, alt: "alt" }] }] });

const product = (n, over = {}) => ({
    _id: "p" + n,
    name: "Product " + n,
    slug: "product-" + n,
    price: 500,
    basePrice: 700,
    finalPrice: 500,
    discountAmount: 200,
    isOnSale: true,
    averageRating: 4.5,
    numReviews: 12,
    stock: 5,
    hasVariants: false,
    publishDate: "2026-08-20T00:00:00.000Z",
    ...withImage("https://example.test/p" + n + ".jpg"),
    ...over,
});

const HomePage = (await import("../src/pages/store/HomePage.jsx")).default;

const renderHome = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        </QueryClientProvider>,
    );
};

beforeEach(() => {
    for (const key of Object.keys(routes)) delete routes[key];

    routes["/hero-items"] = {
        success: true,
        data: [
            {
                _id: "h1",
                title: "The good stuff for your *desk*.",
                subtitle: "Pens that glide.",
                buttonText: "Shop stationery",
                mediaType: "image",
                mediaUrl: "https://example.test/hero.jpg",
                deviceType: "both",
                order: 0,
                duration: 5,
            },
        ],
    };
    routes["/hero"] = {
        desktopVideos: [],
        desktopImages: ["https://example.test/hc1.jpg", "https://example.test/hc2.jpg"],
        mobileVideos: [],
        mobileImages: [],
    };
    routes["/offers/active"] = { success: true, count: 0, data: [] };
    routes["/page-meta/"] = {
        success: true,
        data: { metaTitle: "Meta Title From Admin", metaDescription: "Meta desc" },
    };
    routes["/categories"] = {
        success: true,
        count: 2,
        total: 2,
        data: [
            {
                _id: "c1",
                name: "Pens & Writing",
                slug: "pens-writing",
                level: 0,
                image: { url: "https://example.test/c1.jpg" },
            },
            // Deliberately has no image — must not render a broken <img>.
            { _id: "c2", name: "Notebooks", slug: "notebooks", level: 0 },
        ],
    };
    routes["/products/featured"] = { success: true, products: [product("F1"), product("F2")] };
    routes["/products/homepage-sections"] = {
        success: true,
        sections: [
            {
                _id: "s1",
                title: "Studio Picks",
                description: "For the studio.",
                attributeKey: "Theme",
                attributeValue: "Studio",
                backgroundColor: "#f7f7f7",
                products: [product("S1")],
                totalProducts: 1,
            },
            // Configured but matched nothing — must be dropped, not rendered empty.
            { _id: "s2", title: "Empty Section", products: [], totalProducts: 0 },
        ],
    };
    routes["/products"] = { success: true, products: [product("L1"), product("L2")], total: 2 };
});

describe("HomePage — live data wiring", () => {
    it("renders the hero title with the *accent* phrase split out", async () => {
        renderHome();
        await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toBeTruthy());

        const h1 = screen.getByRole("heading", { level: 1 });
        expect(h1.textContent).toBe("The good stuff for your desk.");
        expect(h1.querySelector(".border-marigold")?.textContent).toBe("desk");
    });

    it("renders categories, including one with no image", async () => {
        renderHome();
        await waitFor(() => expect(screen.getByText("Pens & Writing")).toBeTruthy());
        expect(screen.getByText("Notebooks")).toBeTruthy();
    });

    it("renders featured, bestsellers and new arrivals from the API", async () => {
        renderHome();
        await waitFor(() => expect(screen.getAllByText(/Product F1/).length).toBeGreaterThan(0));
        expect(screen.getAllByText(/Product L1/).length).toBeGreaterThan(0);
    });

    it("renders a dynamic section and drops the empty one", async () => {
        renderHome();
        await waitFor(() => expect(screen.getByText("Studio Picks")).toBeTruthy());
        expect(screen.queryByText("Empty Section")).toBeNull();
    });

    it("applies the admin PageMeta record to the document title", async () => {
        renderHome();
        await waitFor(() => expect(document.title).toBe("Meta Title From Admin"));
    });

    it("hides every data-backed section when the API returns nothing", async () => {
        routes["/hero-items"] = { success: true, data: [] };
        routes["/categories"] = { success: true, data: [] };
        routes["/products/featured"] = { success: true, products: [] };
        routes["/products/homepage-sections"] = { success: true, sections: [] };
        routes["/products"] = { success: true, products: [] };

        renderHome();

        await waitFor(() => expect(screen.queryByText("Aisles")).toBeNull());
        expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
        expect(screen.queryByText("Best sellers")).toBeNull();
        expect(screen.queryByText("Hand picked")).toBeNull();
    });

    it("survives every product endpoint failing", async () => {
        routes["/products"] = new Error("500");
        routes["/products/featured"] = new Error("500");
        routes["/products/homepage-sections"] = new Error("500");

        renderHome();

        // The hero still renders and nothing throws.
        await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toBeTruthy());
        expect(screen.queryByText("Best sellers")).toBeNull();
    });
});
