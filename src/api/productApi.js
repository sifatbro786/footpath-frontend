import axiosInstance from "./axiosInstance";

// routes/admin/productAdminRoutes.js (mounted at /api/admin/products, protect+admin)
//
// IMPORTANT — create/update are sent as plain JSON, not multipart, on purpose:
// both routes are wired with `uploadSingle` (single "image" field), but
// neither controller actually persists that file onto the product —
// createProduct assigns it to `req.body.mainImage`, which isn't a schema
// field (silently dropped by Mongoose), and updateProduct only reads
// `req.files` (plural), which `uploadSingle` never populates. So the file
// upload half of these routes is effectively dead. Multer also only parses
// req.body into fields at all when Content-Type is multipart — send JSON
// instead and multer no-ops, so nested arrays (variants, imageGroups,
// variantOptions) survive as real arrays instead of getting stringified.
// Real image workflow: upload files first via uploadApi.uploadMultiple(),
// then include the returned URLs in `imageGroups` in this JSON body.
export const productApi = {
    getAdminList: (params) => axiosInstance.get("/admin/products/dashboard", { params }),
    getSearch: (q) => axiosInstance.get("/admin/products/search", { params: { q } }),
    // Public route (routes/productRoutes.js: GET /api/products/:id) — used here
    // ONLY to fetch the full record for editing. The admin list endpoint above
    // (`getAdminList`) deliberately `.select()`s a trimmed field set for table
    // performance (name/price/stock/sku/...), so it must never be used to seed
    // the edit form — doing so silently blanks out every field it doesn't
    // return (brand, description, bulletPoints, weight, variants, SEO, etc.)
    // the moment the form is saved.
    getOne: (id) => axiosInstance.get(`/products/${id}`),
    create: (payload) => axiosInstance.post("/admin/products", payload),
    update: (id, payload) => axiosInstance.put(`/admin/products/${id}`, payload),
    remove: (id) => axiosInstance.delete(`/admin/products/${id}`),
    // quantity is a DELTA (server does `product.stock += quantity`), not an absolute value
    adjustStock: (id, quantity) => axiosInstance.patch(`/admin/products/${id}/stock`, { quantity }),
    // Public route: distinct attribute vocabulary from all active products
    getAttributeVocabulary: () => axiosInstance.get("/products/attributes"),

    // Public route: count products matching exact key/value pair
    countByAttribute: (key, value) =>
        axiosInstance.get("/products/filter/multiple-attributes", {
            params: { attributes: JSON.stringify({ [key]: value }), limit: 1 },
        }),

    // ── Public storefront reads (Phase 2) ────────────────────────────────
    //
    // GET /api/products
    //   -> { success, products, total, totalPages, currentPage, limit, sortBy, sortOrder }
    //   `sortBy` is an ENUM handled by a switch in getProducts — not a raw
    //   field name. Valid values ONLY:
    //     displayOrder | newest | price_asc | price_desc | popularity | rating
    //   Anything else silently falls through to the default (displayOrder).
    //   Other params: page, limit, search, category, minPrice, maxPrice,
    //                 inStock, onSale, discountType, sortOrder.
    //
    //   This is the ONLY product endpoint that returns campaign-aware pricing
    //   (finalPrice / isUnderValidCampaign / campaignInfo). See the warning on
    //   getFeatured below.
    getList: (params) => axiosInstance.get("/products", { params }),

    // GET /api/products/featured -> { success, products }
    //
    // ⚠️ Returns products where isFeatured && isActive, hard-limited to 10 with
    // NO pagination and NO sort. More importantly it does NOT compute
    // finalPrice / isUnderValidCampaign / campaignInfo — it only derives
    // discountAmount from the base discountType. So a featured product that is
    // currently in a campaign will show its NON-campaign price here while the
    // same product shows the campaign price everywhere else. productMapper
    // degrades safely (falls back to `price`), but the real fix is to run the
    // campaign block from getProducts in getFeaturedProducts too.
    getFeatured: () => axiosInstance.get("/products/featured"),

    // GET /api/products/homepage-sections
    //   -> { success, sections: [{ _id, title, description, sectionType,
    //         attributeKey, attributeValue, productLimit, backgroundColor,
    //         textColor, displayOrder, products: [...], totalProducts }] }
    //
    // Products come back EMBEDDED in each section, so the homepage needs this
    // one request — not this plus one /dynamic-section/:id per section. Same
    // campaign caveat as getFeatured applies to the embedded products.
    getHomepageSections: () => axiosInstance.get("/products/homepage-sections"),

    // GET /api/products/dynamic-section/:id -> { success, section, products }
    // Not used by the homepage (see above). Kept for a future "load more" or
    // standalone section page, where refetching one section in isolation is
    // what you actually want.
    getDynamicSection: (sectionId) =>
        axiosInstance.get(`/products/dynamic-section/${sectionId}`),

    // ── Product detail (Phase 4) ─────────────────────────────────────────
    //
    // GET /api/products/slug/:slug -> { success, product }
    //
    // Unlike the list endpoints this one IS campaign aware: it computes
    // finalPrice, isOnSale, isUnderValidCampaign and campaignInfo, applying a
    // valid campaign in preference to the base discount.
    //
    // `includeAplus=true` folds the A+ content document into product.aplusContent
    // in the same response, which saves a round trip on the page that always
    // needs it.
    getBySlug: (slug, { includeAplus = true } = {}) =>
        axiosInstance.get(`/products/slug/${slug}`, {
            params: { includeAplus: String(includeAplus) },
        }),

    // GET /api/products/related?productId&categoryId&limit -> { success, products, total }
    // Requires a category: passing productId alone makes the controller look the
    // product up first, so sending categoryId directly saves a query.
    getRelated: ({ productId, categoryId, limit = 4 }) =>
        axiosInstance.get("/products/related", {
            params: { productId, categoryId, limit },
        }),

    // PUT /api/products/:id/view -> { success, viewCount }
    // Fire and forget: a failed view count must never surface to the shopper.
    incrementView: (id) => axiosInstance.put(`/products/${id}/view`),
};

