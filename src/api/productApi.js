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
};
